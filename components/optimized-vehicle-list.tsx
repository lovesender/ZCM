"use client"

import { memo, useMemo, useState, useCallback, useEffect } from "react"
import { FixedSizeList as List } from "react-window"
import { useDebounce, useIntersectionObserver } from "@/hooks/use-performance"
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

interface OptimizedVehicleListProps {
  vehicles: Vehicle[]
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  searchTerm?: string
  filters?: Record<string, any>
}

// 메모화된 차량 카드 컴포넌트
const MemoizedVehicleCard = memo(VehicleCard)

// 가상화된 리스트 아이템 렌더러
const VehicleListItem = memo(({ index, style, data }: any) => {
  const vehicle = data.vehicles[index]
  const onViewDetails = data.onViewDetails

  return (
    <div style={style} className="px-2 py-1">
      <MemoizedVehicleCard vehicle={vehicle} onViewDetails={() => onViewDetails(vehicle)} />
    </div>
  )
})

VehicleListItem.displayName = "VehicleListItem"

export default function OptimizedVehicleList({
  vehicles,
  onLoadMore,
  hasMore = false,
  loading = false,
  searchTerm = "",
  filters = {},
}: OptimizedVehicleListProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // 디바운스된 검색
  const debouncedSearch = useDebounce((term: string) => {
    // 검색 로직 실행
    console.log("Searching for:", term)
  }, PERFORMANCE_CONFIG.DEBOUNCE.SEARCH)

  // 필터링된 차량 목록 (메모화)
  const filteredVehicles = useMemo(() => {
    let result = vehicles

    // 검색어 필터링
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(term) ||
          vehicle.carNumber.toLowerCase().includes(term) ||
          vehicle.carModel.toLowerCase().includes(term),
      )
    }

    // 추가 필터 적용
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        result = result.filter((vehicle) => vehicle[key as keyof Vehicle] === value)
      }
    })

    return result
  }, [vehicles, searchTerm, filters])

  // 무한 스크롤을 위한 교차점 관찰자
  const loadMoreRef = useIntersectionObserver(
    useCallback(() => {
      if (hasMore && !loading && onLoadMore) {
        onLoadMore()
      }
    }, [hasMore, loading, onLoadMore]),
    { threshold: 0.1 },
  )

  // 검색어 변경 시 디바운스된 검색 실행
  useEffect(() => {
    debouncedSearch(searchTerm)
  }, [searchTerm, debouncedSearch])

  const handleViewDetails = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
  }, [])

  // 가상화를 위한 데이터 준비
  const itemData = useMemo(
    () => ({
      vehicles: filteredVehicles,
      onViewDetails: handleViewDetails,
    }),
    [filteredVehicles, handleViewDetails],
  )

  // 리스트 높이 계산
  const listHeight = Math.min(
    filteredVehicles.length * PERFORMANCE_CONFIG.VIRTUALIZATION.ITEM_HEIGHT,
    600, // 최대 높이
  )

  if (loading && filteredVehicles.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
        <span className="ml-3 text-gray-600">차량 목록을 불러오는 중...</span>
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
      {/* 가상화된 리스트 */}
      <div className="border rounded-lg overflow-hidden">
        <List
          height={listHeight}
          itemCount={filteredVehicles.length}
          itemSize={PERFORMANCE_CONFIG.VIRTUALIZATION.ITEM_HEIGHT}
          itemData={itemData}
          overscanCount={PERFORMANCE_CONFIG.VIRTUALIZATION.OVERSCAN}
        >
          {VehicleListItem}
        </List>
      </div>

      {/* 무한 스크롤 로더 */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {loading ? <LoadingSpinner /> : <p className="text-gray-500">더 많은 차량을 불러오려면 스크롤하세요</p>}
        </div>
      )}
    </div>
  )
}
