"use server"

import { revalidatePath } from "next/cache"

interface VehicleData {
  ownerName: string
  phoneNumber: string
  telegramId?: string
  branch: string
  region: string
  department: string
  vehicleType: string
  plateNumber: string
  model: string
  year: number
  color?: string
  purpose?: string
  agreeTerms: boolean
}

export async function registerVehicle(data: VehicleData) {
  try {
    // 실제 구현에서는 데이터베이스에 저장
    console.log("차량 등록 데이터:", data)

    // 시뮬레이션을 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 성공 응답
    revalidatePath("/")
    return {
      success: true,
      message: "차량이 성공적으로 등록되었습니다. 승인 처리까지 1-2일 소요됩니다.",
    }
  } catch (error) {
    console.error("차량 등록 오류:", error)
    return {
      success: false,
      message: "차량 등록 중 오류가 발생했습니다.",
    }
  }
}
