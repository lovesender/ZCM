import { sendTelegramMessage } from "./telegram"

// 인증 코드 생성 함수
export function generateAuthCode(length = 6): string {
  const characters = "0123456789"
  let code = ""
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return code
}

// 인증 코드 저장을 위한 메모리 저장소 (실제 구현에서는 데이터베이스 사용)
interface AuthCodeRecord {
  code: string
  telegramId: string
  expiresAt: number
  userId?: number
  purpose: "verification" | "login" | "password-reset"
}

// 인증 코드 저장소 (실제 구현에서는 데이터베이스 사용)
const authCodes = new Map<string, AuthCodeRecord>()

// 인증 코드 생성 및 저장
export async function createAndSendAuthCode(
  telegramId: string,
  purpose: AuthCodeRecord["purpose"] = "verification",
  userId?: number,
): Promise<{ success: boolean; message: string }> {
  try {
    // 텔레그램 ID 형식 확인
    const cleanId = telegramId.startsWith("@") ? telegramId.substring(1) : telegramId

    // 인증 코드 생성
    const code = generateAuthCode()

    // 인증 코드 저장 (5분 유효)
    const expiresAt = Date.now() + 5 * 60 * 1000
    authCodes.set(code, {
      code,
      telegramId,
      expiresAt,
      userId,
      purpose,
    })

    // 목적에 따른 메시지 생성
    let message = ""
    switch (purpose) {
      case "verification":
        message = `
<b>🔐 차량 관리 시스템 인증 코드</b>

안녕하세요! 차량 관리 시스템 계정 인증을 위한 코드입니다:

<code>${code}</code>

이 코드는 5분 동안 유효합니다.
본인이 요청하지 않았다면 이 메시지를 무시하세요.
`
        break
      case "login":
        message = `
<b>🔑 차량 관리 시스템 로그인 코드</b>

안녕하세요! 로그인을 위한 인증 코드입니다:

<code>${code}</code>

이 코드는 5분 동안 유효합니다.
본인이 요청하지 않았다면 관리자에게 문의하세요.
`
        break
      case "password-reset":
        message = `
<b>🔄 차량 관리 시스템 비밀번호 재설정</b>

안녕하세요! 비밀번호 재설정을 위한 인증 코드입니다:

<code>${code}</code>

이 코드는 5분 동안 유효합니다.
본인이 요청하지 않았다면 즉시 관리자에게 문의하세요.
`
        break
    }

    // 텔레그램으로 인증 코드 전송
    const sent = await sendTelegramMessage(telegramId, message)

    if (!sent) {
      return {
        success: false,
        message: "텔레그램 메시지 전송에 실패했습니다. 텔레그램 ID를 확인해주세요.",
      }
    }

    return {
      success: true,
      message: "인증 코드가 텔레그램으로 전송되었습니다.",
    }
  } catch (error) {
    console.error("인증 코드 전송 오류:", error)
    return {
      success: false,
      message: "인증 코드 전송 중 오류가 발생했습니다.",
    }
  }
}

// 인증 코드 검증
export function verifyAuthCode(
  code: string,
  telegramId: string,
): { success: boolean; message: string; record?: AuthCodeRecord } {
  // 코드 존재 여부 확인
  if (!authCodes.has(code)) {
    return {
      success: false,
      message: "유효하지 않은 인증 코드입니다.",
    }
  }

  const record = authCodes.get(code)!

  // 텔레그램 ID 일치 여부 확인
  const cleanInputId = telegramId.startsWith("@") ? telegramId.substring(1) : telegramId
  const cleanStoredId = record.telegramId.startsWith("@") ? record.telegramId.substring(1) : record.telegramId

  if (cleanInputId !== cleanStoredId) {
    return {
      success: false,
      message: "텔레그램 ID가 일치하지 않습니다.",
    }
  }

  // 만료 여부 확인
  if (Date.now() > record.expiresAt) {
    // 만료된 코드 삭제
    authCodes.delete(code)
    return {
      success: false,
      message: "인증 코드가 만료되었습니다. 새 코드를 요청해주세요.",
    }
  }

  // 인증 성공 시 코드 삭제 (일회용)
  authCodes.delete(code)

  return {
    success: true,
    message: "인증이 성공적으로 완료되었습니다.",
    record,
  }
}

// 사용자 ID로 인증 코드 조회 (관리자용)
export function getAuthCodesByUserId(userId: number): AuthCodeRecord[] {
  const userCodes: AuthCodeRecord[] = []

  authCodes.forEach((record) => {
    if (record.userId === userId) {
      userCodes.push(record)
    }
  })

  return userCodes
}

// 만료된 인증 코드 정리 (주기적으로 실행)
export function cleanupExpiredCodes(): void {
  const now = Date.now()

  authCodes.forEach((record, code) => {
    if (now > record.expiresAt) {
      authCodes.delete(code)
    }
  })
}

// 주기적으로 만료된 코드 정리 (서버 환경에서만 실행)
if (typeof window === "undefined") {
  setInterval(cleanupExpiredCodes, 60 * 1000) // 1분마다 실행
}
