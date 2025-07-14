"use client"

import { useState } from "react"
import {
  X,
  Car,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Edit,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

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
  status: "승인됨" | "대기중" | "반려됨"
  registeredAt: string
  approvedAt?: string
  notes: string
}

interface VehicleDetailModalProps {
  vehicle: Vehicle
  isOpen: boolean
  onClose: () => void
}

export default function VehicleDetailModal({ vehicle, isOpen, onClose }: VehicleDetailModalProps) {
  const [activeTab, setActiveTab] = useState("info")

  if (!isOpen) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "승인됨":
        return "bg-green-100 text-green-800 border-green-200"
      case "대기중":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "반려됨":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{vehicle.name}님의 차량</h2>
              <p className="text-sm text-gray-600">{vehicle.carNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 상태 표시 */}
        <div className="p-6 border-b border-gray-200">
          <div
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(vehicle.status)}`}
          >
            {getStatusIcon(vehicle.status)}
            <span className="font-medium">{vehicle.status}</span>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "info"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              기본 정보
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "history"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              처리 이력
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === "documents"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              첨부 서류
            </button>
          </nav>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-6">
          {activeTab === "info" && (
            <div className="space-y-6">
              {/* 개인 정보 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">개인 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">성명</p>
                      <p className="font-medium text-gray-900">{vehicle.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">연락처</p>
                      <p className="font-medium text-gray-900">{vehicle.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">지파</p>
                      <p className="font-medium text-gray-900">{vehicle.branch}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">부서</p>
                      <p className="font-medium text-gray-900">{vehicle.department}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 차량 정보 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">차량 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Car className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">차량번호</p>
                      <p className="font-medium text-gray-900">{vehicle.carNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Car className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">차종</p>
                      <p className="font-medium text-gray-900">{vehicle.carModel}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Car className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">차량 유형</p>
                      <p className="font-medium text-gray-900">{vehicle.carType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">교회</p>
                      <p className="font-medium text-gray-900">{vehicle.church}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 등록 정보 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">등록 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">등록일시</p>
                      <p className="font-medium text-gray-900" suppressHydrationWarning>
                        {formatDate(vehicle.registeredAt)}
                      </p>
                    </div>
                  </div>
                  {vehicle.approvedAt && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">승인일시</p>
                        <p className="font-medium text-gray-900" suppressHydrationWarning>
                          {formatDate(vehicle.approvedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 비고 */}
              {vehicle.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">비고</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{vehicle.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">처리 이력</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">차량 등록 신청</p>
                    <p className="text-sm text-gray-600">사용자가 차량 등록을 신청했습니다.</p>
                    <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                      {formatDate(vehicle.registeredAt)}
                    </p>
                  </div>
                </div>

                {vehicle.status === "승인됨" && vehicle.approvedAt && (
                  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">승인 완료</p>
                      <p className="text-sm text-gray-600">관리자가 차량 등록을 승인했습니다.</p>
                      <p className="text-xs text-gray-500 mt-1" suppressHydrationWarning>
                        {formatDate(vehicle.approvedAt)}
                      </p>
                    </div>
                  </div>
                )}

                {vehicle.status === "대기중" && (
                  <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">승인 대기 중</p>
                      <p className="text-sm text-gray-600">관리자의 승인을 기다리고 있습니다.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">첨부 서류</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">차량등록증</p>
                    <p className="text-sm text-gray-600">vehicle_registration.pdf</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">다운로드</button>
                </div>
                <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">보험증서</p>
                    <p className="text-sm text-gray-600">insurance_certificate.pdf</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm">다운로드</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {vehicle.status === "대기중" && (
              <>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  승인
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  반려
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/my-vehicles/edit/${vehicle.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              수정
            </Link>
            <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
