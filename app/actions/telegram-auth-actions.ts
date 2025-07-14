"use server"

import { createAndSendAuthCode, verifyAuthCode } from "@/lib/telegram-auth"

// 인증 코드 전송 액션
export async function sendVerificationCode(
  telegramId: string,
  purpose: "verification" | "login" | "password-reset" = "verification",
  userId?: number,
): Promise<{ success: boolean; message: string }> {
  // 텔레그램 ID 유효성 검사
  if (!telegramId) {
    return {
      success: false,
      message: "텔레그램 ID를 입력해주세요.",
    }
  }

  // 텔레그램 ID 형식 검사
  const cleanId = telegramId.startsWith("@") ? telegramId.substring(1) : telegramId
  const telegramRegex = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/

  if (!telegramRegex.test(cleanId)) {
    return {
      success: false,
      message: "올바른 텔레그램 ID 형식이 아닙니다.",
    }
  }

  // 인증 코드 생성 및 전송
  return await createAndSendAuthCode(telegramId, purpose, userId)
}

// 인증 코드 확인 액션
export async function verifyTelegramCode(
  code: string,
  telegramId: string,
): Promise<{ success: boolean; message: string; verified?: boolean }> {
  // 코드 유효성 검사
  if (!code || code.length !== 6 || !/^\d+$/.test(code)) {
    return {
      success: false,
      message: "올바른 인증 코드 형식이 아닙니다.",
    }
  }

  // 텔레그램 ID 유효성 검사
  if (!telegramId) {
    return {
      success: false,
      message: "텔레그램 ID를 입력해주세요.",
    }
  }

  // 인증 코드 검증
  const result = verifyAuthCode(code, telegramId)

  // 실제 구현에서는 여기서 사용자 정보 업데이트 (인증 상태 등)
  if (result.success) {
    // 사용자 인증 상태 업데이트 로직
    // 예: updateUserVerificationStatus(telegramId, true)

    return {
      success: true,
      message: "인증이 성공적으로 완료되었습니다.",
      verified: true,
    }
  }

  return {
    success: false,
    message: result.message,
    verified: false,
  }
}

// 사용자 인증 상태 확인 액션
export async function checkUserVerification(
  userId: number,
): Promise<{ success: boolean; verified: boolean; telegramId?: string }> {
  try {
    // 실제 구현에서는 데이터베이스에서 사용자 인증 상태 조회
    // 여기서는 더미 데이터 반환

    // 예시: 홀수 ID는 인증됨, 짝수 ID는 인증되지 않음
    const verified = userId % 2 === 1
    const telegramId = verified ? `@user${userId}` : undefined

    return {
      success: true,
      verified,
      telegramId,
    }
  } catch (error) {
    console.error("사용자 인증 상태 확인 오류:", error)
    return {
      success: false,
      verified: false,
    }
  }
}
