"use server"

// 교회 차량 데이터 타입
interface ChurchVehicle {
  id: number
  plateNumber: string
  model: string
  year: number
  branch: string
  department: string
  manager: string
  status: "운행중" | "정비중" | "대기중" | "폐차"
  lastInspection: string
  mileage: number
  fuelType: string
  registrationDate: string
  notes?: string
  insuranceExpiry?: string
  maintenanceSchedule?: string
}

// 샘플 교회 차량 데이터
const sampleChurchVehicles: ChurchVehicle[] = [
  {
    id: 1,
    plateNumber: "12가3456",
    model: "소나타",
    year: 2022,
    branch: "요한",
    department: "총무부",
    manager: "김관리자",
    status: "운행중",
    lastInspection: "2024-01-10",
    mileage: 15000,
    fuelType: "가솔린",
    registrationDate: "2022-03-15",
    notes: "정기 점검 완료",
    insuranceExpiry: "2024-12-31",
    maintenanceSchedule: "2024-07-10",
  },
  {
    id: 2,
    plateNumber: "34나5678",
    model: "아반떼",
    year: 2021,
    branch: "베드로",
    department: "행정서무부",
    manager: "이담당자",
    status: "정비중",
    lastInspection: "2023-12-15",
    mileage: 22000,
    fuelType: "가솔린",
    registrationDate: "2021-08-20",
    notes: "엔진 정비 중",
    insuranceExpiry: "2024-08-20",
    maintenanceSchedule: "2024-06-20",
  },
  {
    id: 3,
    plateNumber: "56다7890",
    model: "그랜저",
    year: 2023,
    branch: "부산야고보",
    department: "기획부",
    manager: "박직원",
    status: "운행중",
    lastInspection: "2024-01-05",
    mileage: 8000,
    fuelType: "하이브리드",
    registrationDate: "2023-01-10",
    notes: "신차 등록",
    insuranceExpiry: "2025-01-10",
    maintenanceSchedule: "2024-07-05",
  },
  {
    id: 4,
    plateNumber: "78라9012",
    model: "카니발",
    year: 2020,
    branch: "안드레",
    department: "교육부",
    manager: "최교육",
    status: "대기중",
    lastInspection: "2023-11-20",
    mileage: 45000,
    fuelType: "디젤",
    registrationDate: "2020-05-12",
    notes: "교육용 차량",
    insuranceExpiry: "2024-05-12",
    maintenanceSchedule: "2024-05-20",
  },
  {
    id: 5,
    plateNumber: "90마3456",
    model: "스타렉스",
    year: 2019,
    branch: "다대오",
    department: "봉사교통부",
    manager: "정봉사",
    status: "운행중",
    lastInspection: "2024-01-08",
    mileage: 67000,
    fuelType: "디젤",
    registrationDate: "2019-09-25",
    notes: "봉사활동용 차량",
    insuranceExpiry: "2024-09-25",
    maintenanceSchedule: "2024-07-08",
  },
]

// 교회 차량 목록 조회
export async function getChurchVehicles() {
  // 실제 구현에서는 데이터베이스에서 조회
  return sampleChurchVehicles
}

// 교회 차량 엑셀 데이터 조회
export async function getChurchVehiclesForExcel() {
  const vehicles = await getChurchVehicles()

  return vehicles.map((vehicle) => ({
    ID: vehicle.id,
    차량번호: vehicle.plateNumber,
    모델: vehicle.model,
    연식: vehicle.year,
    지파: vehicle.branch,
    부서: vehicle.department,
    담당자: vehicle.manager,
    상태: vehicle.status,
    최근점검일: vehicle.lastInspection,
    주행거리: vehicle.mileage,
    연료타입: vehicle.fuelType,
    등록일: vehicle.registrationDate,
    보험만료일: vehicle.insuranceExpiry || "",
    정비예정일: vehicle.maintenanceSchedule || "",
    비고: vehicle.notes || "",
  }))
}

