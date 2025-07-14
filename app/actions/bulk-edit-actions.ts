"use server"

import { revalidatePath } from "next/cache"
import { saveEditHistory } from "./history-actions"

// 일괄 수정 데이터 타입
interface BulkEditData {
  vehicleIds: number[]
  updates: {
    branch?: string
    church?: string
    department?: string
    status?: string
    notes?: string
  }
  reason: string
  editedBy: string
}

// 일괄 수정 결과 타입
interface BulkEditResult {
  success: boolean
  totalCount: number
  successCount: number
  failedCount: number
  results: Array<{
    vehicleId: number
    vehicleNumber: string
    success: boolean
    error?: string
  }>
  message: string
}

// 일괄 수정 실행 함수
export async function bulkEditVehicles(data: BulkEditData): Promise<BulkEditResult> {
  console.log("일괄 수정 요청:", data)

  try {
    // 실제 구현에서는 데이터베이스에서 차량 정보를 조회하고 업데이트합니다
    // 예: Supabase, Neon, Firebase 등을 사용

    const results: BulkEditResult["results"] = []
    let successCount = 0
    let failedCount = 0

    // 시뮬레이션 데이터 - 실제 구현에서는 데이터베이스에서 가져옴
    const vehicleData = [
      { id: 1, carNumber: "12가3456", name: "김성도", status: "완료" },
      { id: 2, carNumber: "23나4567", name: "이집사", status: "대기" },
      { id: 3, carNumber: "34다5678", name: "박권사", status: "완료" },
      { id: 4, carNumber: "45라6789", name: "최장로", status: "완료" },
      { id: 5, carNumber: "56마7890", name: "정성도", status: "대기" },
    ]

    // 각 차량에 대해 수정 작업 수행
    for (const vehicleId of data.vehicleIds) {
      const vehicle = vehicleData.find((v) => v.id === vehicleId)

      if (!vehicle) {
        results.push({
          vehicleId,
          vehicleNumber: "알 수 없음",
          success: false,
          error: "차량을 찾을 수 없습니다.",
        })
        failedCount++
        continue
      }

      try {
        // 실제 구현 예시:
        /*
        const { error } = await supabase
          .from('vehicles')
          .update(data.updates)
          .eq('id', vehicleId)
        
        if (error) {
          throw new Error(error.message)
        }
        */

        // 시뮬레이션: 랜덤하게 성공/실패 결정 (90% 성공률)
        const isSuccess = Math.random() > 0.1

        if (!isSuccess) {
          throw new Error("서버 오류로 인해 수정에 실패했습니다.")
        }

        // 수정 ��력 저장
        const originalData = {
          branch: "서울지파", // 실제로는 DB에서 가져온 원본 데이터
          church: "본교회",
          department: "청년부",
          status: vehicle.status,
          notes: "기존 메모",
        }

        await saveEditHistory(vehicleId, originalData, data.updates, data.reason)

        results.push({
          vehicleId,
          vehicleNumber: vehicle.carNumber,
          success: true,
        })
        successCount++
      } catch (error) {
        results.push({
          vehicleId,
          vehicleNumber: vehicle.carNumber,
          success: false,
          error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        })
        failedCount++
      }
    }

    // 관련 페이지 재검증
    revalidatePath("/admin")
    revalidatePath("/admin/vehicles")

    return {
      success: failedCount === 0,
      totalCount: data.vehicleIds.length,
      successCount,
      failedCount,
      results,
      message: `총 ${data.vehicleIds.length}개 차량 중 ${successCount}개 성공, ${failedCount}개 실패`,
    }
  } catch (error) {
    console.error("일괄 수정 오류:", error)
    return {
      success: false,
      totalCount: data.vehicleIds.length,
      successCount: 0,
      failedCount: data.vehicleIds.length,
      results: [],
      message: error instanceof Error ? error.message : "일괄 수정 중 오류가 발생했습니다.",
    }
  }
}

