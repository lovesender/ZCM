import { notificationManager, type Notification } from "./notification-manager"
import { wsClient } from "./websocket-client"

class RealtimeNotificationManager {
  private initialized = false

  constructor() {
    this.initialize()
  }

  private initialize() {
    if (this.initialized || typeof window === "undefined") return

    // WebSocket 메시지 리스너 등록
    wsClient.on("notification", this.handleIncomingNotification.bind(this))
    wsClient.on("notification_read", this.handleNotificationRead.bind(this))
    wsClient.on("notification_deleted", this.handleNotificationDeleted.bind(this))
    wsClient.on("user_status", this.handleUserStatus.bind(this))
    wsClient.on("system_status", this.handleSystemStatus.bind(this))

    // 로컬 알림 변경사항을 다른 클라이언트에 동기화
    notificationManager.subscribe(this.syncNotificationChanges.bind(this))

    // 사용자 ID 설정 (실제로는 인증 시스템에서 가져옴)
    const userId = this.getCurrentUserId()
    if (userId) {
      wsClient.setUserId(userId)
    }

    // WebSocket 연결
    wsClient.connect(userId)

    this.initialized = true
  }

  // 들어오는 알림 처리
  private handleIncomingNotification(data: any) {
    console.log("Received notification via WebSocket:", data)

    // 로컬 알림 매니저에 추가 (동기화 방지를 위해 플래그 설정)
    const notification = notificationManager.addNotification({
      ...data,
      _fromWebSocket: true, // 동기화 방지 플래그
    })

    // 실시간 알림 이벤트 발생
    this.dispatchRealtimeEvent("notification-received", notification)
  }

  // 알림 읽음 처리
  private handleNotificationRead(data: { notificationId: string; userId: string }) {
    console.log("Notification marked as read via WebSocket:", data)

    // 현재 사용자의 알림인 경우에만 처리
    if (data.userId === this.getCurrentUserId()) {
      notificationManager.markAsRead(data.notificationId)
    }
  }

  // 알림 삭제 처리
  private handleNotificationDeleted(data: { notificationId: string; userId: string }) {
    console.log("Notification deleted via WebSocket:", data)

    if (data.userId === this.getCurrentUserId()) {
      notificationManager.removeNotification(data.notificationId)
    }
  }

  // 사용자 상태 처리
  private handleUserStatus(data: { userId: string; status: string; timestamp: number }) {
    console.log("User status update:", data)
    this.dispatchRealtimeEvent("user-status-changed", data)
  }

  // 시스템 상태 처리
  private handleSystemStatus(data: { status: string; message: string; timestamp: number }) {
    console.log("System status update:", data)

    // 시스템 알림 생성
    if (data.status === "maintenance") {
      notificationManager.addNotification({
        title: "시스템 점검 안내",
        message: data.message,
        type: "warning",
        category: "system",
        priority: "high",
      })
    }
  }

  // 로컬 알림 변경사항 동기화
  private syncNotificationChanges(notifications: Notification[]) {
    // WebSocket으로 받은 알림은 다시 전송하지 않음
    const localChanges = notifications.filter((n) => !(n as any)._fromWebSocket)

    if (localChanges.length > 0) {
      // 최근 변경사항만 전송 (예: 최근 1초 이내)
      const recentChanges = localChanges.filter((n) => Date.now() - n.timestamp.getTime() < 1000)

      recentChanges.forEach((notification) => {
        this.broadcastNotification(notification)
      })
    }
  }

  // 알림 브로드캐스트
  private broadcastNotification(notification: Notification) {
    wsClient.sendNotification({
      ...notification,
      timestamp: notification.timestamp.toISOString(),
    })
  }

  // 실시간 이벤트 발생
  private dispatchRealtimeEvent(type: string, data: any) {
    const event = new CustomEvent(`realtime-${type}`, { detail: data })
    window.dispatchEvent(event)
  }

  // 현재 사용자 ID 가져오기 (실제로는 인증 시스템에서)
  private getCurrentUserId(): string | null {
    // 임시로 localStorage에서 가져오기
    return localStorage.getItem("currentUserId") || "user-" + Math.random().toString(36).substr(2, 9)
  }

  // 공개 메서드들
  public sendNotificationToUser(userId: string, notification: Omit<Notification, "id" | "timestamp" | "read">) {
    wsClient.send("send_notification", {
      targetUserId: userId,
      notification,
    })
  }

  public sendSystemNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
    wsClient.send("system_notification", {
      notification,
    })
  }

  public markAsReadRemotely(notificationId: string) {
    wsClient.markNotificationAsRead(notificationId)
  }

  public deleteRemotely(notificationId: string) {
    wsClient.deleteNotification(notificationId)
  }

  public updateUserStatus(status: "online" | "away" | "offline") {
    wsClient.updateUserStatus(status)
  }

  public getConnectionStatus() {
    return wsClient.isConnected()
  }

  // 연결 상태 모니터링
  public onConnectionStatusChange(callback: (connected: boolean) => void) {
    return wsClient.onStatusChange((status) => {
      callback(status.connected)
    })
  }
}

export const realtimeNotificationManager = new RealtimeNotificationManager()
