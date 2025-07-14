import { type NextRequest, NextResponse } from "next/server"
import { handleCommand } from "@/lib/telegram-bot-commands"
import { sendTelegramMessage } from "@/lib/telegram"

// 텔레그램 웹훅 시크릿 (실제 구현에서는 환경 변수로 관리)
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "your_webhook_secret"

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json()

    // 웹훅 시크릿 검증
    const secretHeader = request.headers.get("x-telegram-bot-api-secret-token")
    if (secretHeader !== WEBHOOK_SECRET) {
      console.warn("유효하지 않은 웹훅 시크릿")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    // 메시지 확인
    if (!body.message) {
      return NextResponse.json({ success: true })
    }

    const { message } = body
    const chatId = message.chat.id
    const text = message.text || ""
    const username = message.from.username

    // 명령어 처리
    if (text.startsWith("/")) {
      // 명령어와 인자 분리
      const parts = text.split(" ")
      const command = parts[0]
      const args = parts.slice(1)

      // 명령어 처리
      const response = await handleCommand(command, `@${username}`, args)

      // 응답 전송
      await sendTelegramMessage(`@${username}`, response.text)
    } else {
      // 일반 메시지 처리
      await sendTelegramMessage(
        `@${username}`,
        `
안녕하세요! 차량 관리 시스템 봇입니다.
명령어를 사용하여 정보를 조회하거나 설정을 변경할 수 있습니다.

사용 가능한 명령어를 보려면 /help를 입력하세요.
`,
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("텔레그램 웹훅 처리 오류:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}

// 웹훅 설정 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const setupWebhook = searchParams.get("setup") === "true"
    const removeWebhook = searchParams.get("remove") === "true"

    // 관리자 인증 키 확인 (실제 구현에서는 더 안전한 인증 방식 사용)
    const authKey = searchParams.get("auth")
    if (authKey !== process.env.ADMIN_AUTH_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json({ success: false, error: "Telegram bot token is not configured" }, { status: 500 })
    }

    if (setupWebhook) {
      // 웹훅 URL (실제 구현에서는 환경 변수로 관리)
      const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL || searchParams.get("url")

      if (!webhookUrl) {
        return NextResponse.json({ success: false, error: "Webhook URL is not provided" }, { status: 400 })
      }

      // 웹훅 설정
      const setWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`
      const setWebhookResponse = await fetch(setWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          secret_token: WEBHOOK_SECRET,
        }),
      })

      const setWebhookResult = await setWebhookResponse.json()

      if (!setWebhookResult.ok) {
        return NextResponse.json({ success: false, error: setWebhookResult.description }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Webhook setup successful",
        result: setWebhookResult,
      })
    } else if (removeWebhook) {
      // 웹훅 제거
      const deleteWebhookUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`
      const deleteWebhookResponse = await fetch(deleteWebhookUrl)
      const deleteWebhookResult = await deleteWebhookResponse.json()

      if (!deleteWebhookResult.ok) {
        return NextResponse.json({ success: false, error: deleteWebhookResult.description }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: "Webhook removed successfully",
        result: deleteWebhookResult,
      })
    } else {
      // 웹훅 정보 조회
      const getWebhookInfoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
      const getWebhookInfoResponse = await fetch(getWebhookInfoUrl)
      const getWebhookInfoResult = await getWebhookInfoResponse.json()

      return NextResponse.json({
        success: true,
        webhookInfo: getWebhookInfoResult.result,
      })
    }
  } catch (error) {
    console.error("웹훅 설정 오류:", error)
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 })
  }
}
