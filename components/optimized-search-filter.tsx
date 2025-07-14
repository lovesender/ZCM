"use client"

import { memo, useState, useCallback, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X } from "lucide-react"
import { useDebounce } from "@/hooks/use-performance"
import { PERFORMANCE_CONFIG } from "@/app/config/performance"
import { BRANCHES } from "@/app/config/branches"

interface FilterState {
  search: string
  status: string
  branch: string
  carType: string
  dateRange: string
}

interface OptimizedSearchFilterProps {
  onFilterChange: (filters: FilterState) => void
  totalCount: number
  filteredCount: number
}

const STATUSES = [
  { value: "all", label: "전체 상태" },
  { value: "완료", label: "승인 완료" },
  { value: "대기", label: "검토 중" },
  { value: "거부", label: "승인 거부" },
]

const CAR_TYPES = [
  { value: "all", label: "전체 차종" },
  { value: "승용차", label: "승용차" },
  { value: "SUV", label: "SUV" },
  { value: "트럭", label: "트럭" },
  { value: "밴", label: "밴" },
]

const DATE_RANGES = [
  { value: "all", label: "전체 기간" },
  { value: "today", label: "오늘" },
  { value: "week", label: "이번 주" },
  { value: "month", label: "이번 달" },
  { value: "quarter", label: "이번 분기" },
]

export default memo(function OptimizedSearchFilter({
  onFilterChange,
  totalCount,
  filteredCount,
}: OptimizedSearchFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    branch: "all",
    carType: "all",
    dateRange: "all",
  })

  // 디바운스된 필터 변경 핸들러
  const debouncedFilterChange = useDebounce(onFilterChange, PERFORMANCE_CONFIG.DEBOUNCE.FILTER)

  // 필터 업데이트 함수
  const updateFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      debouncedFilterChange(newFilters)
    },
    [filters, debouncedFilterChange],
  )

  // 활성 필터 개수 계산
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => key !== "search" && value !== "all").length
  }, [filters])

  // 필터 초기화
  const resetFilters = useCallback(() => {
    const resetState: FilterState = {
      search: "",
      status: "all",
      branch: "all",
      carType: "all",
      dateRange: "all",
    }
    setFilters(resetState)
    onFilterChange(resetState)
  }, [onFilterChange])

  // 지파 옵션 메모화
  const branchOptions = useMemo(
    () => [{ value: "all", label: "전체 지파" }, ...BRANCHES.map((branch) => ({ value: branch, label: branch }))],
    [],
  )

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      {/* 검색 바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="이름, 차량번호, 차종으로 검색..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* 필터 옵션들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
          <SelectTrigger>
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.branch} onValueChange={(value) => updateFilter("branch", value)}>
          <SelectTrigger>
            <SelectValue placeholder="지파 선택" />
          </SelectTrigger>
          <SelectContent>
            {branchOptions.map((branch) => (
              <SelectItem key={branch.value} value={branch.value}>
                {branch.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.carType} onValueChange={(value) => updateFilter("carType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="차종 선택" />
          </SelectTrigger>
          <SelectContent>
            {CAR_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.dateRange} onValueChange={(value) => updateFilter("dateRange", value)}>
          <SelectTrigger>
            <SelectValue placeholder="기간 선택" />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 필터 상태 및 초기화 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredCount.toLocaleString()}개 / 전체 {totalCount.toLocaleString()}개
          </span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {activeFilterCount}개 필터 적용됨
            </Badge>
          )}
        </div>

        {(activeFilterCount > 0 || filters.search) && (
          <Button variant="outline" size="sm" onClick={resetFilters} className="flex items-center gap-1">
            <X className="h-3 w-3" />
            필터 초기화
          </Button>
        )}
      </div>
    </div>
  )
})
