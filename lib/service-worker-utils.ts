// Service Worker 유틸리티 함수들

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private isEnabled = false
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {
    this.checkEnvironment()
  }

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  private checkEnvironment(): void {
    if (typeof window === "undefined") return

    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.includes("lite.vusercontent.net") ||
      window.location.hostname.includes("vercel.app") ||
      process.env.NODE_ENV === "development"

    this.isEnabled = !isDevelopment && "serviceWorker" in navigator
  }

  async register(): Promise<boolean> {
    if (!this.isEnabled) {
      console.log("Service Worker가 비활성화되어 있습니다.")
      return false
    }

    try {
      // Service Worker 파일 존재 및 MIME 타입 확인
      const response = await fetch("/sw.js", { method: "HEAD" })

      if (!response.ok) {
        throw new Error("Service Worker 파일을 찾을 수 없습니다.")
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("javascript")) {
        throw new Error("Service Worker 파일의 MIME 타입이 올바르지 않습니다.")
      }

      // 등록 시도
      this.registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })

      console.log("Service Worker 등록 성공:", this.registration)
      return true
    } catch (error) {
      console.warn("Service Worker 등록 실패:", error)
      return false
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) return false

    try {
      const result = await this.registration.unregister()
      console.log("Service Worker 등록 해제:", result)
      return result
    } catch (error) {
      console.error("Service Worker 등록 해제 실패:", error)
      return false
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration
  }

  isServiceWorkerEnabled(): boolean {
    return this.isEnabled
  }

  // 캐시 관리 메서드들
  async getCacheInfo(): Promise<any> {
    if (!this.isEnabled || !this.registration) {
      return { error: "Service Worker가 활성화되지 않았습니다." }
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === "CACHE_INFO") {
          resolve(event.data.data)
        }
      }

      this.registration?.active?.postMessage({ type: "GET_CACHE_INFO" }, [messageChannel.port2])

      // 타임아웃 설정
      setTimeout(() => {
        resolve({ error: "응답 시간 초과" })
      }, 5000)
    })
  }

  async clearCache(cacheName: string): Promise<boolean> {
    if (!this.isEnabled || !this.registration) {
      return false
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel()

      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === "CACHE_CLEARED") {
          resolve(true)
        }
      }

      this.registration?.active?.postMessage({ type: "CLEAR_CACHE", data: { cacheName } }, [messageChannel.port2])

      setTimeout(() => resolve(false), 5000)
    })
  }
}

// 전역 인스턴스
export const serviceWorkerManager = ServiceWorkerManager.getInstance()
