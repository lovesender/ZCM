"use client"

import dynamic from "next/dynamic"
import LoadingSpinner from "./ui/loading-spinner"

// Lazily load the bulk edit component
const BulkEditComponent = dynamic(() => import("./bulk-edit-component"), {
  loading: () => (
    <div className="space-y-6">
      <LoadingSpinner size="large" className="py-12" />
      <p className="text-center text-contentSub">일괄 수정 기능을 불러오는 중입니다...</p>
    </div>
  ),
  ssr: false,
})

export default BulkEditComponent
