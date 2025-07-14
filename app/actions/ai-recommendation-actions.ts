"use server"

import type { BulkEditTemplate } from "./template-actions"

// 추천 결과 타입
export interface TemplateRecommendation {
  template: BulkEditTemplate
  score: number
  confidence: number
  reasons: RecommendationReason[]
  category: "high" | "medium" | "low"
}

export interface RecommendationReason {
  type: "pattern" | "similarity" | "temporal" | "success_rate" | "user_preference"
  description: string
  weight: number
}

// 차량 분석 데이터 타입
export interface VehicleAnalysis {
  selectedVehicleIds: number[]
  commonBranch?: string
  commonChurch?: string
  commonDepartment?: string
  commonStatus?: string
  branchDistribution: Record<string, number>
  churchDistribution: Record<string, number>
  departmentDistribution: Record<string, number>
  statusDistribution: Record<string, number>
  totalCount: number
}

// 사용 패턴 데이터 타입
export interface UsagePattern {
  templateId: number
  vehicleCharacteristics: {
    branches: string[]
    churches: string[]
    departments: string[]
    statuses: string[]
  }
  timeOfDay: number // 0-23
  dayOfWeek: number // 0-6
  month: number // 1-12
  usageCount: number
  successRate: number // 적용 후 재수정하지 않은 비율
  lastUsed: string
}

// AI 추천 엔진 메인 함수
export async function getTemplateRecommendations(
  selectedVehicleIds: number[],
  vehicles: any[],
  userId = "admin",
): Promise<TemplateRecommendation[]> {
  console.log("AI 템플릿 추천 요청:", { selectedVehicleIds, userId })

  try {
    // 1. 선택된 차량들 분석
    const vehicleAnalysis = analyzeSelectedVehicles(selectedVehicleIds, vehicles)

    // 2. 과거 사용 패턴 데이터 로드
    const usagePatterns = await loadUsagePatterns()

    // 3. 현재 시간 컨텍스트
    const timeContext = getCurrentTimeContext()

    // 4. 사용자 선호도 데이터 로드
    const userPreferences = await loadUserPreferences(userId)

    // 5. 모든 템플릿에 대해 추천 점수 계산
    const templates = await getAllTemplates()
    const recommendations: TemplateRecommendation[] = []

    for (const template of templates) {
      const score = calculateRecommendationScore(template, vehicleAnalysis, usagePatterns, timeContext, userPreferences)

      if (score.totalScore > 0.3) {
        // 임계값 이상인 경우만 추천
        recommendations.push({
          template,
          score: score.totalScore,
          confidence: score.confidence,
          reasons: score.reasons,
          category: score.totalScore > 0.8 ? "high" : score.totalScore > 0.6 ? "medium" : "low",
        })
      }
    }

    // 점수 순으로 정렬하고 상위 5개만 반환
    return recommendations.sort((a, b) => b.score - a.score).slice(0, 5)
  } catch (error) {
    console.error("AI 추천 오류:", error)
    return []
  }
}

// 선택된 차량들의 특성 분석
function analyzeSelectedVehicles(selectedVehicleIds: number[], vehicles: any[]): VehicleAnalysis {
  const selectedVehicles = vehicles.filter((v) => selectedVehicleIds.includes(v.id))

  const branchDistribution: Record<string, number> = {}
  const churchDistribution: Record<string, number> = {}
  const departmentDistribution: Record<string, number> = {}
  const statusDistribution: Record<string, number> = {}

  selectedVehicles.forEach((vehicle) => {
    branchDistribution[vehicle.branch] = (branchDistribution[vehicle.branch] || 0) + 1
    churchDistribution[vehicle.church] = (churchDistribution[vehicle.church] || 0) + 1
    departmentDistribution[vehicle.department] = (departmentDistribution[vehicle.department] || 0) + 1
    statusDistribution[vehicle.status] = (statusDistribution[vehicle.status] || 0) + 1
  })

  // 가장 많은 비율을 차지하는 값들 찾기
  const getCommonValue = (distribution: Record<string, number>) => {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0)
    const entries = Object.entries(distribution)
    const maxEntry = entries.reduce((max, current) => (current[1] > max[1] ? current : max))
    return maxEntry[1] / total > 0.7 ? maxEntry[0] : undefined // 70% 이상일 때만 공통값으로 인정
  }

  return {
    selectedVehicleIds,
    commonBranch: getCommonValue(branchDistribution),
    commonChurch: getCommonValue(churchDistribution),
    commonDepartment: getCommonValue(departmentDistribution),
    commonStatus: getCommonValue(statusDistribution),
    branchDistribution,
    churchDistribution,
    departmentDistribution,
    statusDistribution,
    totalCount: selectedVehicles.length,
  }
}

