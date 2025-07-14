// 캐시 버전 및 이름
const CACHE_VERSION = "v2.1"
const STATIC_CACHE = `vehicle-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `vehicle-dynamic-${CACHE_VERSION}`
const API_CACHE = `vehicle-api-${CACHE_VERSION}`
const IMAGE_CACHE = `vehicle-images-${CACHE_VERSION}`

// 캐시 크기 제한 (MB)
const CACHE_SIZE_LIMITS = {
  [STATIC_CACHE]: 50,
  [DYNAMIC_CACHE]: 30,
  [API_CACHE]: 20,
  [IMAGE_CACHE]: 100,
}

// TTL 설정 (초)
const CACHE_TTL = {
  static: 7 * 24 * 60 * 60, // 7일
  dynamic: 24 * 60 * 60, // 1일
  api: 5 * 60, // 5분
  images: 30 * 24 * 60 * 60, // 30일
}

// 정적 리소스 (프리캐싱)
const STATIC_ASSETS = [
  "/",
  "/register",
  "/offline",
  "/manifest.json",
  // 중요한 CSS/JS는 빌드 시 자동 추가됨
]

// 캐시 전략별 URL 패턴
const CACHE_STRATEGIES = {
  cacheFirst: [/\.(css|js|woff2?|ttf|eot)$/, /\/images\//, /\/icons\//],
  networkFirst: [/\/api\/live/, /\/api\/realtime/, /\/api\/notifications/],
  staleWhileRevalidate: [/\/api\/vehicles/, /\/api\/users/, /\/api\/statistics/],
  networkOnly: [/\/api\/auth/, /\/api\/payment/, /\/api\/sensitive/],
}

// Service Worker 설치
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      // 정적 리소스 프리캐싱
      caches
        .open(STATIC_CACHE)
        .then((cache) => {
          return cache.addAll(STATIC_ASSETS)
        }),
      // 이전 버전 정리 준비
      cleanupOldCaches(),
      // 즉시 활성화
      self.skipWaiting(),
    ]),
  )
})

// Service Worker 활성화
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      // 모든 클라이언트 제어
      self.clients.claim(),
      // 캐시 정리
      cleanupOldCaches(),
      // 캐시 크기 제한 적용
      enforceCacheSizeLimits(),
    ]),
  )
})

// 네트워크 요청 처리
self.addEventListener("fetch", (event) => {
  const { request } = event
  const { method, url } = request

  // POST 요청은 캐시하지 않음
  if (method !== "GET") {
    return
  }

  // 전략 선택
  const strategy = selectCacheStrategy(url)

  event.respondWith(handleRequest(request, strategy))
})

// 캐시 전략 선택
function selectCacheStrategy(url) {
  const urlObj = new URL(url)

  // Network Only 확인
  if (CACHE_STRATEGIES.networkOnly.some((pattern) => pattern.test(url))) {
    return "networkOnly"
  }

  // Network First 확인
  if (CACHE_STRATEGIES.networkFirst.some((pattern) => pattern.test(url))) {
    return "networkFirst"
  }

  // Cache First 확인
  if (CACHE_STRATEGIES.cacheFirst.some((pattern) => pattern.test(url))) {
    return "cacheFirst"
  }

  // Stale While Revalidate 확인
  if (CACHE_STRATEGIES.staleWhileRevalidate.some((pattern) => pattern.test(url))) {
    return "staleWhileRevalidate"
  }

  // 기본값
  return "networkFirst"
}

// 요청 처리
async function handleRequest(request, strategy) {
  const cacheName = getCacheName(request.url)

  switch (strategy) {
    case "cacheFirst":
      return cacheFirst(request, cacheName)

    case "networkFirst":
      return networkFirst(request, cacheName)

    case "staleWhileRevalidate":
      return staleWhileRevalidate(request, cacheName)

    case "networkOnly":
      return networkOnly(request)

    default:
      return networkFirst(request, cacheName)
  }
}

// Cache First 전략
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)

    if (cachedResponse && !isExpired(cachedResponse)) {
      // 백그라운드에서 업데이트
      updateCacheInBackground(request, cache)
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      await storeInCache(cache, request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    return cachedResponse || createErrorResponse()
  }
}

// Network First 전략
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      await storeInCache(cache, request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)

    if (cachedResponse && !isExpired(cachedResponse)) {
      return cachedResponse
    }

    return createErrorResponse()
  }
}

// Stale While Revalidate 전략
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)

  // 백그라운드에서 업데이트
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        storeInCache(cache, request, response.clone())
      }
      return response
    })
    .catch(() => {})

  // 캐시된 응답이 있고 만료되지 않았으면 반환
  if (cachedResponse && !isExpired(cachedResponse)) {
    return cachedResponse
  }

  // 그렇지 않으면 네트워크 응답 대기
  try {
    return await networkPromise
  } catch (error) {
    return cachedResponse || createErrorResponse()
  }
}

// Network Only 전략
async function networkOnly(request) {
  return fetch(request)
}

// 캐시 이름 결정
function getCacheName(url) {
  if (url.includes("/api/")) {
    return API_CACHE
  }
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    return IMAGE_CACHE
  }
  if (url.match(/\.(css|js|woff2?|ttf|eot)$/)) {
    return STATIC_CACHE
  }
  return DYNAMIC_CACHE
}

// 캐시에 저장
async function storeInCache(cache, request, response) {
  // TTL 헤더 추가
  const responseWithTTL = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...response.headers,
      "sw-cached-at": Date.now().toString(),
    },
  })

  await cache.put(request, responseWithTTL)
}

// 만료 확인
function isExpired(response) {
  const cachedAt = response.headers.get("sw-cached-at")
  if (!cachedAt) return false

  const cachedTime = Number.parseInt(cachedAt)
  const now = Date.now()
  const url = response.url

  let ttl = CACHE_TTL.dynamic // 기본값

  if (url.includes("/api/")) {
    ttl = CACHE_TTL.api
  } else if (url.match(/\.(css|js|woff2?|ttf|eot)$/)) {
    ttl = CACHE_TTL.static
  } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
    ttl = CACHE_TTL.images
  }

  return now - cachedTime > ttl * 1000
}

// 백그라운드 캐시 업데이트
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      await storeInCache(cache, request, response)
    }
  } catch (error) {
    console.log("Background update failed:", error)
  }
}

// 오류 응답 생성
function createErrorResponse() {
  return new Response("Network error", {
    status: 408,
    statusText: "Request Timeout",
  })
}

// 이전 캐시 정리
async function cleanupOldCaches() {
  const cacheNames = await caches.keys()
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE]

  return Promise.all(
    cacheNames
      .filter((cacheName) => !currentCaches.includes(cacheName))
      .map((cacheName) => {
        console.log("Deleting old cache:", cacheName)
        return caches.delete(cacheName)
      }),
  )
}

// 캐시 크기 제한 적용
async function enforceCacheSizeLimits() {
  for (const [cacheName, limitMB] of Object.entries(CACHE_SIZE_LIMITS)) {
    try {
      await limitCacheSize(cacheName, limitMB)
    } catch (error) {
      console.error(`Failed to limit cache ${cacheName}:`, error)
    }
  }
}

// 캐시 크기 제한
async function limitCacheSize(cacheName, limitMB) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()

  let totalSize = 0
  const entries = []

  // 각 항목의 크기와 시간 계산
  for (const key of keys) {
    const response = await cache.match(key)
    if (response) {
      const size = await getResponseSize(response)
      const cachedAt = response.headers.get("sw-cached-at") || "0"

      entries.push({
        key,
        size,
        cachedAt: Number.parseInt(cachedAt),
      })

      totalSize += size
    }
  }

  // 크기 제한 초과 시 오래된 항목부터 삭제
  if (totalSize > limitMB * 1024 * 1024) {
    entries.sort((a, b) => a.cachedAt - b.cachedAt)

    for (const entry of entries) {
      await cache.delete(entry.key)
      totalSize -= entry.size

      if (totalSize <= limitMB * 1024 * 1024 * 0.8) {
        // 80%까지 줄임
        break
      }
    }
  }
}

// 응답 크기 계산
async function getResponseSize(response) {
  const responseClone = response.clone()
  const buffer = await responseClone.arrayBuffer()
  return buffer.byteLength
}

// 주기적 캐시 정리 (24시간마다)
setInterval(
  () => {
    enforceCacheSizeLimits()
    cleanupExpiredEntries()
  },
  24 * 60 * 60 * 1000,
)

// 만료된 항목 정리
async function cleanupExpiredEntries() {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE]

  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()

      for (const key of keys) {
        const response = await cache.match(key)
        if (response && isExpired(response)) {
          await cache.delete(key)
        }
      }
    } catch (error) {
      console.error(`Failed to cleanup expired entries in ${cacheName}:`, error)
    }
  }
}

// 백그라운드 동기화
self.addEventListener("sync", (event) => {
  if (event.tag === "vehicle-registration") {
    event.waitUntil(syncVehicleRegistrations())
  } else if (event.tag === "cache-cleanup") {
    event.waitUntil(enforceCacheSizeLimits())
  }
})

// 메시지 처리 (클라이언트에서 캐시 관리 요청)
self.addEventListener("message", (event) => {
  const { type, data } = event.data

  switch (type) {
    case "GET_CACHE_INFO":
      getCacheInfo().then((info) => {
        event.ports[0].postMessage({ type: "CACHE_INFO", data: info })
      })
      break

    case "CLEAR_CACHE":
      clearSpecificCache(data.cacheName).then(() => {
        event.ports[0].postMessage({ type: "CACHE_CLEARED" })
      })
      break

    case "FORCE_CACHE_UPDATE":
      forceCacheUpdate(data.url).then(() => {
        event.ports[0].postMessage({ type: "CACHE_UPDATED" })
      })
      break
  }
})

// 캐시 정보 수집
async function getCacheInfo() {
  const cacheNames = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE, IMAGE_CACHE]
  const info = {}

  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()

      let totalSize = 0
      const itemCount = keys.length

      for (const key of keys.slice(0, 10)) {
        // 처음 10개만 크기 계산
        const response = await cache.match(key)
        if (response) {
          totalSize += await getResponseSize(response)
        }
      }

      info[cacheName] = {
        itemCount,
        estimatedSize: totalSize * (itemCount / Math.min(10, itemCount)),
      }
    } catch (error) {
      info[cacheName] = { error: error.message }
    }
  }

  return info
}

// 특정 캐시 정리
async function clearSpecificCache(cacheName) {
  return caches.delete(cacheName)
}

// 강제 캐시 업데이트
async function forceCacheUpdate(url) {
  const cacheName = getCacheName(url)
  const cache = await caches.open(cacheName)

  try {
    const response = await fetch(url, { cache: "no-cache" })
    if (response.ok) {
      await storeInCache(cache, new Request(url), response)
    }
  } catch (error) {
    console.error("Force update failed:", error)
  }
}

// 차량 등록 동기화 (기존 함수 유지)
async function syncVehicleRegistrations() {
  try {
    const registrations = await getOfflineRegistrations()
    for (const registration of registrations) {
      await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registration),
      })
    }
    await clearOfflineRegistrations()
  } catch (error) {
    console.error("동기화 실패:", error)
  }
}

const CACHE_NAME = "zcm-v1"
const urlsToCache = ["/", "/register", "/manifest.json", "/offline"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// 백그라운드 동기화
// self.addEventListener("sync", (event) => {
//   if (event.tag === "vehicle-registration") {
//     event.waitUntil(syncVehicleRegistrations())
//   }
// })

// async function syncVehicleRegistrations() {
//   try {
//     const registrations = await getOfflineRegistrations()
//     for (const registration of registrations) {
//       await fetch("/api/vehicles", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(registration),
//       })
//     }
//     await clearOfflineRegistrations()
//   } catch (error) {
//     console.error("동기화 실패:", error)
//   }
// }

async function getOfflineRegistrations() {
  return JSON.parse(localStorage.getItem("offlineRegistrations") || "[]")
}

async function clearOfflineRegistrations() {
  localStorage.removeItem("offlineRegistrations")
}
