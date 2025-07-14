"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Brain, TrendingUp, Target, CheckCircle, Clock } from "lucide-react"

interface AIAnalytics {
  totalRecommendations: number
  acceptanceRate: number
  averageConfidence: number
  topPerformingTemplates: Array<{
    templateId: number
    templateName: string
    recommendationCount: number
    acceptanceRate: number
    averageScore: number
  }>
  recentFeedback: Array<{
    timestamp: string
    templateName: string
    wasAccepted: boolean
    userRating: number
    confidence: number
  }>
  categoryPerformance: Record<string, { recommendations: number; acceptanceRate: number }>
}

export default function AIAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      // 실제 구현에서는 서버에서 분석 데이터를 가져옴
      const mockAnalytics: AIAnalytics = {
        totalRecommendations: 1247,
        acceptanceRate: 0.73,
        averageConfidence: 0.82,
        topPerformingTemplates: [
          {
            templateId: 2,
            templateName: "대기 → 승인 완료",
            recommendationCount: 156,
            acceptanceRate: 0.89,
            averageScore: 0.91,
          },
          {
            templateId: 1,
            templateName: "서울지파 → 경기지파 이전",
            recommendationCount: 98,
            acceptanceRate: 0.76,
            averageScore: 0.84,
          },
          {
            templateId: 3,
            templateName: "청년부 → 장년부 이동",
            recommendationCount: 67,
            acceptanceRate: 0.82,
            averageScore: 0.78,
          },
        ],
        recentFeedback: [
          {
            timestamp: "2024-02-20T14:30:00Z",
            templateName: "대기 → 승인 완료",
            wasAccepted: true,
            userRating: 5,
            confidence: 0.94,
          },
          {
            timestamp: "2024-02-20T11:15:00Z",
            templateName: "서울지파 → 경기지파 이전",
            wasAccepted: false,
            userRating: 2,
            confidence: 0.67,
          },
          {
            timestamp: "2024-02-19T16:45:00Z",
            templateName: "청년부 → 장년부 이동",
            wasAccepted: true,
            userRating: 4,
            confidence: 0.81,
          },
        ],
        categoryPerformance: {
          "상태 관리": { recommendations: 445, acceptanceRate: 0.84 },
          "지파 관리": { recommendations: 298, acceptanceRate: 0.71 },
          "부서 관리": { recommendations: 234, acceptanceRate: 0.68 },
          "교회 관리": { recommendations: 156, acceptanceRate: 0.73 },
        },
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error("분석 데이터 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue500 mx-auto mb-2"></div>
        <p className="text-contentSub">AI 성능 데이터를 분석하고 있습니다...</p>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-contentSub">분석 데이터를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2">AI 추천 시스템 성능 분석</h2>
        <p className="text-contentSub">AI 템플릿 추천 시스템의 성능과 사용자 만족도를 분석합니다.</p>
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 추천 수</CardTitle>
            <Brain className="h-4 w-4 text-contentCaption" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRecommendations.toLocaleString()}</div>
            <p className="text-xs text-contentCaption">누적 추천 횟수</p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수용률</CardTitle>
            <CheckCircle className="h-4 w-4 text-contentCaption" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green600">{Math.round(analytics.acceptanceRate * 100)}%</div>
            <p className="text-xs text-contentCaption">추천 수용 비율</p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 신뢰도</CardTitle>
            <Target className="h-4 w-4 text-contentCaption" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue600">{Math.round(analytics.averageConfidence * 100)}%</div>
            <p className="text-xs text-contentCaption">AI 예측 신뢰도</p>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 템플릿</CardTitle>
            <TrendingUp className="h-4 w-4 text-contentCaption" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topPerformingTemplates.length}</div>
            <p className="text-xs text-contentCaption">추천되는 템플릿 수</p>
          </CardContent>
        </Card>
      </div>

      {/* 상위 성과 템플릿 */}
      <Card className="card">
        <CardHeader>
          <CardTitle>상위 성과 템플릿</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>템플릿명</TableHead>
                <TableHead>추천 횟수</TableHead>
                <TableHead>수용률</TableHead>
                <TableHead>평균 점수</TableHead>
                <TableHead>성과</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.topPerformingTemplates.map((template) => (
                <TableRow key={template.templateId}>
                  <TableCell className="font-medium">{template.templateName}</TableCell>
                  <TableCell>{template.recommendationCount}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={template.acceptanceRate * 100} className="w-16 h-2" />
                      <span className="text-sm">{Math.round(template.acceptanceRate * 100)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{Math.round(template.averageScore * 100)}%</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        template.acceptanceRate > 0.8
                          ? "bg-green500 text-white"
                          : template.acceptanceRate > 0.6
                            ? "bg-orange500 text-white"
                            : "bg-red500 text-white"
                      }
                    >
                      {template.acceptanceRate > 0.8 ? "우수" : template.acceptanceRate > 0.6 ? "양호" : "개선필요"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 카테고리별 성과 */}
      <Card className="card">
        <CardHeader>
          <CardTitle>카테고리별 성과</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.categoryPerformance).map(([category, performance]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{category}</span>
                    <span className="text-sm text-contentSub">{performance.recommendations}회 추천</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={performance.acceptanceRate * 100} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{Math.round(performance.acceptanceRate * 100)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 최근 피드백 */}
      <Card className="card">
        <CardHeader>
          <CardTitle>최근 사용자 피드백</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>시간</TableHead>
                <TableHead>템플릿</TableHead>
                <TableHead>결과</TableHead>
                <TableHead>사용자 평점</TableHead>
                <TableHead>AI 신뢰도</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.recentFeedback.map((feedback, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-contentCaption" />
                      <span className="text-sm">
                        {new Date(feedback.timestamp).toLocaleDateString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{feedback.templateName}</TableCell>
                  <TableCell>
                    <Badge className={feedback.wasAccepted ? "bg-green500 text-white" : "bg-red500 text-white"}>
                      {feedback.wasAccepted ? "수용" : "거부"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {"★".repeat(feedback.userRating)}
                      {"☆".repeat(5 - feedback.userRating)}
                    </div>
                  </TableCell>
                  <TableCell>{Math.round(feedback.confidence * 100)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
