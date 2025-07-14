import { type NextRequest, NextResponse } from "next/server"
import { generateTemplate } from "@/app/actions/excel-template-actions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleType = searchParams.get("type") as "church" | "member"

    if (!vehicleType || !["church", "member"].includes(vehicleType)) {
      return NextResponse.json({ error: "유효하지 않은 차량 유형입니다." }, { status: 400 })
    }

    const result = await generateTemplate(vehicleType)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Uint8Array로 변환
    const buffer = new Uint8Array(result.data)

    // 응답 헤더 설정
    const headers = new Headers()
    headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(result.filename)}"`)
    headers.set("Content-Length", buffer.length.toString())

    return new NextResponse(buffer, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("템플릿 다운로드 오류:", error)
    return NextResponse.json({ error: "템플릿 다운로드 중 오류가 발생했습니다." }, { status: 500 })
  }
}
