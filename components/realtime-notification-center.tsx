"use client"

import { useState, useEffect } from "react"
import { Bell, Users, Wifi } from "lucide-react"
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ConnectionStatusIndicator from "./connection-status-indicator"

export default function RealtimeNotificationCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    connectionStatus,
    onlineUsers,
    sendSystemNotification,
    isConnected,
  } = useRealtimeNotifications()

  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread" | "vehicle" | "user" | "system">("all")
  const [realtimeStats, setRealtimeStats] = useState({
    totalReceived: 0,
    lastReceived: null as Date | null,
  })

  // 실시간 통계 업데이트
  useEffect(() => {
    const handleRealtimeNotification = () => {
      setRealtimeStats((prev) => ({
        totalReceived: prev.totalReceived + 1,
        lastReceived: new Date(),
      }))
    }

    window.addEventListener("realtime-notification-received", handleRealtimeNotification)
    return () => {
      window.removeEventListener("realtime-notification-received", handleRealtimeNotification)
    }
  }, [])

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    return notification.category === filter
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      default:
        return "ℹ️"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50"
      case "high":
        return "border-l-orange-500 bg-orange-50"
      case "medium":
        return "border-l-blue-500 bg-blue-50"
      default:
        return "border-l-gray-500 bg-gray-50"
    }
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.actionUrl) {
      window.open(notification.actionUrl, "_blank")
    }
  }

  // 테스트용 시스템 알림 전송
  const sendTestNotification = () => {
    sendSystemNotification({
      title: "실시간 테스트 알림",
      message: `${new Date().toLocaleTimeString()}에 전송된 테스트 알림입니다.`,
      type: "info",
      category: "system",
      priority: "medium",
    })
  }

  return (
    <>
      {/* 알림 버튼 */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          {/* 실시간 연결 표시 */}
          {isConnected && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </button>

        {/* 알림 드롭다운 */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    실시간 알림
                  </CardTitle>
                  <ConnectionStatusIndicator />
                </div>

                {/* 실시간 통계 */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Wifi className="w-4 h-4" />
                    <span>수신: {realtimeStats.totalReceived}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>온라인: {onlineUsers.length}</span>
                  </div>
                  {realtimeStats.lastReceived && (
                    <div className="text-xs">
                      마지막: {formatDistanceToNow(realtimeStats.lastReceived, { addSuffix: true, locale: ko })}
                    </div>
                  )}
                </div>

                {/* 탭 필터 */}
                <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">전체</TabsTrigger>
                    <TabsTrigger value="unread">읽지않음</TabsTrigger>
                    <TabsTrigger value="vehicle">차량</TabsTrigger>
                    <TabsTrigger value="system">시스템</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* 액션 버튼 */}
                <div className="flex gap-2 mt-3">
                  {notifications.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        모두 읽음
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearAll} className="text-red-600">
                        모두 삭제
                      </Button>
                    </>
                  )}
                  {process.env.NODE_ENV === "development" && (
                    <Button variant="outline" size="sm" onClick={sendTestNotification}>
                      테스트 전송
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>알림이 없습니다</p>
                      {!isConnected && <p className="text-sm text-red-500 mt-2">실시간 연결이 끊어져 있습니다</p>}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            !notification.read ? getPriorityColor(notification.priority) : "border-l-gray-200"
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                                <h4
                                  className={`text-sm font-medium ${
                                    !notification.read ? "text-gray-900" : "text-gray-600"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                                {/* 실시간 표시 */}
                                {(notification as any)._fromWebSocket && (
                                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                    실시간
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ko })}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}
