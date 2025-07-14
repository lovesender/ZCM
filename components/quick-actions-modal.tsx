"use client"
import { X, Plus, Users, FileText, Bell, Download, Settings, BarChart3 } from "lucide-react"
import Link from "next/link"

interface QuickActionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuickActionsModal({ isOpen, onClose }: QuickActionsModalProps) {
  if (!isOpen) return null

  const quickActions = [
    {
      icon: Plus,
      title: "차량 등록",
      description: "새로운 차량을 빠르게 등록합니다",
      href: "/register",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: Users,
      title: "사용자 추가",
      description: "새로운 사용자를 시스템에 추가합니다",
      href: "/admin/users?action=add",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: Bell,
      title: "공지사항 작성",
      description: "새로운 공지사항을 작성합니다",
      href: "/admin/notices?action=create",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      icon: FileText,
      title: "일괄 수정",
      description: "여러 차량을 한번에 수정합니다",
      href: "/admin/bulk-edit",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      icon: Download,
      title: "데이터 내보내기",
      description: "차량 데이터를 엑셀로 내보냅니다",
      href: "/admin/vehicles?action=export",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      icon: BarChart3,
      title: "통계 보고서",
      description: "상세한 통계 보고서를 확인합니다",
      href: "/admin/statistics",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      icon: Settings,
      title: "시스템 설정",
      description: "시스템 설정을 관리합니다",
      href: "/admin/settings",
      color: "bg-gray-500 hover:bg-gray-600",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">빠른 작업</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.title}
                href={action.href}
                onClick={onClose}
                className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">최근 작업</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-900">김철수님 차량 등록</span>
              </div>
              <span className="text-xs text-gray-500">5분 전</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-900">이영희님 승인 완료</span>
              </div>
              <span className="text-xs text-gray-500">10분 전</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-sm text-gray-900">시스템 점검 공지 발송</span>
              </div>
              <span className="text-xs text-gray-500">1시간 전</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
