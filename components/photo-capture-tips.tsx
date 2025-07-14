import { Info, Camera, Target, Sun } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PhotoCaptureTipsProps {
  isVisible: boolean
}

export default function PhotoCaptureTips({ isVisible }: PhotoCaptureTipsProps) {
  if (!isVisible) return null

  return (
    <Alert className="mt-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-2">
          <div className="font-medium text-sm">📸 최고의 인식률을 위한 촬영 팁</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <Target className="w-3 h-3 text-blue-500" />
              <span>번호판을 화면 중앙에 크게 배치</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="w-3 h-3 text-yellow-500" />
              <span>충분한 조명 확보 (그림자 없이)</span>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="w-3 h-3 text-green-500" />
              <span>번호판과 수직으로 촬영</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span>흔들림 없이 선명하게</span>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
