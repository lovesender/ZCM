"use client"

import { memo, useMemo, useState, useCallback, useEffect, useRef } from "react"
import { VariableSizeList as List } from "react-window"
import { useOptimizedDebounce, useRAFThrottle, useBatchedUpdates } from "@/hooks/use-optimized-performance"
import { advancedCacheManager } from "@/lib/advanced-cache-manager"
import { PERFORMANCE_CONFIG } from "@/app/config/performance"
import VehicleCard from "./vehicle-card"
import LoadingSpinner from "./ui/loading-spinner"

interface Vehicle {
  id: number
  name: string
  phone: string
  carNumber: string
  carModel: string
  carType: string
  branch: string
  church: string
  department: string
  status: "완료" | "대기" | "거부"
  registeredAt: string
  approvedAt: string | null
  notes: string
}

interface UltraOptimizedVehicleListProps {
  vehicles: Vehicle[]
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  searchTerm?: string
  filters?: Record<string, any>
}

// 동적 높이 계산을 위한 아이템 높이 캐시
const itemHeightCache = new Map<number, number>()

// 메모화된 차량 카드 (더 세밀한 비교)
const UltraOptimizedVehicleCard = memo(VehicleCard, (prevProps, nextProps) => {
  return (
    prevProps.vehicle.id === nextProps.vehicle.id &&
    prevProps.vehicle.status === nextProps.vehicle.status &&
    prevProps.vehicle.carNumber === nextProps.vehicle.carNumber
  )
})

// 가상화된 리스트 아이템 (동적 높이 지원)
const VariableVehicleListItem = memo(({ index, style, data }: any) => {
  const itemRef = useRef<HTMLDivElement>(null)
  const { vehicles, onViewDetails, setItemHeight } = data
  const vehicle = vehicles[index]

  // 높이 측정 및 캐싱
  useEffect(() => {
    if (itemRef.current) {
      const height = itemRef.current.offsetHeight
      if (height > 0 && itemHeightCache.get(index) !== height) {
        itemHeightCache.set(index, height)
        setItemHeight(index, height)
      }
    }
  })

  return (
    <div style={style} ref={itemRef} className="px-2 py-1">
      <UltraOptimizedVehicleCard vehicle={vehicle} onViewDetails={() => onViewDetails(vehicle)} />
    </div>
  )
})

VariableVehicleListItem.displayName = "VariableVehicleListItem"

