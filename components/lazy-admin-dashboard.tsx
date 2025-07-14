"use client"

import { Suspense, lazy } from "react"
import LoadingSpinner from "./ui/loading-spinner"

// 동적 import를 사용하여 AdminDashboard 컴포넌트를 지연 로딩
const AdminDashboard = lazy(() => import("./admin-dashboard"))

export default function LazyAdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="ml-64 min-h-screen bg-gray-50">
          <div className="p-8">
            <div className="text-center py-12">
              <LoadingSpinner className="mx-auto mb-4" />
              <p className="text-gray-600">대시보드를 불러오는 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <AdminDashboard />
    </Suspense>
  )
}
