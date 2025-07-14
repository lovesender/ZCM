import { type NextRequest, NextResponse } from "next/server"
import { sendTelegramMessage } from "@/lib/telegram"

export async function POST(request: NextRequest) {
  try {
    const { telegramId, message } = await request.json()

    if (!telegramId || !message) {
      return NextResponse.json({ success: false, message: "텔레그램 ID와 메시지는 필수 항목입니다." }, { status: 400 })
    }

    const result = await sendTelegramMessage(telegramId, message)

    if (!result) {
      return NextResponse.json({ success: false, message: "메시지 전송에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "메시지가 성공적으로 전송되었습니다." })
  } catch (error) {
    console.error("텔레그램 메시지 전송 오류:", error)
    return NextResponse.json({ success: false, message: "메시지 전송 중 오류가 발생했습니다." }, { status: 500 })
  }
}
