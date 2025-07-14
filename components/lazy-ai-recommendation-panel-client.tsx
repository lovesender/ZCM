"use client"

import dynamic from "next/dynamic"
import LoadingSpinner from "./ui/loading-spinner"

// Lazily load the AI recommendation panel
const AIRecommendationPanel = dynamic(() => import("./ai-recommendation-panel"), {
  loading: () => (
    <div className="border-2 border-blue-200 bg-blue-50 p-6 rounded-lg">
      <LoadingSpinner />
      <div className="text-center text-sm text-blue-600 mt-2">AI 추천 시스템 로딩 중...</div>
    </div>
  ),
  ssr: false,
})

export default AIRecommendationPanel
