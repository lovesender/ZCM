"use client"

import { memo, Suspense, lazy, useState, useEffect, useCallback } from "react"
import { cacheManager } from "@/lib/cache-manager"
import { PERFORMANCE_CONFIG } from "@/app/config/performance"
import LoadingSpinner from "./ui/loading-spinner"
import ErrorBoundary from "./error-boundary"

// 지연 로딩 컴포넌트들
const LazyStatisticsCards = lazy(() => import("./statistics-cards"))
const LazyVehicleChart = lazy(() => import("./vehicle-chart"))
const LazyRecentActivity = lazy(() => import("./recent-activity"))
const LazyQuickActions = lazy(() => import("./quick-actions"))

interface DashboardData {
  statistics: any
  recentVehicles: any[]
  chartData: any
}

export default memo(function PerformanceOptimizedDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 데이터 로딩 함수
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 캐시에서 데이터 확인
      const cachedData = cacheManager.get<DashboardData>("dashboard-data")
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }

      // 병렬로 데이터 로딩
      const [statistics, recentVehicles, chartData] = await Promise.all([
        fetch("/api/statistics").then((res) => res.json()),
        fetch("/api/vehicles/recent").then((res) => res.json()),
        fetch("/api/charts/vehicles").then((res) => res.json()),
      ])

      const dashboardData: DashboardData = {
        statistics,
        recentVehicles,
        chartData,
      }

      // 캐시에 저장
      cacheManager.set("dashboard-data", dashboardData, PERFORMANCE_CONFIG.CACHE.STATISTICS_TTL)

      setData(dashboardData)
    } catch (err) {
      setError("대시보드 데이터를 불러오는데 실패했습니다.")
      console.error("Dashboard loading error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // 컴포넌트 마운트 시 데이터 로딩
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // 주기적 데이터 갱신 (5분마다)
  useEffect(() => {
    const interval = setInterval(
      () => {
        cacheManager.invalidate("dashboard-data")
        loadDashboardData()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [loadDashboardData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">대시보드를 불러오는 중...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={loadDashboardData} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          다시 시도
        </button>
      </div>
    )
  }

  if (!data) {
    return <div>데이터가 없습니다.</div>
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드들 */}
      <ErrorBoundary fallback={<div>통계 로딩 실패</div>}>
        <Suspense fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
          <LazyStatisticsCards data={data.statistics} />
        </Suspense>
      </ErrorBoundary>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 차트 */}
        <ErrorBoundary fallback={<div>차트 로딩 실패</div>}>
          <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
            <LazyVehicleChart data={data.chartData} />
          </Suspense>
        </ErrorBoundary>

        {/* 최근 활동 */}
        <ErrorBoundary fallback={<div>활동 로딩 실패</div>}>
          <Suspense fallback={<div className="h-64 bg-gray-100 rounded animate-pulse" />}>
            <LazyRecentActivity data={data.recentVehicles} />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* 빠른 작업 */}
      <ErrorBoundary fallback={<div>빠른 작업 로딩 실패</div>}>
        <Suspense fallback={<div className="h-24 bg-gray-100 rounded animate-pulse" />}>
          <LazyQuickActions />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
})
