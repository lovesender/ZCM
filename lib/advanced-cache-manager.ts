"use client"

import { PERFORMANCE_CONFIG } from "@/app/config/performance"

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
  size: number
}

interface CacheStats {
  hits: number
  misses: number
  evictions: number
  totalSize: number
}

class AdvancedCacheManager {
  private cache = new Map<string, CacheItem<any>>()
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, totalSize: 0 }
  private maxSize = PERFORMANCE_CONFIG.CACHE.MAX_CACHE_SIZE
  private maxMemory = 50 * 1024 * 1024 // 50MB

  // LRU + LFU 하이브리드 캐시
  set<T>(key: string, data: T, ttl: number = PERFORMANCE_CONFIG.CACHE.VEHICLE_LIST_TTL): void {
    const size = this.calculateSize(data)

    // 메모리 제한 확인
    if (this.stats.totalSize + size > this.maxMemory) {
      this.evictByMemory(size)
    }

    // 항목 수 제한 확인
    if (this.cache.size >= this.maxSize) {
      this.evictLeastValuable()
    }

    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessCount: 1,
      lastAccessed: now,
      size,
    })

    this.stats.totalSize += size
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      this.stats.misses++
      return null
    }

    const now = Date.now()

    // TTL 확인
    if (now - item.timestamp > item.ttl) {
      this.delete(key)
      this.stats.misses++
      return null
    }

    // 액세스 정보 업데이트
    item.accessCount++
    item.lastAccessed = now

    this.stats.hits++
    return item.data
  }

  // 지능형 프리페칭
  prefetch<T>(key: string, dataLoader: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key)
    if (cached) {
      return Promise.resolve(cached)
    }

    return dataLoader().then((data) => {
      this.set(key, data, ttl)
      return data
    })
  }

  // 백그라운드 새로고침
  refreshInBackground<T>(key: string, dataLoader: () => Promise<T>, ttl?: number): void {
    dataLoader()
      .then((data) => this.set(key, data, ttl))
      .catch((error) => console.warn("Background refresh failed:", error))
  }

  // 패턴 기반 무효화
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern
    let count = 0

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key)
        count++
      }
    }

    return count
  }

  // 조건부 무효화
  invalidateWhere<T>(predicate: (key: string, item: CacheItem<T>) => boolean): number {
    let count = 0

    for (const [key, item] of this.cache.entries()) {
      if (predicate(key, item)) {
        this.delete(key)
        count++
      }
    }

    return count
  }

  private delete(key: string): boolean {
    const item = this.cache.get(key)
    if (item) {
      this.stats.totalSize -= item.size
      this.cache.delete(key)
      return true
    }
    return false
  }

  // 메모리 기반 제거
  private evictByMemory(requiredSize: number): void {
    const entries = Array.from(this.cache.entries())

    // 크기 대비 가치가 낮은 항목부터 제거
    entries.sort(([, a], [, b]) => {
      const valueA = a.accessCount / (a.size / 1024) // 액세스 수 / KB
      const valueB = b.accessCount / (b.size / 1024)
      return valueA - valueB
    })

    let freedSize = 0
    for (const [key] of entries) {
      if (freedSize >= requiredSize) break

      const item = this.cache.get(key)
      if (item) {
        freedSize += item.size
        this.delete(key)
        this.stats.evictions++
      }
    }
  }

  // 가장 가치 없는 항목 제거 (LRU + LFU)
  private evictLeastValuable(): void {
    const entries = Array.from(this.cache.entries())
    const now = Date.now()

    // 점수 계산: 최근성 + 빈도
    entries.sort(([, a], [, b]) => {
      const scoreA = a.accessCount * Math.exp(-(now - a.lastAccessed) / 60000) // 1분 반감기
      const scoreB = b.accessCount * Math.exp(-(now - b.lastAccessed) / 60000)
      return scoreA - scoreB
    })

    const [keyToEvict] = entries[0]
    this.delete(keyToEvict)
    this.stats.evictions++
  }

  private calculateSize(data: any): number {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return 1024 // 기본값 1KB
    }
  }

  // 캐시 워밍
  warmup<T>(entries: Array<{ key: string; loader: () => Promise<T>; ttl?: number }>): Promise<void> {
    const promises = entries.map(
      ({ key, loader, ttl }) => this.prefetch(key, loader, ttl).catch(() => {}), // 에러 무시
    )

    return Promise.all(promises).then(() => {})
  }

  // 통계 및 상태
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100),
      size: this.cache.size,
      maxSize: this.maxSize,
      memoryUsage: Math.round((this.stats.totalSize / 1024 / 1024) * 100) / 100, // MB
      maxMemory: Math.round(this.maxMemory / 1024 / 1024), // MB
    }
  }

  // 캐시 최적화
  optimize(): void {
    const now = Date.now()

    // 만료된 항목 정리
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.delete(key)
      }
    }

    // 사용되지 않는 항목 정리 (1시간 이상 미사용)
    this.invalidateWhere((key, item) => now - item.lastAccessed > 60 * 60 * 1000)
  }

  clear(): void {
    this.cache.clear()
    this.stats = { hits: 0, misses: 0, evictions: 0, totalSize: 0 }
  }
}

export const advancedCacheManager = new AdvancedCacheManager()

// 주기적 최적화 (5분마다)
if (typeof window !== "undefined") {
  setInterval(
    () => {
      advancedCacheManager.optimize()
    },
    5 * 60 * 1000,
  )
}
