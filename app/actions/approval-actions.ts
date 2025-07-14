"use server"

import { revalidatePath } from "next/cache"
import { sendTelegramMessage, createApprovalMessage, createRejectionMessage } from "@/lib/telegram"

// 차량 승인 액션
export async function approveVehicle(id: number) {
  try {
    console.log("차량 승인 요청:", id)

    // 실제 구현에서는 데이터베이스에서 차량 정보를 업데이트합니다
    // 예시: await db.update('vehicles').set({ status: '완료', approvedAt: new Date() }).where('id', id)

    // 시뮬레이션: 차량 정보 조회
    const vehicleData = await getVehicleData(id)

    if (!vehicleData) {
      throw new Error("차량 정보를 찾을 수 없습니다.")
    }

    // 텔레그램 ID가 있는 경우 알림 메시지 전송
    if (vehicleData.telegramId) {
      const message = createApprovalMessage(vehicleData)
      await sendTelegramMessage(vehicleData.telegramId, message).catch((error) => {
        console.error("텔레그램 메시지 전송 실패:", error)
        // 메시지 전송 실패해도 승인은 성공으로 처리
      })
    }

    // 관련 페이지 재검증
    revalidatePath("/admin/vehicles")

    return { success: true, message: "차량이 성공적으로 승인되었습니다." }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    }
  }
}

// 차량 반려 액션
export async function rejectVehicle(id: number, reason: string) {
  try {
    console.log("차량 반려 요청:", id, "사유:", reason)

    // 실제 구현에서는 데이터베이스에서 차량 정보를 업데이트합니다
    // 예시: await db.update('vehicles').set({ status: '반려', rejectedAt: new Date(), rejectionReason: reason }).where('id', id)

    // 시뮬레이션: 차량 정보 조회
    const vehicleData = await getVehicleData(id)

    if (!vehicleData) {
      throw new Error("차량 정보를 찾을 수 없습니다.")
    }

    // 텔레그램 ID가 있는 경우 알림 메시지 전송
    if (vehicleData.telegramId) {
      const message = createRejectionMessage(vehicleData, reason)
      await sendTelegramMessage(vehicleData.telegramId, message).catch((error) => {
        console.error("텔레그램 메시지 전송 실패:", error)
        // 메시지 전송 실패해도 반려는 성공으로 처리
      })
    }

    // 관련 페이지 재검증
    revalidatePath("/admin/vehicles")

    return { success: true, message: "차량이 반려되었습니다." }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    }
  }
}

// 차량 정보 조회 (시뮬레이션)
async function getVehicleData(id: number) {
  // 실제 구현에서는 데이터베이스에서 차량 정보를 조회합니다
  // 예시: return await db.select().from('vehicles').where('id', id).first()

  // 시뮬레이션 데이터
  const mockVehicles = [
    {
      id: 1,
      name: "김성도",
      telegramId: "user123",
      phone: "010-1234-5678",
      carNumber: "12가3456",
      carModel: "소나타",
      carType: "승용차",
      branch: "서울지파",
      church: "본교회",
      department: "청년부",
      status: "대기",
      registeredAt: "2024-01-15",
    },
    {
      id: 2,
      name: "이신자",
      telegramId: "user456",
      phone: "010-2345-6789",
      carNumber: "23나4567",
      carModel: "아반떼",
      carType: "승용차",
      branch: "서울지파",
      church: "본교회",
      department: "청년부",
      status: "대기",
      registeredAt: "2024-01-20",
    },
  ]

  return mockVehicles.find((v) => v.id === id)
}
