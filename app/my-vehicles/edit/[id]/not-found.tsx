import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bgSecondary py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="card">
          <CardContent className="p-8 text-center">
            <div className="bg-red50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red500" />
            </div>
            <h2 className="text-xl font-semibold mb-4">차량을 찾을 수 없습니다</h2>
            <p className="text-contentSub mb-6">
              요청하신 차량 정보를 찾을 수 없습니다.
              <br />
              차량 ID를 확인하시거나 내 차량 조회 페이지에서 다시 시도해주세요.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/my-vehicles">
                <Button className="btn-primary">내 차량 조회</Button>
              </Link>
              <Link href="/">
                <Button className="btn-secondary">홈으로 가기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
