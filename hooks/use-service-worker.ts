"use client"

import { useState, useEffect } from "react"
import { serviceWorkerManager } from "@/lib/service-worker-utils"

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initServiceWorker = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const supported = serviceWorkerManager.isServiceWorkerEnabled()
        setIsSupported(supported)

        if (supported) {
          const registered = await serviceWorkerManager.register()
          setIsRegistered(registered)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류")
      } finally {
        setIsLoading(false)
      }
    }

    initServiceWorker()
  }, [])

  const getCacheInfo = async () => {
    return await serviceWorkerManager.getCacheInfo()
  }

  const clearCache = async (cacheName: string) => {
    return await serviceWorkerManager.clearCache(cacheName)
  }

  const unregister = async () => {
    const result = await serviceWorkerManager.unregister()
    if (result) {
      setIsRegistered(false)
    }
    return result
  }

  return {
    isSupported,
    isRegistered,
    isLoading,
    error,
    getCacheInfo,
    clearCache,
    unregister,
  }
}
