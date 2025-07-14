"use client"

import { useState } from "react"
import { Bell, X, Check, CheckCheck, Trash2, Settings } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NotificationSettings from "./notification-settings"

export default function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread" | "vehicle" | "user" | "system" | "approval">("all")

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
        </button>

        {/* 알림 드롭다운 */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">알림</CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSettings(true)}
                      className="p-1 text-gray-500 hover:text-gray-700 rounded"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1 text-gray-500 hover:text-gray-700 rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 필터 탭 */}
                <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">전체</TabsTrigger>
                    <TabsTrigger value="unread">읽지 않음</TabsTrigger>
                    <TabsTrigger value="vehicle">차량</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* 액션 버튼 */}
                {notifications.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={markAllAsRead} className="flex items-center gap-1">
                      <CheckCheck className="w-3 h-3" />
                      모두 읽음
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      모두 삭제
                    </Button>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>알림이 없습니다</p>
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
                                  className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-600"}`}
                                >
                                  {notification.title}
                                </h4>
                                {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
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
                            <div className="flex gap-1 ml-2">
                              {!notification.read && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}
                                  className="p-1 text-gray-400 hover:text-green-600 rounded"
                                  title="읽음 처리"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeNotification(notification.id)
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 rounded"
                                title="삭제"
                              >
                                <X className="w-3 h-3" />
                              </button>
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

      {/* 알림 설정 모달 */}
      <NotificationSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
