"use client"

import { useEffect, useState } from "react"
import { useMemoryMonitor } from "@/hooks/use-performance"
import { cacheManager } from "@/lib/cache-manager"

interface PerformanceMetrics {
  loadTime: number
  renderTime: number
  memoryUsage?: {
    used: number
    total: number
    limit: number
  }
  cacheStats: {
    size: number
    maxSize: number
    hitRate?: number
  }
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const checkMemory = useMemoryMonitor()

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Only run in development mode and on client
    if (process.env.NODE_ENV !== "development" || !isClient) return

    const measurePerformance = () => {
      try {
        const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming
        if (!navigation) return

        const loadTime = navigation.loadEventEnd - navigation.fetchStart
        const renderTime = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
        const memoryUsage = checkMemory()
        const cacheStats = cacheManager.getStats()

        setMetrics({
          loadTime: Math.round(loadTime),
          renderTime: Math.round(renderTime),
          memoryUsage,
          cacheStats,
        })
      } catch (error) {
        console.warn("Performance monitoring failed:", error)
      }
    }

    // Wait for page to fully load
    if (document.readyState === "complete") {
      measurePerformance()
    } else {
      const handleLoad = () => {
        measurePerformance()
      }
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }
  }, [isClient, checkMemory])

  // 주기적 업데이트 (5초마다)
  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !isClient) return

    const interval = setInterval(() => {
      const memoryUsage = checkMemory()
      const cacheStats = cacheManager.getStats()

      setMetrics((prev) =>
        prev
          ? {
              ...prev,
              memoryUsage,
              cacheStats,
            }
          : null,
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [isClient, checkMemory])

  // Only show in development and on client
  if (process.env.NODE_ENV !== "development" || !isClient || !metrics) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black bg-opacity-80 text-white p-2 rounded-lg text-xs font-mono mb-2 hover:bg-opacity-90"
      >
        📊 성능
      </button>

      {isVisible && (
        <div className="bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs font-mono space-y-2 min-w-[200px]">
          <div className="font-bold text-green-400">⚡ 성능 지표</div>

          <div className="space-y-1">
            <div>Load: {metrics.loadTime}ms</div>
            <div>Render: {metrics.renderTime}ms</div>
          </div>

          {metrics.memoryUsage && (
            <div className="space-y-1 border-t border-gray-600 pt-2">
              <div className="font-bold text-blue-400">🧠 메모리</div>
              <div>Used: {metrics.memoryUsage.used}MB</div>
              <div>Total: {metrics.memoryUsage.total}MB</div>
              <div>Limit: {metrics.memoryUsage.limit}MB</div>
            </div>
          )}

          <div className="space-y-1 border-t border-gray-600 pt-2">
            <div className="font-bold text-yellow-400">💾 캐시</div>
            <div>
              Items: {metrics.cacheStats.size}/{metrics.cacheStats.maxSize}
            </div>
            <div>Usage: {Math.round((metrics.cacheStats.size / metrics.cacheStats.maxSize) * 100)}%</div>
          </div>

          <button
            onClick={() => {
              cacheManager.invalidate()
              console.log("Cache cleared")
            }}
            className="w-full mt-2 px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            캐시 초기화
          </button>
        </div>
      )}
    </div>
  )
}
