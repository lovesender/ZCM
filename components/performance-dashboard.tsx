"use client"

import { memo, useEffect, useState } from "react"
import { usePerformanceMetrics } from "@/hooks/use-optimized-performance"
import { advancedCacheManager } from "@/lib/advanced-cache-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default memo(function PerformanceDashboard() {
  const metrics = usePerformanceMetrics()
  const [cacheStats, setCacheStats] = useState(advancedCacheManager.getStats())
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(advancedCacheManager.getStats())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // 개발 모드에서만 표시
  if (process.env.NODE_ENV !== "development") return null

  const getPerformanceColor = (value: number, thresholds: [number, number]) => {
    if (value <= thresholds[0]) return "text-green-600"
    if (value <= thresholds[1]) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 mb-2"
      >
        ⚡
      </button>

      {isVisible && (
        <Card className="w-80 bg-white/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              🚀 성능 대시보드
              <Badge variant="outline" className="text-xs">
                실시간
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 렌더링 성능 */}
            {metrics && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">렌더링 성능</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">렌더 시간:</span>
                    <span className={`ml-1 font-mono ${getPerformanceColor(metrics.renderTime, [50, 100])}`}>
                      {metrics.renderTime}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">FPS:</span>
                    <span className={`ml-1 font-mono ${getPerformanceColor(60 - metrics.fps, [5, 15])}`}>
                      {metrics.fps}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">컴포넌트:</span>
                    <span className="ml-1 font-mono">{metrics.componentCount}</span>
                  </div>
                  {metrics.memoryUsage && (
                    <div>
                      <span className="text-gray-600">메모리:</span>
                      <span className={`ml-1 font-mono ${getPerformanceColor(metrics.memoryUsage, [50, 100])}`}>
                        {metrics.memoryUsage}MB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 캐시 성능 */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">캐시 성능</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>적중률</span>
                  <span className={`font-mono ${getPerformanceColor(100 - cacheStats.hitRate, [20, 50])}`}>
                    {cacheStats.hitRate}%
                  </span>
                </div>
                <Progress value={cacheStats.hitRate} className="h-2" />

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">적중:</span>
                    <span className="ml-1 font-mono text-green-600">{cacheStats.hits}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">실패:</span>
                    <span className="ml-1 font-mono text-red-600">{cacheStats.misses}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">제거:</span>
                    <span className="ml-1 font-mono text-yellow-600">{cacheStats.evictions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">메모리:</span>
                    <span className="ml-1 font-mono">{cacheStats.memoryUsage}MB</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs">
                  <span>사용량</span>
                  <span className="font-mono">
                    {cacheStats.size}/{cacheStats.maxSize}
                  </span>
                </div>
                <Progress value={(cacheStats.size / cacheStats.maxSize) * 100} className="h-2" />
              </div>
            </div>

            {/* 제어 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  advancedCacheManager.clear()
                  console.log("캐시 초기화됨")
                }}
                className="flex-1 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
              >
                캐시 초기화
              </button>
              <button
                onClick={() => {
                  advancedCacheManager.optimize()
                  console.log("캐시 최적화됨")
                }}
                className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
              >
                최적화
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
})