// 추천 점수 계산 (핵심 AI 로직)
function calculateRecommendationScore(
  template: BulkEditTemplate,
  vehicleAnalysis: VehicleAnalysis,
  usagePatterns: UsagePattern[],
  timeContext: any,
  userPreferences: any,
): {
  totalScore: number
  confidence: number
  reasons: RecommendationReason[]
} {
  const reasons: RecommendationReason[] = []
  let totalScore = 0
  let maxPossibleScore = 0

  // 1. 차량 특성 매칭 점수 (가중치: 40%)
  const characteristicScore = calculateCharacteristicScore(template, vehicleAnalysis, reasons)
  totalScore += characteristicScore * 0.4
  maxPossibleScore += 0.4

  // 2. 과거 패턴 매칭 점수 (가중치: 25%)
  const patternScore = calculatePatternScore(template, vehicleAnalysis, usagePatterns, reasons)
  totalScore += patternScore * 0.25
  maxPossibleScore += 0.25

  // 3. 시간적 패턴 점수 (가중치: 15%)
  const temporalScore = calculateTemporalScore(template, usagePatterns, timeContext, reasons)
  totalScore += temporalScore * 0.15
  maxPossibleScore += 0.15

  // 4. 성공률 점수 (가중치: 15%)
  const successScore = calculateSuccessScore(template, usagePatterns, reasons)
  totalScore += successScore * 0.15
  maxPossibleScore += 0.15

  // 5. 사용자 선호도 점수 (가중치: 5%)
  const preferenceScore = calculatePreferenceScore(template, userPreferences, reasons)
  totalScore += preferenceScore * 0.05
  maxPossibleScore += 0.05

  // 정규화된 점수와 신뢰도 계산
  const normalizedScore = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0
  const confidence = calculateConfidence(reasons, vehicleAnalysis.totalCount)

  return {
    totalScore: Math.max(0, Math.min(1, normalizedScore)),
    confidence,
    reasons: reasons.sort((a, b) => b.weight - a.weight),
  }
}

// 차량 특성 매칭 점수 계산
function calculateCharacteristicScore(
  template: BulkEditTemplate,
  analysis: VehicleAnalysis,
  reasons: RecommendationReason[],
): number {
  let score = 0
  let checks = 0

  // 템플릿이 수정하는 필드와 차량들의 현재 상태 비교
  if (template.fieldsToUpdate.branch && template.updates.branch) {
    checks++
    if (analysis.commonBranch && analysis.commonBranch !== template.updates.branch) {
      score += 0.8 // 다른 지파로 변경하는 경우 높은 점수
      reasons.push({
        type: "similarity",
        description: `선택된 차량들이 모두 ${analysis.commonBranch}이고, 템플릿은 ${template.updates.branch}로 변경합니다`,
        weight: 0.8,
      })
    } else if (analysis.branchDistribution[template.updates.branch]) {
      score += 0.3 // 일부가 이미 해당 지파인 경우
      reasons.push({
        type: "similarity",
        description: `일부 차량이 이미 ${template.updates.branch}에 속해있습니다`,
        weight: 0.3,
      })
    }
  }

  if (template.fieldsToUpdate.status && template.updates.status) {
    checks++
    if (analysis.commonStatus && analysis.commonStatus !== template.updates.status) {
      score += 0.9 // 상태 변경은 매우 중요
      reasons.push({
        type: "similarity",
        description: `선택된 차량들이 모두 ${analysis.commonStatus} 상태이고, 템플릿은 ${template.updates.status}로 변경합니다`,
        weight: 0.9,
      })
    }
  }

  if (template.fieldsToUpdate.department && template.updates.department) {
    checks++
    if (analysis.commonDepartment && analysis.commonDepartment !== template.updates.department) {
      score += 0.7
      reasons.push({
        type: "similarity",
        description: `선택된 차량들이 모두 ${analysis.commonDepartment}이고, 템플릿은 ${template.updates.department}로 변경합니다`,
        weight: 0.7,
      })
    }
  }

  return checks > 0 ? score / checks : 0
}

