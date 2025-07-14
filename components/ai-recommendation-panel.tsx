"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, TrendingUp, Clock, Target, ThumbsDown, Star, Brain, Zap, CheckCircle, Info } from "lucide-react"
import {
  getTemplateRecommendations,
  saveRecommendationFeedback,
  type TemplateRecommendation,
} from "@/app/actions/ai-recommendation-actions"
import type { BulkEditTemplate } from "@/app/actions/template-actions"

interface AIRecommendationPanelProps {
  selectedVehicleIds: number[]
  vehicles: any[]
  onApplyTemplate: (template: BulkEditTemplate) => void
  isVisible: boolean
}

export default function AIRecommendationPanel({
  selectedVehicleIds,
  vehicles,
  onApplyTemplate,
  isVisible,
}: AIRecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedRecommendation, setExpandedRecommendation] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // 하이드레이션 안전성을 위한 마운트 체크
  useEffect(() => {
    setMounted(true)
  }, [])

  // 추천 로드
  const loadRecommendations = async () => {
    if (selectedVehicleIds.length === 0) {
      setRecommendations([])
      return
    }

    setLoading(true)
    try {
      const result = await getTemplateRecommendations(selectedVehicleIds, vehicles)
      setRecommendations(result)
    } catch (error) {
      console.error("추천 로드 오류:", error)
      setRecommendations([])
    } finally {
      setLoading(false)
    }
  }

  // 선택된 차량이 변경될 때마다 추천 재로드
  useEffect(() => {
    if (isVisible && mounted && selectedVehicleIds.length > 0) {
      loadRecommendations()
    } else if (mounted) {
      setRecommendations([])
    }
  }, [selectedVehicleIds, isVisible, mounted])

  // 템플릿 적용 및 피드백 저장
  const handleApplyRecommendation = async (recommendation: TemplateRecommendation) => {
    try {
      // 피드백 저장 (사용됨)
      await saveRecommendationFeedback(
        recommendation.template.id,
        true,
        {
          selectedVehicleIds,
          totalCount: selectedVehicleIds.length,
          branchDistribution: {},
          churchDistribution: {},
          departmentDistribution: {},
          statusDistribution: {},
        },
        5, // 자동 적용은 높은 평점으로 간주
      )

      onApplyTemplate(recommendation.template)
    } catch (error) {
      console.error("추천 적용 오류:", error)
    }
  }

  // 추천 거부 피드백
  const handleRejectRecommendation = async (recommendation: TemplateRecommendation) => {
    try {
      await saveRecommendationFeedback(
        recommendation.template.id,
        false,
        {
          selectedVehicleIds,
          totalCount: selectedVehicleIds.length,
          branchDistribution: {},
          churchDistribution: {},
          departmentDistribution: {},
          statusDistribution: {},
        },
        1, // 거부는 낮은 평점
      )

      // 해당 추천을 목록에서 제거
      setRecommendations((prev) => prev.filter((r) => r.template.id !== recommendation.template.id))
    } catch (error) {
      console.error("추천 거부 오류:", error)
    }
  }

  // 카테고리별 아이콘
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "high":
        return <Zap className="h-4 w-4 text-green-500" />
      case "medium":
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      case "low":
        return <Target className="h-4 w-4 text-blue-500" />
      default:
        return <Brain className="h-4 w-4 text-grey-500" />
    }
  }

  // 카테고리별 색상
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "high":
        return "bg-green-50 border-green-200 text-green-800"
      case "medium":
        return "bg-orange-50 border-orange-200 text-orange-800"
      case "low":
        return "bg-blue-50 border-blue-200 text-blue-800"
      default:
        return "bg-grey-50 border-grey-200 text-grey-800"
    }
  }

  // 추천 이유 아이콘
  const getReasonIcon = (type: string) => {
    switch (type) {
      case "pattern":
        return <TrendingUp className="h-3 w-3" />
      case "similarity":
        return <Target className="h-3 w-3" />
      case "temporal":
        return <Clock className="h-3 w-3" />
      case "success_rate":
        return <CheckCircle className="h-3 w-3" />
      case "user_preference":
        return <Star className="h-3 w-3" />
      default:
        return <Info className="h-3 w-3" />
    }
  }

  // 마운트되지 않았거나 보이지 않으면 렌더링하지 않음
  if (!mounted || !isVisible || selectedVehicleIds.length === 0) {
    return null
  }

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-blue-500" />
          AI 템플릿 추천
          <Badge className="bg-blue-100 text-blue-700 ml-2">{selectedVehicleIds.length}개 차량 분석됨</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-contentSub">AI가 최적의 템플릿을 분석하고 있습니다...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              선택된 차량들의 특성을 분석했지만, 적합한 템플릿을 찾지 못했습니다. 새로운 템플릿을 만들어보세요.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-contentSub">
                <Brain className="h-4 w-4 inline mr-1" />
                {recommendations.length}개의 추천 템플릿을 찾았습니다
              </p>
              <Button variant="ghost" size="sm" onClick={loadRecommendations} className="text-blue-600">
                <Sparkles className="h-4 w-4 mr-1" />
                다시 분석
              </Button>
            </div>

            {recommendations.map((recommendation, index) => (
              <Card
                key={recommendation.template.id}
                className={`border transition-all hover:shadow-md ${getCategoryColor(recommendation.category)}`}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* 헤더 */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(recommendation.category)}
                          <h3 className="font-semibold">{recommendation.template.name}</h3>
                          {index === 0 && (
                            <Badge className="bg-yellow-100 text-yellow-700">
                              <Star className="h-3 w-3 mr-1" />
                              최고 추천
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-contentSub">{recommendation.template.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {Math.round(recommendation.score * 100)}%
                        </div>
                        <div className="text-xs text-contentCaption">매칭도</div>
                      </div>
                    </div>

                    {/* 신뢰도 표시 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>AI 신뢰도</span>
                        <span>{Math.round(recommendation.confidence * 100)}%</span>
                      </div>
                      <Progress value={recommendation.confidence * 100} className="h-2" />
                    </div>

                    {/* 주요 추천 이유 (상위 2개) */}
                    <div className="space-y-1">
                      {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          {getReasonIcon(reason.type)}
                          <span className="text-contentSub">{reason.description}</span>
                          <Badge className="bg-white bg-opacity-50 text-xs">{Math.round(reason.weight * 100)}%</Badge>
                        </div>
                      ))}
                      {recommendation.reasons.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs p-1"
                          onClick={() =>
                            setExpandedRecommendation(
                              expandedRecommendation === recommendation.template.id ? null : recommendation.template.id,
                            )
                          }
                        >
                          {expandedRecommendation === recommendation.template.id
                            ? "접기"
                            : `+${recommendation.reasons.length - 2}개 더보기`}
                        </Button>
                      )}
                    </div>

                    {/* 확장된 추천 이유 */}
                    {expandedRecommendation === recommendation.template.id && (
                      <div className="space-y-1 pt-2 border-t border-white border-opacity-50">
                        {recommendation.reasons.slice(2).map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs">
                            {getReasonIcon(reason.type)}
                            <span className="text-contentSub">{reason.description}</span>
                            <Badge className="bg-white bg-opacity-50 text-xs">{Math.round(reason.weight * 100)}%</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleApplyRecommendation(recommendation)}
                        className="btn-primary flex-1 h-8"
                        size="sm"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        적용하기
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRejectRecommendation(recommendation)}
                        className="h-8 px-2"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
