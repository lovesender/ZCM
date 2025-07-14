"use client"

import { useState, useEffect } from "react"
import { useNotifications } from "./use-notifications"
import { realtimeNotificationManager } from "@/lib/realtime-notification-manager"
import { wsClient } from "@/lib/websocket-client"
import type { ConnectionStatus } from "@/lib/websocket-client"

export function useRealtimeNotifications() {
  const notifications = useNotifications()
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    reconnectAttempts: 0,
  })
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])

  useEffect(() => {
    // 연결 상태 모니터링
    const unsubscribeStatus = wsClient.onStatusChange(setConnectionStatus)

    // 실시간 이벤트 리스너
    const handleNotificationReceived = (event: CustomEvent) => {
      console.log("Real-time notification received:", event.detail)
      // 추가적인 UI 업데이트나 사운드 재생 등
      playNotificationSound()
    }

    const handleUserStatusChanged = (event: CustomEvent) => {
      const { userId, status } = event.detail
      setOnlineUsers((prev) => {
        if (status === "online") {
          return prev.includes(userId) ? prev : [...prev, userId]
        } else {
          return prev.filter((id) => id !== userId)
        }
      })
    }

    // 이벤트 리스너 등록
    window.addEventListener("realtime-notification-received", handleNotificationReceived as EventListener)
    window.addEventListener("realtime-user-status-changed", handleUserStatusChanged as EventListener)

    // 페이지 가시성 변경 시 사용자 상태 업데이트
    const handleVisibilityChange = () => {
      const status = document.hidden ? "away" : "online"
      realtimeNotificationManager.updateUserStatus(status)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // 페이지 언로드 시 오프라인 상태로 변경
    const handleBeforeUnload = () => {
      realtimeNotificationManager.updateUserStatus("offline")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      unsubscribeStatus()
      window.removeEventListener("realtime-notification-received", handleNotificationReceived as EventListener)
      window.removeEventListener("realtime-user-status-changed", handleUserStatusChanged as EventListener)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // 알림 사운드 재생
  const playNotificationSound = () => {
    try {
      const audio = new Audio("/notification-sound.mp3")
      audio.volume = 0.3
      audio.play().catch(console.error)
    } catch (error) {
      console.error("Failed to play notification sound:", error)
    }
  }

  // 특정 사용자에게 알림 전송
  const sendNotificationToUser = (userId: string, notification: any) => {
    realtimeNotificationManager.sendNotificationToUser(userId, notification)
  }

  // 시스템 알림 전송
  const sendSystemNotification = (notification: any) => {
    realtimeNotificationManager.sendSystemNotification(notification)
  }

  // 사용자 상태 업데이트
  const updateUserStatus = (status: "online" | "away" | "offline") => {
    realtimeNotificationManager.updateUserStatus(status)
  }

  return {
    ...notifications,
    connectionStatus,
    onlineUsers,
    sendNotificationToUser,
    sendSystemNotification,
    updateUserStatus,
    isConnected: connectionStatus.connected,
  }
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false,
    reconnectAttempts: 0,
  })

  useEffect(() => {
    const unsubscribe = wsClient.onStatusChange(setStatus)
    return unsubscribe
  }, [])

  return status
}