// 과거 패턴 매칭 점수 계산
function calculatePatternScore(
  template: BulkEditTemplate,
  analysis: VehicleAnalysis,
  usagePatterns: UsagePattern[],
  reasons: RecommendationReason[],
): number {
  const templatePatterns = usagePatterns.filter((p) => p.templateId === template.id)

  if (templatePatterns.length === 0) return 0

  let bestMatch = 0
  let bestMatchReason = ""

  templatePatterns.forEach((pattern) => {
    let matchScore = 0
    let matchCount = 0

    // 지파 매칭
    if (analysis.commonBranch && pattern.vehicleCharacteristics.branches.includes(analysis.commonBranch)) {
      matchScore += 0.3
      matchCount++
    }

    // 상태 매칭
    if (analysis.commonStatus && pattern.vehicleCharacteristics.statuses.includes(analysis.commonStatus)) {
      matchScore += 0.4
      matchCount++
    }

    // 부서 매칭
    if (analysis.commonDepartment && pattern.vehicleCharacteristics.departments.includes(analysis.commonDepartment)) {
      matchScore += 0.3
      matchCount++
    }

    if (matchCount > 0) {
      const normalizedScore = matchScore / matchCount
      if (normalizedScore > bestMatch) {
        bestMatch = normalizedScore
        bestMatchReason = `과거 ${pattern.usageCount}회 유사한 상황에서 사용됨`
      }
    }
  })

  if (bestMatch > 0) {
    reasons.push({
      type: "pattern",
      description: bestMatchReason,
      weight: bestMatch,
    })
  }

  return bestMatch
}

// 시간적 패턴 점수 계산
function calculateTemporalScore(
  template: BulkEditTemplate,
  usagePatterns: UsagePattern[],
  timeContext: any,
  reasons: RecommendationReason[],
): number {
  const templatePatterns = usagePatterns.filter((p) => p.templateId === template.id)

  if (templatePatterns.length === 0) return 0

  let timeScore = 0
  let timeMatches = 0

  templatePatterns.forEach((pattern) => {
    // 시간대 매칭 (±2시간 범위)
    if (Math.abs(pattern.timeOfDay - timeContext.hour) <= 2) {
      timeScore += 0.3
      timeMatches++
    }

    // 요일 매칭
    if (pattern.dayOfWeek === timeContext.dayOfWeek) {
      timeScore += 0.4
      timeMatches++
    }

    // 월 매칭 (계절성)
    if (pattern.month === timeContext.month) {
      timeScore += 0.3
      timeMatches++
    }
  })

  if (timeMatches > 0) {
    const avgScore = timeScore / timeMatches
    reasons.push({
      type: "temporal",
      description: `현재 시간대에 자주 사용되는 템플릿입니다`,
      weight: avgScore,
    })
    return avgScore
  }

  return 0
}

// 성공률 점수 계산
function calculateSuccessScore(
  template: BulkEditTemplate,
  usagePatterns: UsagePattern[],
  reasons: RecommendationReason[],
): number {
  const templatePatterns = usagePatterns.filter((p) => p.templateId === template.id)

  if (templatePatterns.length === 0) return 0.5 // 기본값

  const avgSuccessRate = templatePatterns.reduce((sum, p) => sum + p.successRate, 0) / templatePatterns.length

  if (avgSuccessRate > 0.8) {
    reasons.push({
      type: "success_rate",
      description: `이 템플릿은 ${Math.round(avgSuccessRate * 100)}%의 높은 성공률을 보입니다`,
      weight: avgSuccessRate,
    })
  }

  return avgSuccessRate
}

