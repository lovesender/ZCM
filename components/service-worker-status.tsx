"use client"

import { useServiceWorker } from "@/hooks/use-service-worker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function ServiceWorkerStatus() {
  const { isSupported, isRegistered, isLoading, error, getCacheInfo, clearCache, unregister } = useServiceWorker()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Service Worker 상태 확인 중...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isSupported && isRegistered ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-400" />
          )}
          Service Worker 상태
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-600">브라우저 지원</div>
            <Badge variant={isSupported ? "default" : "secondary"}>{isSupported ? "지원됨" : "지원 안됨"}</Badge>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-600">등록 상태</div>
            <Badge variant={isRegistered ? "default" : "secondary"}>{isRegistered ? "등록됨" : "미등록"}</Badge>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-sm text-yellow-800">
              <strong>알림:</strong> {error}
            </div>
            <div className="text-xs text-yellow-600 mt-1">개발 환경에서는 Service Worker가 비활성화됩니다.</div>
          </div>
        )}

        {!isSupported && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm text-blue-800">현재 환경에서는 Service Worker가 지원되지 않습니다.</div>
            <div className="text-xs text-blue-600 mt-1">
              • 개발 환경 (localhost, *.lite.vusercontent.net)
              <br />• HTTPS가 아닌 환경
              <br />• 브라우저 미지원
            </div>
          </div>
        )}

        {isSupported && isRegistered && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const info = await getCacheInfo()
                console.log("캐시 정보:", info)
                alert(JSON.stringify(info, null, 2))
              }}
            >
              캐시 정보 확인
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const result = await unregister()
                if (result) {
                  alert("Service Worker 등록이 해제되었습니다.")
                }
              }}
            >
              등록 해제
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
