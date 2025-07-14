"use server"

import { revalidatePath } from "next/cache"

// 차량 정보 조회 (ID로)
export async function getVehicleById(id: number) {
  // 실제 구현에서는 데이터베이스에서 차량 정보를 조회합니다
  // 예: Supabase, Neon, Firebase 등을 사용하여 데이터 조회

  console.log("차량 조회 요청 ID:", id)

  // 현재는 샘플 데이터로 시뮬레이션
  const sampleVehicles = [
    {
      id: 1,
      name: "김성도",
      phone: "010-1234-5678",
      carNumber: "12가3456",
      carModel: "소나타",
      carType: "승용차",
      branch: "서울지파",
      church: "본교회",
      department: "청년부",
      status: "완료",
      registeredAt: "2024-01-15",
      approvedAt: "2024-01-16",
      notes: "승인 완료되었습니다.",
    },
    {
      id: 2,
      name: "김성도",
      phone: "010-1234-5678",
      carNumber: "23나4567",
      carModel: "아반떼",
      carType: "승용차",
      branch: "서울지파",
      church: "본교회",
      department: "청년부",
      status: "대기",
      registeredAt: "2024-01-20",
      approvedAt: null,
      notes: "관리자 검토 중입니다.",
    },
  ]

  const vehicle = sampleVehicles.find((v) => v.id === id)
  return vehicle || null
}

// 차량 정보 업데이트
export async function updateVehicle(id: number, data: any) {
  // 실제 구현에서는 데이터베이스에서 차량 정보를 업데이트합니다
  // 예: Supabase, Neon, Firebase 등을 사용하여 데이터 업데이트

  console.log("차량 정보 업데이트:", { id, data })

  try {
    // 실제 구현 예시:
    /*
    const { error } = await supabase
      .from('vehicles')
      .update({
        name: data.name,
        phone: data.phone,
        car_number: data.carNumber,
        car_model: data.carModel,
        car_type: data.carType,
        branch: data.branch,
        church: data.church,
        department: data.department,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', '대기') // 대기 상태인 차량만 수정 가능
    
    if (error) {
      throw new Error('차량 정보 업데이트에 실패했습니다.')
    }
    */

    // 시뮬레이션: 랜덤하게 성공/실패 결정
    const isSuccess = Math.random() > 0.1

    if (!isSuccess) {
      throw new Error("서버 오류로 인해 수정에 실패했습니다. 잠시 후 다시 시도해주세요.")
    }

    // 관련 페이지 재검증
    revalidatePath("/my-vehicles")
    revalidatePath(`/my-vehicles/edit/${id}`)

    return {
      success: true,
      message: "차량 정보가 성공적으로 수정되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    }
  }
}

// 차량 조회 (연락처와 차량번호로)
export async function searchVehicles(searchData: { phone: string; carNumber: string }) {
  // 실제 구현에서는 데이터베이스에서 차량 정보를 조회합니다
  console.log("차량 조회 요청:", searchData)

  // 시뮬레이션 데이터
  const mockVehicles = [
    {
      id: 1,
      name: "김성도",
      phone: "010-1234-5678",
      carNumber: "12가3456",
      carModel: "소나타",
      carType: "승용차",
      branch: "서울지파",
      church: "본교회",
      department: "청년부",
      status: "완료",
      registeredAt: "2024-01-15",
      approvedAt: "2024-01-16",
      notes: "승인 완료되었습니다.",
    },
    {
      id: 2,
      name: "김성도",
      phone: "010-1234-5678",
      carNumber: "23나4567",
      carModel: "아반떼",
      carType: "승용차",
      branch: "서울지파",
      church: "본교회",
      department: "청년부",
      status: "대기",
      registeredAt: "2024-01-20",
      approvedAt: null,
      notes: "관리자 검토 중입니다.",
    },
  ]

  // 입력된 정보와 일치하는 차량 필터링
  const foundVehicles = mockVehicles.filter(
    (vehicle) => vehicle.phone === searchData.phone && vehicle.carNumber === searchData.carNumber,
  )

  return foundVehicles
}
