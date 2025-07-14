"use server"

// 엑셀 다운로드를 위한 차량 데이터 가져오기
export async function getVehiclesForExcel() {
  // 실제 구현에서는 데이터베이스에서 데이터를 가져옵니다
  // 현재는 샘플 데이터를 반환합니다

  // 지연 시뮬레이션 (실제 구현에서는 제거)
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: 1,
      name: "김성도",
      phone: "010-1234-5678",
      carNumber: "12가3456",
      carModel: "소나타",
      carType: "승용차",
      branch: "요한",
      church: "본교회",
      department: "청년부",
      status: "완료",
      registeredAt: "2024-01-15",
      approvedAt: "2024-01-16",
      notes: "승인 완료되었습니다.",
    },
    {
      id: 2,
      name: "이신자",
      phone: "010-2345-6789",
      carNumber: "34나5678",
      carModel: "아반떼",
      carType: "승용차",
      branch: "베드로",
      church: "본교회",
      department: "장년부",
      status: "대기",
      registeredAt: "2024-01-20",
      approvedAt: null,
      notes: "관리자 검토 중입니다.",
    },
    {
      id: 3,
      name: "박교인",
      phone: "010-3456-7890",
      carNumber: "56다7890",
      carModel: "그랜저",
      carType: "승용차",
      branch: "부산야고보",
      church: "지교회",
      department: "장로회",
      status: "완료",
      registeredAt: "2024-01-10",
      approvedAt: "2024-01-12",
      notes: "승인 완료되었습니다.",
    },
    {
      id: 4,
      name: "최집사",
      phone: "010-4567-8901",
      carNumber: "78라9012",
      carModel: "카니발",
      carType: "승합차",
      branch: "안드레",
      church: "지교회",
      department: "집사회",
      status: "완료",
      registeredAt: "2024-01-05",
      approvedAt: "2024-01-07",
      notes: "승인 완료되었습니다.",
    },
    {
      id: 5,
      name: "정권사",
      phone: "010-5678-9012",
      carNumber: "90마3456",
      carModel: "스타렉스",
      carType: "승합차",
      branch: "다대오",
      church: "본교회",
      department: "권사회",
      status: "거부",
      registeredAt: "2024-01-18",
      approvedAt: null,
      notes: "서류 미비로 거부되었습니다.",
    },
  ]
}

// 차량 통계 데이터 가져오기
export async function getVehicleStatistics() {
  // 실제 구현에서는 데이터베이스에서 통계 데이터를 가져옵니다
  // 현재는 샘플 데이터를 반환합니다

  // 지연 시뮬레이션 (실제 구현에서는 제거)
  await new Promise((resolve) => setTimeout(resolve, 300))

  return {
    total: 120,
    approved: 95,
    pending: 18,
    rejected: 7,
    byType: {
      sedan: 78,
      suv: 25,
      van: 17,
    },
    byBranch: {
      요한: 35,
      베드로: 28,
      부산야고보: 22,
      안드레: 19,
      다대오: 16,
    },
  }
}

// 최근 등록된 차량 데이터 가져오기
export async function getRecentVehicles() {
  // 실제 구현에서는 데이터베이스에서 최근 등록된 차량 데이터를 가져옵니다
  // 현재는 샘플 데이터를 반환합니다

  // 지연 시뮬레이션 (실제 구현에서는 제거)
  await new Promise((resolve) => setTimeout(resolve, 200))

  return [
    {
      id: 101,
      name: "김새신자",
      carNumber: "22가1234",
      carModel: "투싼",
      status: "대기",
      registeredAt: "2024-06-12",
    },
    {
      id: 102,
      name: "이집사",
      carNumber: "33나5678",
      carModel: "K5",
      status: "완료",
      registeredAt: "2024-06-11",
    },
    {
      id: 103,
      name: "박권사",
      carNumber: "44다9012",
      carModel: "카니발",
      status: "완료",
      registeredAt: "2024-06-10",
    },
    {
      id: 104,
      name: "최장로",
      carNumber: "55라3456",
      carModel: "팰리세이드",
      status: "대기",
      registeredAt: "2024-06-09",
    },
    {
      id: 105,
      name: "정목사",
      carNumber: "66마7890",
      carModel: "스타리아",
      status: "완료",
      registeredAt: "2024-06-08",
    },
  ]
}
