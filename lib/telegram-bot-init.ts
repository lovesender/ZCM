import { setBotCommands } from "./telegram-bot-commands"

// 봇 초기화 함수
export async function initTelegramBot() {
  try {
    // 봇 명령어 설정
    await setBotCommands()

    console.log("텔레그램 봇 초기화 완료")
    return true
  } catch (error) {
    console.error("텔레그램 봇 초기화 오류:", error)
    return false
  }
}

// 서버 환경에서만 실행
if (typeof window === "undefined") {
  // 서버 시작 시 봇 초기화
  initTelegramBot().catch(console.error)
}