// 교회 차량 통계
export async function getChurchVehicleStatistics() {
  const vehicles = await getChurchVehicles()

  return {
    total: vehicles.length,
    running: vehicles.filter((v) => v.status === "운행중").length,
    maintenance: vehicles.filter((v) => v.status === "정비중").length,
    waiting: vehicles.filter((v) => v.status === "대기중").length,
    scrapped: vehicles.filter((v) => v.status === "폐차").length,
    byBranch: vehicles.reduce(
      (acc, vehicle) => {
        acc[vehicle.branch] = (acc[vehicle.branch] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
    byFuelType: vehicles.reduce(
      (acc, vehicle) => {
        acc[vehicle.fuelType] = (acc[vehicle.fuelType] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  }
}

// 교회 차량 데이터 가져오기 (엑셀에서)
export async function importChurchVehicles(vehicleData: any[]) {
  try {
    // 실제 구현에서는 데이터베이스에 저장
    console.log("교회 차량 데이터 가져오기:", vehicleData)

    // 데이터 검증
    const validatedData = vehicleData.map((item, index) => {
      const errors = []

      if (!item.차량번호) errors.push(`${index + 1}행: 차량번호가 필요합니다`)
      if (!item.모델) errors.push(`${index + 1}행: 모델이 필요합니다`)
      if (!item.연식) errors.push(`${index + 1}행: 연식이 필요합니다`)

      return { ...item, errors }
    })

    const hasErrors = validatedData.some((item) => item.errors.length > 0)

    if (hasErrors) {
      return {
        success: false,
        message: "데이터 검증 실패",
        errors: validatedData.filter((item) => item.errors.length > 0).flatMap((item) => item.errors),
      }
    }

    // 성공적으로 처리된 경우
    return {
      success: true,
      message: `${vehicleData.length}개의 교회 차량 데이터를 성공적으로 가져왔습니다.`,
      importedCount: vehicleData.length,
    }
  } catch (error) {
    console.error("교회 차량 데이터 가져오기 오류:", error)
    return {
      success: false,
      message: "데이터 가져오기 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// 교회 차량 추가
export async function addChurchVehicle(vehicleData: any) {
  try {
    // 실제 구현에서는 데이터베이스에 저장
    console.log("새 교회 차량 등록:", vehicleData)

    // 데이터 검증
    if (!vehicleData.plateNumber || !vehicleData.model || !vehicleData.manager) {
      return {
        success: false,
        message: "필수 정보가 누락되었습니다.",
      }
    }

    // 차량번호 중복 검사 (시뮬레이션)
    const existingVehicles = await getChurchVehicles()
    const isDuplicate = existingVehicles.some((vehicle) => vehicle.plateNumber === vehicleData.plateNumber)

    if (isDuplicate) {
      return {
        success: false,
        message: "이미 등록된 차량번호입니다.",
      }
    }

    // 새 차량 데이터 생성
    const newVehicle = {
      id: Date.now(), // 실제로는 데이터베이스에서 자동 생성
      plateNumber: vehicleData.plateNumber,
      model: `${vehicleData.brand} ${vehicleData.model}`,
      year: vehicleData.year,
      branch: vehicleData.branch,
      department: vehicleData.department,
      manager: vehicleData.manager,
      status: vehicleData.status || "운행중",
      lastInspection: vehicleData.lastInspection,
      mileage: vehicleData.mileage,
      fuelType: vehicleData.fuelType,
      registrationDate: vehicleData.registrationDate,
      notes: vehicleData.notes || "",
      insuranceExpiry: vehicleData.insuranceExpiry || "",
      maintenanceSchedule: "", // 기본값
    }

    // 실제 구현에서는 데이터베이스에 저장
    // await db.churchVehicles.create(newVehicle)

    // 시뮬레이션을 위한 지연
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "교회 차량이 성공적으로 등록되었습니다.",
      vehicle: newVehicle,
    }
  } catch (error) {
    console.error("교회 차량 등록 오류:", error)
    return {
      success: false,
      message: "차량 등록 중 오류가 발생했습니다.",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
