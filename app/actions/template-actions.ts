"use server"

import { revalidatePath } from "next/cache"

// 템플릿 데이터 타입
export interface BulkEditTemplate {
  id: number
  name: string
  description: string
  category: string
  fieldsToUpdate: Record<string, boolean>
  updates: {
    branch?: string
    church?: string
    department?: string
    status?: string
    notes?: string
  }
  createdAt: string
  updatedAt: string
  createdBy: string
  usageCount: number
  isFavorite: boolean
  tags: string[]
}

// 템플릿 저장 함수
export async function saveTemplate(
  templateData: Omit<BulkEditTemplate, "id" | "createdAt" | "updatedAt" | "usageCount">,
) {
  // 실제 구현에서는 데이터베이스에 템플릿을 저장합니다
  console.log("템플릿 저장:", templateData)

  try {
    // 실제 구현 예시:
    /*
    const { data, error } = await supabase
      .from('bulk_edit_templates')
      .insert({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        fields_to_update: templateData.fieldsToUpdate,
        updates: templateData.updates,
        created_by: templateData.createdBy,
        is_favorite: templateData.isFavorite,
        tags: templateData.tags,
        usage_count: 0
      })
      .select()
      .single()
    
    if (error) {
      throw new Error(error.message)
    }
    */

    // 시뮬레이션: 랜덤하게 성공/실패 결정
    const isSuccess = Math.random() > 0.1

    if (!isSuccess) {
      throw new Error("서버 오류로 인해 템플릿 저장에 실패했습니다.")
    }

    // 관련 페이지 재검증
    revalidatePath("/admin/bulk-edit")

    return {
      success: true,
      message: "템플릿이 성공적으로 저장되었습니다.",
      templateId: Math.floor(Math.random() * 1000) + 1, // 시뮬레이션 ID
    }
  } catch (error) {
    console.error("템플릿 저장 오류:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "템플릿 저장 중 오류가 발생했습니다.",
    }
  }
}

// 템플릿 목록 조회 함수
export async function getTemplates(filters?: { category?: string; search?: string; onlyFavorites?: boolean }) {
  // 실제 구현에서는 데이터베이스에서 템플릿 목록을 조회합니다
  console.log("템플릿 목록 조회:", filters)

  // 시뮬레이션 데이터
  const mockTemplates: BulkEditTemplate[] = [
    {
      id: 1,
      name: "서울지파 → 경기지파 이전",
      description: "서울지파 소속 차량들을 경기지파로 일괄 이전할 때 사용",
      category: "지파 관리",
      fieldsToUpdate: { branch: true, notes: true },
      updates: {
        branch: "경기지파",
        notes: "지파 이전으로 인한 소속 변경",
      },
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-20T14:20:00Z",
      createdBy: "관리자",
      usageCount: 15,
      isFavorite: true,
      tags: ["지파", "이전", "소속변경"],
    },
    {
      id: 2,
      name: "대기 → 승인 완료",
      description: "검토가 완료된 차량들을 일괄 승인 처리",
      category: "상태 관리",
      fieldsToUpdate: { status: true, notes: true },
      updates: {
        status: "완료",
        notes: "관리자 검토 완료 - 승인",
      },
      createdAt: "2024-01-10T09:15:00Z",
      updatedAt: "2024-01-25T16:45:00Z",
      createdBy: "관리자",
      usageCount: 32,
      isFavorite: true,
      tags: ["승인", "상태변경", "완료"],
    },
    {
      id: 3,
      name: "청년부 → 장년부 이동",
      description: "연령 변경으로 인한 부서 이동 처리",
      category: "부서 관리",
      fieldsToUpdate: { department: true, notes: true },
      updates: {
        department: "장년부",
        notes: "연령 변경으로 인한 부서 이동",
      },
      createdAt: "2024-01-08T11:20:00Z",
      updatedAt: "2024-01-22T13:30:00Z",
      createdBy: "관리자",
      usageCount: 8,
      isFavorite: false,
      tags: ["부서", "이동", "연령변경"],
    },
    {
      id: 4,
      name: "본교회 → 강남교회 이전",
      description: "교회 이전으로 인한 소속 교회 변경",
      category: "교회 관리",
      fieldsToUpdate: { church: true, notes: true },
      updates: {
        church: "강남교회",
        notes: "교회 이전으로 인한 소속 변경",
      },
      createdAt: "2024-01-12T15:45:00Z",
      updatedAt: "2024-01-18T10:15:00Z",
      createdBy: "관리자",
      usageCount: 5,
      isFavorite: false,
      tags: ["교회", "이전", "소속변경"],
    },
    {
      id: 5,
      name: "임시 승인 거부",
      description: "서류 미비로 인한 임시 승인 거부 처리",
      category: "상태 관리",
      fieldsToUpdate: { status: true, notes: true },
      updates: {
        status: "거부",
        notes: "서류 미비로 인한 승인 거부 - 재신청 필요",
      },
      createdAt: "2024-01-05T14:10:00Z",
      updatedAt: "2024-01-15T09:25:00Z",
      createdBy: "관리자",
      usageCount: 3,
      isFavorite: false,
      tags: ["거부", "서류미비", "재신청"],
    },
  ]

  // 필터링 적용
  let filteredTemplates = mockTemplates

  if (filters?.category && filters.category !== "all") {
    filteredTemplates = filteredTemplates.filter((template) => template.category === filters.category)
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filteredTemplates = filteredTemplates.filter(
      (template) =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
    )
  }

  if (filters?.onlyFavorites) {
    filteredTemplates = filteredTemplates.filter((template) => template.isFavorite)
  }

  // 사용 횟수 순으로 정렬 (즐겨찾기가 먼저)
  filteredTemplates.sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return b.usageCount - a.usageCount
  })

  return filteredTemplates
}

