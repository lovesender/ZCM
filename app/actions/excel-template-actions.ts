"use server"

import { utils, write } from "xlsx"

// 교회 차량 템플릿 데이터
const getChurchVehicleTemplate = () => {
  const headers = [
    "차량번호",
    "모델",
    "연식",
    "지파",
    "부서",
    "담당자",
    "상태",
    "연료타입",
    "주행거리",
    "최근점검일",
    "등록일",
    "비고",
  ]

  const sampleData = [
    {
      차량번호: "12가3456",
      모델: "소나타",
      연식: 2022,
      지파: "요한",
      부서: "총무부",
      담당자: "김관리자",
      상태: "운행중",
      연료타입: "가솔린",
      주행거리: 15000,
      최근점검일: "2024-01-10",
      등록일: "2022-03-15",
      비고: "정기 점검 완료",
    },
    {
      차량번호: "34나5678",
      모델: "아반떼",
      연식: 2021,
      지파: "베드로",
      부서: "행정서무부",
      담당자: "이담당자",
      상태: "정비중",
      연료타입: "가솔린",
      주행거리: 22000,
      최근점검일: "2023-12-15",
      등록일: "2021-08-20",
      비고: "엔진 정비 중",
    },
    {
      차량번호: "",
      모델: "",
      연식: "",
      지파: "",
      부서: "",
      담당자: "",
      상태: "",
      연료타입: "",
      주행거리: "",
      최근점검일: "",
      등록일: "",
      비고: "",
    },
  ]

  return { headers, sampleData }
}

// 성도 차량 템플릿 데이터
const getMemberVehicleTemplate = () => {
  const headers = [
    "이름",
    "전화번호",
    "차량번호",
    "차량모델",
    "차량유형",
    "지파",
    "교회",
    "부서",
    "상태",
    "등록일",
    "승인일",
    "비고",
  ]

  const sampleData = [
    {
      이름: "김성도",
      전화번호: "010-1234-5678",
      차량번호: "12가3456",
      차량모델: "소나타",
      차량유형: "승용차",
      지파: "요한",
      교회: "본교회",
      부서: "청년부",
      상태: "완료",
      등록일: "2024-01-15",
      승인일: "2024-01-16",
      비고: "승인 완료되었습니다.",
    },
    {
      이름: "이신자",
      전화번호: "010-2345-6789",
      차량번호: "34나5678",
      차량모델: "아반떼",
      차량유형: "승용차",
      지파: "베드로",
      교회: "본교회",
      부서: "장년부",
      상태: "대기",
      등록일: "2024-01-20",
      승인일: "",
      비고: "관리자 검토 중입니다.",
    },
    {
      이름: "",
      전화번호: "",
      차량번호: "",
      차량모델: "",
      차량유형: "",
      지파: "",
      교회: "",
      부서: "",
      상태: "",
      등록일: "",
      승인일: "",
      비고: "",
    },
  ]

  return { headers, sampleData }
}

// 템플릿 데이터 생성
export async function generateTemplate(vehicleType: "church" | "member") {
  try {
    let templateData, worksheetName

    if (vehicleType === "church") {
      templateData = getChurchVehicleTemplate()
      worksheetName = "교회차량템플릿"
    } else {
      templateData = getMemberVehicleTemplate()
      worksheetName = "성도차량템플릿"
    }

    // 워크시트 생성
    const worksheet = utils.json_to_sheet(templateData.sampleData)

    // 컬럼 너비 설정
    const colWidths = templateData.headers.map((header) => ({ wch: Math.max(header.length + 2, 12) }))
    worksheet["!cols"] = colWidths

    // 워크북 생성
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, worksheetName)

    // 설명 시트 추가
    const instructionData = [
      { 항목: "사용법", 내용: "이 템플릿을 사용하여 차량 데이터를 입력하세요." },
      { 항목: "필수 항목", 내용: vehicleType === "church" ? "차량번호, 모델, 연식" : "이름, 전화번호, 차량번호" },
      { 항목: "상태 옵션", 내용: vehicleType === "church" ? "운행중, 정비중, 대기중, 폐차" : "완료, 대기, 거부" },
      { 항목: "연료타입 옵션", 내용: "가솔린, 디젤, 하이브리드, 전기" },
      { 항목: "차량유형 옵션", 내용: "승용차, 승합차, 화물차, 특수차" },
      {
        항목: "지파 옵션",
        내용: "요한, 베드로, 부산야고보, 안드레, 다대오, 빌립, 시몬, 바돌로매, 마태, 맛디아, 서울야고보, 도마",
      },
      { 항목: "주의사항", 내용: "빈 행은 삭제하고 업로드하세요. 예시 데이터는 참고용입니다." },
    ]

    const instructionSheet = utils.json_to_sheet(instructionData)
    instructionSheet["!cols"] = [{ wch: 15 }, { wch: 50 }]
    utils.book_append_sheet(workbook, instructionSheet, "사용법")

    // 파일 생성
    const excelBuffer = write(workbook, { type: "buffer", bookType: "xlsx" })

    return {
      success: true,
      data: Array.from(excelBuffer),
      filename: `${vehicleType === "church" ? "교회차량" : "성도차량"}_템플릿_${new Date().toISOString().split("T")[0]}.xlsx`,
    }
  } catch (error) {
    console.error("템플릿 생성 오류:", error)
    return {
      success: false,
      error: "템플릿 생성 중 오류가 발생했습니다.",
    }
  }
}