// 일괄 수정 가능한 차량 목록 조회
export async function getBulkEditableVehicles() {
  // 실제 구현에서는 데이터베이스에서 차량 목록을 조회합니다
  console.log("일괄 수정 가능한 차량 목록 조회")

  // 시뮬레이션 데이터 - 원래 지파명으로 업데이트
  const vehicles = [
    {
      id: 1,
      name: "김성도",
      phone: "010-1234-5678",
      carNumber: "12가3456",
      carModel: "소나타",
      branch: "요한",
      church: "본교회",
      department: "청년부",
      status: "완료",
      registeredAt: "2024-01-15",
    },
    {
      id: 2,
      name: "이집사",
      phone: "010-2345-6789",
      carNumber: "23나4567",
      carModel: "아반떼",
      branch: "베드로",
      church: "분당교회",
      department: "장년부",
      status: "대기",
      registeredAt: "2024-01-16",
    },
    {
      id: 3,
      name: "박권사",
      phone: "010-3456-7890",
      carNumber: "34다5678",
      carModel: "그랜저",
      branch: "부산야고보",
      church: "강남교회",
      department: "여전도회",
      status: "완료",
      registeredAt: "2024-01-17",
    },
    {
      id: 4,
      name: "최장로",
      phone: "010-4567-8901",
      carNumber: "45라6789",
      carModel: "카니발",
      branch: "안드레",
      church: "인천교회",
      department: "남전도회",
      status: "완료",
      registeredAt: "2024-01-18",
    },
    {
      id: 5,
      name: "정성도",
      phone: "010-5678-9012",
      carNumber: "56마7890",
      carModel: "투싼",
      branch: "다대오",
      church: "본교회",
      department: "청년부",
      status: "대기",
      registeredAt: "2024-01-19",
    },
    {
      id: 6,
      name: "김빌립",
      phone: "010-6789-0123",
      carNumber: "67바8901",
      carModel: "K5",
      branch: "빌립",
      church: "서울교회",
      department: "총무부",
      status: "완료",
      registeredAt: "2024-01-20",
    },
    {
      id: 7,
      name: "이시몬",
      phone: "010-7890-1234",
      carNumber: "78사9012",
      carModel: "스포티지",
      branch: "시몬",
      church: "부산교회",
      department: "기획부",
      status: "대기",
      registeredAt: "2024-01-21",
    },
    {
      id: 8,
      name: "박바돌로매",
      phone: "010-8901-2345",
      carNumber: "89아0123",
      carModel: "쏘렌토",
      branch: "바돌로매",
      church: "대구교회",
      department: "교육부",
      status: "완료",
      registeredAt: "2024-01-22",
    },
    {
      id: 9,
      name: "최마태",
      phone: "010-9012-3456",
      carNumber: "90자1234",
      carModel: "모닝",
      branch: "마태",
      church: "광주교회",
      department: "찬양부",
      status: "대기",
      registeredAt: "2024-01-23",
    },
    {
      id: 10,
      name: "정맛디아",
      phone: "010-0123-4567",
      carNumber: "01차2345",
      carModel: "레이",
      branch: "맛디아",
      church: "대전교회",
      department: "전도부",
      status: "완료",
      registeredAt: "2024-01-24",
    },
    {
      id: 11,
      name: "김서울야고보",
      phone: "010-1234-5678",
      carNumber: "12카3456",
      carModel: "셀토스",
      branch: "서울야고보",
      church: "서울교회",
      department: "문화부",
      status: "대기",
      registeredAt: "2024-01-25",
    },
    {
      id: 12,
      name: "이도마",
      phone: "010-2345-6789",
      carNumber: "23타4567",
      carModel: "니로",
      branch: "도마",
      church: "울산교회",
      department: "체육부",
      status: "완료",
      registeredAt: "2024-01-26",
    },
  ]

  return vehicles
}
