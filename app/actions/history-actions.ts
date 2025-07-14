"use server"

import { revalidatePath } from "next/cache"

// 수정 이력 저장 함수
export async function saveEditHistory(vehicleId: number, prevData: any, newData: any, reason = "") {
  // 실제 구현에서는 데이터베이스에 이력을 저장합니다
  // 예: Supabase, Neon, Firebase 등을 사용하여 데이터 저장

  console.log("수정 이력 저장:", { vehicleId, prevData, newData, reason })

  try {
    // 변경된 필드만 추출
    const changedFields: Record<string, { before: any; after: any }> = {}

    Object.keys(newData).forEach((key) => {
      if (JSON.stringify(prevData[key]) !== JSON.stringify(newData[key])) {
        changedFields[key] = {
          before: prevData[key],
          after: newData[key],
        }
      }
    })

    // 실제 구현 예시:
    /*
    const { error } = await supabase
      .from('vehicle_edit_history')
      .insert({
        vehicle_id: vehicleId,
        changed_fields: changedFields,
        reason: reason,
        edited_at: new Date().toISOString(),
        edited_by: session.user.id // 실제 구현에서는 인증된 사용자 ID
      })
    
    if (error) {
      throw new Error('수정 이력 저장에 실패했습니다.')
    }
    */

    // 시뮬레이션: 랜덤하게 성공/실패 결정
    const isSuccess = Math.random() > 0.1

    if (!isSuccess) {
      throw new Error("서버 오류로 인해 수정 이력 저장에 실패했습니다.")
    }

    // 관련 페이지 재검증
    revalidatePath(`/my-vehicles/history/${vehicleId}`)
    revalidatePath(`/admin/vehicles/${vehicleId}/history`)

    return {
      success: true,
      message: "수정 이력이 성공적으로 저장되었습니다.",
    }
  } catch (error) {
    console.error("수정 이력 저장 오류:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    }
  }
}

// 차량별 수정 이력 조회 함수
export async function getVehicleEditHistory(vehicleId: number) {
  // 실제 구현에서는 데이터베이스에서 이력을 조회합니다
  console.log("차량 수정 이력 조회 요청 ID:", vehicleId)

  // 시뮬레이션 데이터
  const mockHistory = [
    {
      id: 1,
      vehicleId: vehicleId,
      changedFields: {
        carModel: {
          before: "소나타",
          after: "아반떼",
        },
        branch: {
          before: "서울지파",
          after: "경기지파",
        },
      },
      reason: "차량 정보 및 소속 변경",
      editedAt: "2024-01-25T14:30:00Z",
      editedBy: "김성도",
      editedByRole: "차주",
    },
    {
      id: 2,
      vehicleId: vehicleId,
      changedFields: {
        phone: {
          before: "010-1234-5678",
          after: "010-8765-4321",
        },
      },
      reason: "연락처 변경",
      editedAt: "2024-01-28T09:15:00Z",
      editedBy: "김성도",
      editedByRole: "차주",
    },
    {
      id: 3,
      vehicleId: vehicleId,
      changedFields: {
        department: {
          before: "청년부",
          after: "장년부",
        },
        church: {
          before: "본교회",
          after: "강남교회",
        },
      },
      reason: "소속 부서 및 교회 변경",
      editedAt: "2024-02-05T16:45:00Z",
      editedBy: "김성도",
      editedByRole: "차주",
    },
  ]

  // 시간순 정렬 (최신순)
  return mockHistory.sort((a, b) => new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime())
}

// 관리자용 전체 수정 이력 조회 함수
export async function getAllEditHistory(page = 1, limit = 10) {
  // 실제 구현에서는 데이터베이스에서 이력을 조회합니다
  console.log("전체 수정 이력 조회 요청:", { page, limit })

  // 시뮬레이션 데이터
  const mockHistory = [
    {
      id: 1,
      vehicleId: 2,
      vehicleNumber: "23나4567",
      changedFields: {
        carModel: {
          before: "소나타",
          after: "아반떼",
        },
        branch: {
          before: "서울지파",
          after: "경기지파",
        },
      },
      reason: "차량 정보 및 소속 변경",
      editedAt: "2024-01-25T14:30:00Z",
      editedBy: "김성도",
      editedByRole: "차주",
    },
    {
      id: 2,
      vehicleId: 2,
      vehicleNumber: "23나4567",
      changedFields: {
        phone: {
          before: "010-1234-5678",
          after: "010-8765-4321",
        },
      },
      reason: "연락처 변경",
      editedAt: "2024-01-28T09:15:00Z",
      editedBy: "김성도",
      editedByRole: "차주",
    },
    {
      id: 3,
      vehicleId: 2,
      vehicleNumber: "23나4567",
      changedFields: {
        department: {
          before: "청년부",
          after: "장년부",
        },
        church: {
          before: "본교회",
          after: "강남교회",
        },
      },
      reason: "소속 부서 및 교회 변경",
      editedAt: "2024-02-05T16:45:00Z",
      editedBy: "김성도",
      editedByRole: "차주",
    },
    {
      id: 4,
      vehicleId: 3,
      vehicleNumber: "34다5678",
      changedFields: {
        carNumber: {
          before: "34다5678",
          after: "34다9999",
        },
      },
      reason: "차량번호 변경",
      editedAt: "2024-02-10T11:20:00Z",
      editedBy: "박권사",
      editedByRole: "차주",
    },
    {
      id: 5,
      vehicleId: 5,
      vehicleNumber: "56마7890",
      changedFields: {
        status: {
          before: "대기",
          after: "완료",
        },
      },
      reason: "관리자 승인",
      editedAt: "2024-02-15T13:10:00Z",
      editedBy: "관리자",
      editedByRole: "관리자",
    },
  ]

  // 시간순 정렬 (최신순)
  const sortedHistory = mockHistory.sort((a, b) => new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime())

  // 페이지네이션
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedHistory = sortedHistory.slice(startIndex, endIndex)

  return {
    history: paginatedHistory,
    total: mockHistory.length,
    page,
    limit,
    totalPages: Math.ceil(mockHistory.length / limit),
  }
}