export default memo(function UltraOptimizedVehicleList({
  vehicles,
  onLoadMore,
  hasMore = false,
  loading = false,
  searchTerm = "",
  filters = {},
}: UltraOptimizedVehicleListProps) {
  const listRef = useRef<any>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [itemHeights, setItemHeights] = useBatchedUpdates<Map<number, number>>(new Map())

  // 캐시 키 생성
  const cacheKey = useMemo(() => {
    return `filtered-vehicles-${JSON.stringify({ searchTerm, filters })}`
  }, [searchTerm, filters])

  // 초고속 디바운스된 검색 (선행/후행 모두 지원)
  const debouncedSearch = useOptimizedDebounce(
    (term: string) => {
      console.log("Ultra-fast search:", term)
    },
    PERFORMANCE_CONFIG.DEBOUNCE.SEARCH,
    { leading: true, trailing: true, maxWait: 500 },
  )

  // RAF 기반 스크롤 핸들러
  const handleScroll = useRAFThrottle(
    useCallback(
      (scrollTop: number) => {
        // 스크롤 위치 기반 프리페칭
        const visibleStart = Math.floor(scrollTop / PERFORMANCE_CONFIG.VIRTUALIZATION.ITEM_HEIGHT)
        const prefetchStart = Math.max(0, visibleStart - 5)
        const prefetchEnd = Math.min(vehicles.length, visibleStart + 25)

        // 백그라운드에서 다음 데이터 프리페치
        for (let i = prefetchStart; i < prefetchEnd; i++) {
          const vehicle = vehicles[i]
          if (vehicle) {
            advancedCacheManager.prefetch(
              `vehicle-detail-${vehicle.id}`,
              () => Promise.resolve(vehicle),
              PERFORMANCE_CONFIG.CACHE.VEHICLE_LIST_TTL,
            )
          }
        }
      },
      [vehicles],
    ),
  )

  // 지능형 필터링 (캐시 활용)
  const filteredVehicles = useMemo(() => {
    // 캐시에서 확인
    const cached = advancedCacheManager.get<Vehicle[]>(cacheKey)
    if (cached) {
      return cached
    }

    let result = vehicles

    // 검색어 필터링 (정규식 사용으로 성능 향상)
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      result = result.filter(
        (vehicle) =>
          searchRegex.test(vehicle.name) || searchRegex.test(vehicle.carNumber) || searchRegex.test(vehicle.carModel),
      )
    }

    // 필터 적용 (배치 처리)
    const filterEntries = Object.entries(filters).filter(([, value]) => value && value !== "all")
    if (filterEntries.length > 0) {
      result = result.filter((vehicle) =>
        filterEntries.every(([key, value]) => vehicle[key as keyof Vehicle] === value),
      )
    }

    // 결과 캐싱
    advancedCacheManager.set(cacheKey, result, PERFORMANCE_CONFIG.CACHE.VEHICLE_LIST_TTL)

    return result
  }, [vehicles, searchTerm, filters, cacheKey])

  // 동적 높이 계산
  const getItemHeight = useCallback(
    (index: number) => {
      return itemHeights.get(index) || PERFORMANCE_CONFIG.VIRTUALIZATION.ITEM_HEIGHT
    },
    [itemHeights],
  )

  // 높이 업데이트 핸들러
  const setItemHeight = useCallback(
    (index: number, height: number) => {
      setItemHeights((prev) => {
        const newMap = new Map(prev)
        newMap.set(index, height)
        return newMap
      })

      // 리스트 다시 계산
      if (listRef.current) {
        listRef.current.resetAfterIndex(index)
      }
    },
    [setItemHeights],
  )

  // 검색어 변경 시 처리
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  // 필터 변경 시 캐시 무효화
  useEffect(() => {
    advancedCacheManager.invalidatePattern(`filtered-vehicles-.*`)
  }, [filters])

  const handleViewDetails = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)

    // 상세 정보 백그라운드 로딩
    advancedCacheManager.refreshInBackground(`vehicle-detail-${vehicle.id}`, () =>
      fetch(`/api/vehicles/${vehicle.id}`).then((res) => res.json()),
    )
  }, [])

  // 가상화를 위한 데이터 준비
  const itemData = useMemo(
    () => ({
      vehicles: filteredVehicles,
      onViewDetails: handleViewDetails,
      setItemHeight,
    }),
    [filteredVehicles, handleViewDetails, setItemHeight],
  )

  // 리스트 높이 계산 (동적)
  const listHeight = useMemo(() => {
    if (filteredVehicles.length === 0) return 200

    const estimatedHeight = filteredVehicles.length * PERFORMANCE_CONFIG.VIRTUALIZATION.ITEM_HEIGHT
    return Math.min(estimatedHeight, 600)
  }, [filteredVehicles.length])

  // 가상화 임계값 확인
  const shouldVirtualize = filteredVehicles.length >= PERFORMANCE_CONFIG.VIRTUALIZATION.THRESHOLD

  if (loading && filteredVehicles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">초고속 로딩 중...</span>
      </div>
    )
  }

  if (filteredVehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">조건에 맞는 차량이 없습니다.</p>
        {searchTerm && <p className="text-gray-400 mt-2">검색어: "{searchTerm}"</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 성능 정보 표시 (개발 모드) */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          가상화: {shouldVirtualize ? "활성" : "비활성"} | 항목: {filteredVehicles.length} | 캐시:{" "}
          {advancedCacheManager.getStats().hitRate}% 적중률
        </div>
      )}

      {/* 조건부 가상화 리스트 */}
      <div className="border rounded-lg overflow-hidden">
        {shouldVirtualize ? (
          <List
            ref={listRef}
            height={listHeight}
            itemCount={filteredVehicles.length}
            itemSize={getItemHeight}
            itemData={itemData}
            overscanCount={PERFORMANCE_CONFIG.VIRTUALIZATION.OVERSCAN}
            onScroll={({ scrollTop }) => handleScroll(scrollTop)}
          >
            {VariableVehicleListItem}
          </List>
        ) : (
          // 작은 목록은 일반 렌더링 (더 빠름)
          <div className="max-h-96 overflow-y-auto">
            {filteredVehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="px-2 py-1">
                <UltraOptimizedVehicleCard vehicle={vehicle} onViewDetails={() => handleViewDetails(vehicle)} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 지능형 무한 스크롤 */}
      {hasMore && (
        <div className="flex justify-center py-4">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <button
              onClick={onLoadMore}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              더 보기
            </button>
          )}
        </div>
      )}
    </div>
  )
})
