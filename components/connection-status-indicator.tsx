"use client"

import { Wifi, WifiOff, RotateCcw } from "lucide-react"
import { useConnectionStatus } from "@/hooks/use-realtime-notifications"
import { Badge } from "@/components/ui/badge"

export default function ConnectionStatusIndicator() {
  const status = useConnectionStatus()

  if (status.connected) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Wifi className="w-3 h-3 mr-1" />
        실시간 연결됨
      </Badge>
    )
  }

  if (status.reconnecting) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <RotateCcw className="w-3 h-3 mr-1 animate-spin" />
        재연결 중... ({status.reconnectAttempts})
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
      <WifiOff className="w-3 h-3 mr-1" />
      연결 끊김
    </Badge>
  )
}
