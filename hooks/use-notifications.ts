"use client"

import { useState, useEffect } from "react"
import { notificationManager, type Notification, type NotificationSettings } from "@/lib/notification-manager"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // 초기 데이터 로드
    setNotifications(notificationManager.getNotifications())
    setUnreadCount(notificationManager.getUnreadCount())

    // 알림 변경 구독
    const unsubscribe = notificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications)
      setUnreadCount(notificationManager.getUnreadCount())
    })

    return unsubscribe
  }, [])

  const markAsRead = (notificationId: string) => {
    notificationManager.markAsRead(notificationId)
  }

  const markAllAsRead = () => {
    notificationManager.markAllAsRead()
  }

  const removeNotification = (notificationId: string) => {
    notificationManager.removeNotification(notificationId)
  }

  const clearAll = () => {
    notificationManager.clearAll()
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  }
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(notificationManager.getSettings())

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    notificationManager.updateSettings(newSettings)
    setSettings(notificationManager.getSettings())
  }

  return {
    settings,
    updateSettings,
  }
}
