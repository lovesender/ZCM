"use client"

import { useState, useEffect } from "react"
import { X, Clock, Car, Bell, CheckCircle, XCircle, AlertTriangle, Filter } from "lucide-react"

interface Activity {
  id: number
  type: "registration" | "approval" | "rejection" | "notice" | "system"
  title: string
  description: string
  user: string
  timestamp: string
  status: "success" | "warning" | "error" | "info"
}

interface RecentActivityModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function RecentActivityModal({ isOpen, onClose }: RecentActivityModalProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadActivities()
    }
  }, [isOpen])

  const loadActivities = async () => {
    setLoading(true)
    // 모의 데이터 - 실제로는 API에서 가져옴
    await new Promise((resolve) => setTimeout(resolve, 500))

    const mockActivities: Activity[] = [
      {
        id: 1,
        type: "registration",
        title: "새 차량 등록",
        description: "김철수님이 소나타(12가 3456) 차량을 등록했습니다",
        user: "김철수",
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: "info",
      },
      {
        id: 2,
        type: "approval",
        title: "차량 승인",
        description: "이영희님의 아반떼(34나 5678) 차량이 승인되었습니다",
        user: "관리자",
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        status: "success",
      },
      {
        id: 3,
        type: "notice",
        title: "공지사항 발송",
        description: "시스템 점검 안내 공지가 발송되었습니다",
        user: "시스템관리자",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: "info",
      },
      {
        id: 4,
        type: "rejection",
        title: "차량 반려",
        description: "박민수님의 차량 등록이 서류 미비로 반려되었습니다",
        user: "관리자",
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        status: "error",
      },
      {
        id: 5,
        type: "system",
        title: "시스템 백업",
        description: "일일 데이터 백업이 완료되었습니다",
        user: "시스템",
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: "success",
      },
      {
        id: 6,
        type: "registration",
        title: "대량 등록",
        description: "요한지파에서 15건의 차량이 일괄 등록되었습니다",
        user: "요한지파 관리자",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: "info",
      },
      {
        id: 7,
        type: "system",
        title: "보안 경고",
        description: "비정상적인 로그인 시도가 감지되었습니다",
        user: "보안시스템",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        status: "warning",
      },
    ]

    setActivities(mockActivities)
    setLoading(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <Car className="w-4 h-4" />
      case "approval":
        return <CheckCircle className="w-4 h-4" />
      case "rejection":
        return <XCircle className="w-4 h-4" />
      case "notice":
        return <Bell className="w-4 h-4" />
      case "system":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "방금 전"
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
    return `${Math.floor(diffInMinutes / 1440)}일 전`
  }

  const filteredActivities = activities.filter((activity) => {
    if (filter === "all") return true
    return activity.type === filter
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">최근 활동</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 필터 */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체</option>
            <option value="registration">차량 등록</option>
            <option value="approval">승인</option>
            <option value="rejection">반려</option>
            <option value="notice">공지사항</option>
            <option value="system">시스템</option>
          </select>
        </div>

        {/* 활동 목록 */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">활동 내역을 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(activity.status)}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">{activity.title}</h3>
                    <span className="text-xs text-gray-500" suppressHydrationWarning>
                      {formatTimeAgo(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">작업자:</span>
                    <span className="text-xs font-medium text-gray-700">{activity.user}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">해당 조건의 활동 내역이 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}
