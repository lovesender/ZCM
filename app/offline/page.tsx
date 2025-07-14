"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WifiOff, RefreshCw, FileText, Clock } from "lucide-react"
import { getOfflineRegistrations } from "@/lib/offline-storage"
import type { VehicleRegistration } from "@/lib/offline-storage"

export default function OfflinePage() {
  const router = useRouter()
  const [offlineData, setOfflineData] = useState<VehicleRegistration[]>([])
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // 오프라인 데이터 로드
    setOfflineData(getOfflineRegistrations())
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // 온라인 상태가 되면 홈으로 리다이렉트
      router.push("/")
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 오프라인 상태 헤더 */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <WifiOff className="h-6 w-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-orange-800">오프라인 모드</h1>
            </div>
            <p className="text-orange-700 mb-4">
              현재 인터넷에 연결되어 있지 않습니다. 오프라인에서 작성한 내용은 온라인 연결 시 자동으로 동기화됩니다.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                {offlineData.length}개 대기 중
              </Badge>
              {isOnline && <Badge className="bg-green-100 text-green-800">온라인 연결됨</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* 사용 가능한 기능 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              오프라인에서 사용 가능한 기능
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Button variant="outline" className="h-auto p-4 justify-start" onClick={() => router.push("/register")}>
                <div className="text-left">
                  <div className="font-medium">차량 등록</div>
                  <div className="text-sm text-gray-500">새 차량 정보 등록</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => router.push("/my-vehicles")}
              >
                <div className="text-left">
                  <div className="font-medium">내 차량 보기</div>
                  <div className="text-sm text-gray-500">등록한 차량 목록 확인</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 동기화 대기 중인 데이터 */}
        {offlineData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                동기화 대기 중인 등록 ({offlineData.length}개)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {offlineData.map((registration) => (
                  <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{registration.ownerName}</div>
                      <div className="text-sm text-gray-500">
                        {registration.vehicleNumber} • {registration.model}
                      </div>
                      <div className="text-xs text-gray-400">{formatDate(registration.createdAt)}</div>
                    </div>
                    <Badge variant="outline">대기 중</Badge>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">💡 인터넷에 연결되면 자동으로 서버에 동기화됩니다.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {offlineData.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-gray-500 mb-4">동기화 대기 중인 데이터가 없습니다.</div>
              <Button onClick={() => router.push("/register")}>새 차량 등록하기</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