// 사용자 선호도 점수 계산
function calculatePreferenceScore(
  template: BulkEditTemplate,
  userPreferences: any,
  reasons: RecommendationReason[],
): number {
  if (!userPreferences || !userPreferences.favoriteTemplates) return 0

  if (userPreferences.favoriteTemplates.includes(template.id)) {
    reasons.push({
      type: "user_preference",
      description: "즐겨찾기에 등록된 템플릿입니다",
      weight: 1.0,
    })
    return 1.0
  }

  // 카테고리 선호도
  if (userPreferences.preferredCategories && userPreferences.preferredCategories[template.category]) {
    const preference = userPreferences.preferredCategories[template.category]
    reasons.push({
      type: "user_preference",
      description: `선호하는 카테고리(${template.category})의 템플릿입니다`,
      weight: preference,
    })
    return preference
  }

  return 0
}

// 신뢰도 계산
function calculateConfidence(reasons: RecommendationReason[], vehicleCount: number): number {
  let confidence = 0

  // 추천 근거의 다양성
  const reasonTypes = new Set(reasons.map((r) => r.type))
  confidence += reasonTypes.size * 0.15

  // 추천 근거의 강도
  const avgWeight = reasons.reduce((sum, r) => sum + r.weight, 0) / reasons.length
  confidence += avgWeight * 0.4

  // 선택된 차량 수 (더 많은 차량일수록 패턴이 명확)
  confidence += Math.min(vehicleCount / 10, 1) * 0.2

  // 추천 근거의 개수
  confidence += Math.min(reasons.length / 5, 1) * 0.25

  return Math.max(0, Math.min(1, confidence))
}

// 현재 시간 컨텍스트 가져오기
function getCurrentTimeContext() {
  const now = new Date()
  return {
    hour: now.getHours(),
    dayOfWeek: now.getDay(),
    month: now.getMonth() + 1,
    date: now.toISOString(),
  }
}

// 사용 패턴 데이터 로드 (시뮬레이션)
async function loadUsagePatterns(): Promise<UsagePattern[]> {
  // 실제 구현에서는 데이터베이스에서 로드
  return [
    {
      templateId: 1,
      vehicleCharacteristics: {
        branches: ["서울지파"],
        churches: ["본교회", "강남교회"],
        departments: ["청년부", "장년부"],
        statuses: ["완료"],
      },
      timeOfDay: 14,
      dayOfWeek: 1, // 월요일
      month: 2,
      usageCount: 15,
      successRate: 0.93,
      lastUsed: "2024-02-15T14:30:00Z",
    },
    {
      templateId: 2,
      vehicleCharacteristics: {
        branches: ["서울지파", "경기지파"],
        churches: ["본교회"],
        departments: ["청년부"],
        statuses: ["대기"],
      },
      timeOfDay: 10,
      dayOfWeek: 2, // 화요일
      month: 2,
      usageCount: 32,
      successRate: 0.87,
      lastUsed: "2024-02-20T10:15:00Z",
    },
    // 더 많은 패턴 데이터...
  ]
}

// 사용자 선호도 데이터 로드 (시뮬레이션)
async function loadUserPreferences(userId: string) {
  // 실제 구현에서는 데이터베이스에서 로드
  return {
    favoriteTemplates: [1, 2],
    preferredCategories: {
      "상태 관리": 0.8,
      "지파 관리": 0.6,
    },
    recentlyUsed: [2, 1, 3],
  }
}

// 모든 템플릿 로드 (기존 함수 재사용)
async function getAllTemplates(): Promise<BulkEditTemplate[]> {
  // getTemplates 함수 재사용
  const { getTemplates } = await import("./template-actions")
  return await getTemplates()
}

// 추천 피드백 저장 (학습 데이터)
export async function saveRecommendationFeedback(
  templateId: number,
  wasUsed: boolean,
  vehicleAnalysis: VehicleAnalysis,
  userRating?: number,
) {
  console.log("추천 피드백 저장:", { templateId, wasUsed, userRating })

  // 실제 구현에서는 데이터베이스에 저장하여 AI 모델 개선에 활용
  try {
    // 피드백 데이터를 저장하여 추천 알고리즘 개선
    const feedbackData = {
      templateId,
      wasUsed,
      userRating,
      vehicleCharacteristics: vehicleAnalysis,
      timestamp: new Date().toISOString(),
    }

    // 실제 구현:
    // await supabase.from('recommendation_feedback').insert(feedbackData)

    return { success: true }
  } catch (error) {
    console.error("피드백 저장 오류:", error)
    return { success: false }
  }
}
