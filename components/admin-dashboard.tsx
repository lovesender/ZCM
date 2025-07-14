"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Users,
  Clock,
  MapPin,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Plus,
  Bell,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ExcelDownload from "./excel-download"
import NoticeListModal from "./notice-list-modal"
import VehicleDetailModal from "./vehicle-detail-modal"
import QuickActionsModal from "./quick-actions-modal"
import RecentActivityModal from "./recent-activity-modal"
import { getVehicleStatistics, getRecentVehicles } from "@/app/actions/excel-actions"
import { getRecentNotices } from "@/app/actions/notice-actions"
import type { Notice } from "@/app/actions/notice-actions"

interface VehicleStats {
  totalVehicles: number
  pendingApproval: number
  todayRegistrations: number
  totalMembers: number
  branchStats: Record<string, { total: number; approved: number; pending: number }>
}

interface RecentVehicle {
  id: number
  name: string
  carNumber: string
  branch: string
  church: string
  status: "승인됨" | "대기중" | "반려됨"
  registeredAt: string
  approvedAt?: string
  phone: string
  carModel: string
  carType: string
  department: string
  notes: string
}

// 클라이언트 전용 날짜 포맷팅 함수를 제거하고 안전한 방식으로 변경
const formatDateSafe = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  } catch {
    return dateString
  }
}

const formatTimeSafe = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return ""
  }
}

// branchStats 배열을 원래 12개 지파명으로 수정:
const branchStats = [
  { name: "요한", vehicles: 45, users: 12 },
  { name: "베드로", vehicles: 38, users: 10 },
  { name: "부산야고보", vehicles: 52, users: 15 },
  { name: "안드레", vehicles: 29, users: 8 },
  { name: "다대오", vehicles: 41, users: 11 },
  { name: "빌립", vehicles: 33, users: 9 },
  { name: "시몬", vehicles: 27, users: 7 },
  { name: "바돌로매", vehicles: 35, users: 9 },
  { name: "마태", vehicles: 42, users: 12 },
  { name: "맛디아", vehicles: 31, users: 8 },
  { name: "서울야고보", vehicles: 48, users: 13 },
  { name: "도마", vehicles: 39, users: 10 },
]

// 명확하게 default export로만 내보냅니다
export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<VehicleStats | null>(null)
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([])
  const [recentNotices, setRecentNotices] = useState<Notice[]>([])
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showRecentActivity, setShowRecentActivity] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<RecentVehicle | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("전체")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 대시보드 데이터 로드
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [statsData, vehiclesData, noticesData] = await Promise.all([
        getVehicleStatistics(),
        getRecentVehicles(10),
        getRecentNotices(3),
      ])

      setStats(statsData)
      setRecentVehicles(vehiclesData)
      setRecentNotices(noticesData)
    } catch (error) {
      console.error("대시보드 데이터 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      loadDashboardData()
    }
  }, [mounted])

  // 검색 및 필터링된 차량 목록
  const filteredVehicles = recentVehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.carNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.branch.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "전체" || vehicle.status === filterStatus

    return matchesSearch && matchesFilter
  })

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case "승인됨":
        return "bg-green-100 text-green-800"
      case "대기중":
        return "bg-yellow-100 text-yellow-800"
      case "반려됨":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // 상태별 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "승인됨":
        return <CheckCircle className="w-4 h-4" />
      case "대기중":
        return <Clock className="w-4 h-4" />
      case "반려됨":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  // 차량 상세보기
  const handleVehicleDetail = (vehicle: RecentVehicle) => {
    setSelectedVehicle(vehicle)
  }

  // 차량 수정
  const handleVehicleEdit = (vehicleId: number) => {
    router.push(`/my-vehicles/edit/${vehicleId}`)
  }

  if (!mounted) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">시스템을 초기화하는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50">
        <div className="p-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">대시보드 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="ml-64 min-h-screen bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">차량 관리 대시보드</h1>
              <p className="text-sm text-gray-600 mt-1">{stats?.totalVehicles || 0}개의 차량이 등록되어 있습니다</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowQuickActions(true)}
                className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                빠른 작업
              </button>
              <button
                onClick={() => setShowRecentActivity(true)}
                className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                최근 활동
              </button>
              <ExcelDownload
                className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                variant="default"
              />
              <button
                onClick={() => setShowNoticeModal(true)}
                className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                공지사항
              </button>
            </div>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="p-8">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Link href="/admin/vehicles" className="block">
              <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">전체 차량</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stats?.totalVehicles.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      전월 대비 +12%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/vehicles?status=대기중" className="block">
              <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">승인 대기</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.pendingApproval || 0}</p>
                    <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      처리 필요
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/vehicles?date=today" className="block">
              <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">오늘 등록</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stats?.todayRegistrations || 0}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      신규 등록
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/admin/users" className="block">
              <div className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">전체 성도</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">
                      {stats?.totalMembers.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      활성 사용자
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* 빠른 통계 및 공지사항 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 지파별 현황 */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">지파별 현황</h3>
                <Link
                  href="/admin/statistics"
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                >
                  <BarChart3 className="w-4 h-4" />
                  전체 통계
                </Link>
              </div>
              <div className="space-y-3">
                {branchStats &&
                  branchStats.slice(0, 5).map((branch) => (
                    <div key={branch.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">{branch.name}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">총 {branch.vehicles}대</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* 최근 공지사항 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">최근 공지사항</h3>
                <button onClick={() => setShowNoticeModal(true)} className="text-blue-600 hover:text-blue-700 text-sm">
                  전체보기
                </button>
              </div>
              <div className="space-y-3">
                {recentNotices.map((notice) => (
                  <div key={notice.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{notice.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{notice.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              notice.isImportant ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {notice.category}
                          </span>
                          <span className="text-xs text-gray-500">{formatDateSafe(notice.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 최근 차량 등록 */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">최근 차량 등록</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="전체">전체</option>
                    <option value="승인됨">승인됨</option>
                    <option value="대기중">대기중</option>
                    <option value="반려됨">반려됨</option>
                  </select>
                  <Link
                    href="/admin/vehicles"
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    전체보기
                  </Link>
                </div>
              </div>

              {/* 검색바 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="차량 검색 (성명, 차량번호, 지파)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 차량 목록 */}
            <div className="p-6">
              <div className="space-y-4">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-medium text-gray-900">{vehicle.name}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${getStatusColor(vehicle.status)}`}
                            >
                              {getStatusIcon(vehicle.status)}
                              {vehicle.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{vehicle.branch}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDateSafe(vehicle.registeredAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{vehicle.carNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatTimeSafe(vehicle.registeredAt)}</span>
                            </div>
                          </div>

                          <div className="mt-2 text-sm text-gray-500">
                            담당자: <span className="font-medium text-gray-700">{vehicle.name}</span>
                            <span className="mx-2">•</span>
                            연락처: <span className="font-medium text-gray-700">{vehicle.phone}</span>
                            <span className="mx-2">•</span>
                            차종: <span className="font-medium text-gray-700">{vehicle.carModel}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleVehicleDetail(vehicle)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            상세
                          </button>
                          <button
                            onClick={() => handleVehicleEdit(vehicle.id)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            수정
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">검색 조건에 맞는 차량이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      <NoticeListModal isOpen={showNoticeModal} onClose={() => setShowNoticeModal(false)} />

      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          isOpen={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      <QuickActionsModal isOpen={showQuickActions} onClose={() => setShowQuickActions(false)} />

      <RecentActivityModal isOpen={showRecentActivity} onClose={() => setShowRecentActivity(false)} />
    </>
  )
}