// 템플릿 업데이트 함수
export async function updateTemplate(id: number, templateData: Partial<BulkEditTemplate>) {
  console.log("템플릿 업데이트:", { id, templateData })

  try {
    // 실제 구현에서는 데이터베이스에서 템플릿을 업데이트합니다
    const isSuccess = Math.random() > 0.1

    if (!isSuccess) {
      throw new Error("서버 오류로 인해 템플릿 업데이트에 실패했습니다.")
    }

    revalidatePath("/admin/bulk-edit")

    return {
      success: true,
      message: "템플릿이 성공적으로 업데이트되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "템플릿 업데이트 중 오류가 발생했습니다.",
    }
  }
}

// 템플릿 삭제 함수
export async function deleteTemplate(id: number) {
  console.log("템플릿 삭제:", id)

  try {
    const isSuccess = Math.random() > 0.1

    if (!isSuccess) {
      throw new Error("서버 오류로 인해 템플릿 삭제에 실패했습니다.")
    }

    revalidatePath("/admin/bulk-edit")

    return {
      success: true,
      message: "템플릿이 성공적으로 삭제되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "템플릿 삭제 중 오류가 발생했습니다.",
    }
  }
}

// 템플릿 즐겨찾기 토글 함수
export async function toggleTemplateFavorite(id: number, isFavorite: boolean) {
  console.log("템플릿 즐겨찾기 토글:", { id, isFavorite })

  try {
    const isSuccess = Math.random() > 0.1

    if (!isSuccess) {
      throw new Error("서버 오류로 인해 즐겨찾기 설정에 실패했습니다.")
    }

    revalidatePath("/admin/bulk-edit")

    return {
      success: true,
      message: isFavorite ? "즐겨찾기에 추가되었습니다." : "즐겨찾기에서 제거되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "즐겨찾기 설정 중 오류가 발생했습니다.",
    }
  }
}

// 템플릿 사용 횟수 증가 함수
export async function incrementTemplateUsage(id: number) {
  console.log("템플릿 사용 횟수 증가:", id)

  try {
    // 실제 구현에서는 데이터베이스에서 사용 횟수를 증가시킵니다
    const isSuccess = Math.random() > 0.05

    if (!isSuccess) {
      throw new Error("사용 횟수 업데이트에 실패했습니다.")
    }

    return { success: true }
  } catch (error) {
    console.error("사용 횟수 업데이트 오류:", error)
    return { success: false }
  }
}
