/**
 * 텔레그램 메시지 전송을 위한 유틸리티 함수
 */

// 텔레그램 봇 토큰 (실제 구현 시 환경 변수로 관리)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN"

// 텔레그램 메시지 전송 함수
export async function sendTelegramMessage(telegramId: string, message: string): Promise<boolean> {
  try {
    // 텔레그램 ID가 없으면 전송하지 않음
    if (!telegramId || telegramId.trim() === "") {
      console.log("텔레그램 ID가 없어 메시지를 전송하지 않습니다.")
      return false
    }

    // @ 기호 제거 (있는 경우)
    const cleanId = telegramId.startsWith("@") ? telegramId.substring(1) : telegramId

    // 텔레그램 API 엔드포인트
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    // API 요청 데이터
    const data = {
      chat_id: `@${cleanId}`, // 사용자명 앞에 @ 추가
      text: message,
      parse_mode: "HTML", // HTML 형식 지원 (굵게, 기울임, 링크 등)
    }

    // API 호출
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!result.ok) {
      console.error("텔레그램 메시지 전송 실패:", result.description)
      return false
    }

    console.log("텔레그램 메시지 전송 성공:", cleanId)
    return true
  } catch (error) {
    console.error("텔레그램 메시지 전송 중 오류 발생:", error)
    return false
  }
}

// 차량 등록 알림 메시지 생성
export function createRegistrationMessage(data: any): string {
  return `
<b>🚗 차량 등록 완료</b>

안녕하세요, ${data.name}님!
차량 등록이 성공적으로 접수되었습니다.

<b>📋 등록 정보</b>
• 차량번호: ${data.carNumber}
• 차종: ${data.carModel}
• 등록일: ${new Date().toLocaleDateString("ko-KR")}

관리자 승인 후 최종 등록이 완료됩니다.
승인 결과는 텔레그램으로 다시 알려드리겠습니다.

문의사항은 관리자에게 연락해주세요.
`
}

// 차량 승인 알림 메시지 생성
export function createApprovalMessage(data: any): string {
  return `
<b>✅ 차량 등록 승인 완료</b>

안녕하세요, ${data.name}님!
등록하신 차량이 <b>승인</b>되었습니다.

<b>📋 승인 정보</b>
• 차량번호: ${data.carNumber}
• 차종: ${data.carModel}
• 승인일: ${new Date().toLocaleDateString("ko-KR")}

이제 등록된 차량으로 주차장을 이용하실 수 있습니다.
감사합니다.

문의사항은 관리자에게 연락해주세요.
`
}

// 차량 반려 알림 메시지 생성
export function createRejectionMessage(data: any, reason: string): string {
  return `
<b>❌ 차량 등록 반려</b>

안녕하세요, ${data.name}님!
등록하신 차량이 <b>반려</b>되었습니다.

<b>📋 반려 정보</b>
• 차량번호: ${data.carNumber}
• 차종: ${data.carModel}
• 반려일: ${new Date().toLocaleDateString("ko-KR")}
• 반려 사유: ${reason || "정보 불충분"}

수정 후 다시 등록해주시기 바랍니다.
문의사항은 관리자에게 연락해주세요.
`
}
