"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import Pagination from "@/components/pagination"
import { getPermissionHistory } from "@/app/actions/permission-actions"
import { BRANCHES } from "@/app/config/branches"
import { Calendar, Filter, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface PermissionHistoryItem {
  id: string
  timestamp: string
  adminName: string
  branchName: string
  action: string
  permission: string
  oldValue: string
  newValue: string
  reason: string
  changeType: "increase" | "decrease" | "no-change"
}

interface HistoryStats {
  totalChanges: number
  todayChanges: number
  weekChanges: number
  increaseCount: number
}

export function PermissionHistoryComponent() {
  const [history, setHistory] = useState<PermissionHistoryItem[]>([])
  const [stats, setStats] = useState<HistoryStats>({
    totalChanges: 0,
    todayChanges: 0,
    weekChanges: 0,
    increaseCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    branch: "",
    admin: "",
    dateFrom: "",
    dateTo: "",
    permission: "",
    changeType: "",
  })

  const itemsPerPage = 10

  useEffect(() => {
    loadHistory()
  }, [currentPage, filters])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const result = await getPermissionHistory({
        page: currentPage,
        limit: itemsPerPage,
        filters,
      })

      if (result.success) {
        setHistory(result.items)
        setStats(result.stats)
        setTotalPages(Math.ceil(result.total / itemsPerPage))
      } else {
        // Handle error case
        setHistory([])
        setStats({
          totalChanges: 0,
          todayChanges: 0,
          weekChanges: 0,
          increaseCount: 0,
        })
        setTotalPages(1)
      }
    } catch (error) {
      console.error("권한 이력 로드 실패:", error)
      // Set default values on error
      setHistory([])
      setStats({
        totalChanges: 0,
        todayChanges: 0,
        weekChanges: 0,
        increaseCount: 0,
      })
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      branch: "",
      admin: "",
      dateFrom: "",
      dateTo: "",
      permission: "",
      changeType: "",
    })
    setCurrentPage(1)
  }

  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case "increase":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "decrease":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getChangeTypeBadge = (type: string) => {
    switch (type) {
      case "increase":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            권한 증가
          </Badge>
        )
      case "decrease":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            권한 감소
          </Badge>
        )
      default:
        return <Badge variant="secondary">변경 없음</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 변경 건수</p>
                <p className="text-2xl font-bold">{stats.totalChanges}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 변경</p>
                <p className="text-2xl font-bold">{stats.todayChanges}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">이번 주 변경</p>
                <p className="text-2xl font-bold">{stats.weekChanges}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">권한 증가</p>
                <p className="text-2xl font-bold">{stats.increaseCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={filters.branch} onValueChange={(value) => handleFilterChange("branch", value)}>
              <SelectTrigger>
                <SelectValue placeholder="지파 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지파</SelectItem>
                {BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="관리자 이름"
              value={filters.admin}
              onChange={(e) => handleFilterChange("admin", e.target.value)}
            />

            <Input
              type="date"
              placeholder="시작 날짜"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />

            <Input
              type="date"
              placeholder="종료 날짜"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />

            <Select value={filters.changeType} onValueChange={(value) => handleFilterChange("changeType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="변경 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 유형</SelectItem>
                <SelectItem value="increase">권한 증가</SelectItem>
                <SelectItem value="decrease">권한 감소</SelectItem>
                <SelectItem value="no-change">변경 없음</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={clearFilters} variant="outline" className="w-full">
              필터 초기화
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 이력 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>권한 변경 이력</CardTitle>
          <CardDescription>총 {stats.totalChanges}건의 권한 변경 이력이 있습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500">권한 변경 이력이 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getChangeTypeIcon(item.changeType)}
                        <span className="font-medium">{item.action}</span>
                        {getChangeTypeBadge(item.changeType)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>
                            <span className="font-medium">관리자:</span> {item.adminName}
                          </p>
                          <p>
                            <span className="font-medium">지파:</span> {item.branchName}
                          </p>
                          <p>
                            <span className="font-medium">권한:</span> {item.permission}
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="font-medium">이전 값:</span> {item.oldValue}
                          </p>
                          <p>
                            <span className="font-medium">변경 값:</span> {item.newValue}
                          </p>
                          <p>
                            <span className="font-medium">일시:</span>{" "}
                            {new Date(item.timestamp).toLocaleString("ko-KR")}
                          </p>
                        </div>
                      </div>

                      {item.reason && (
                        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                          <span className="font-medium">변경 사유:</span> {item.reason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
