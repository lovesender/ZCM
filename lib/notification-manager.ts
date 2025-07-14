export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
  actionUrl?: string
  userId?: string
  category: "vehicle" | "user" | "system" | "approval" | "general"
  priority: "low" | "medium" | "high" | "urgent"
  metadata?: Record<string, any>
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  inApp: boolean
  categories: {
    vehicle: boolean
    user: boolean
    system: boolean
    approval: boolean
    general: boolean
  }
}

class NotificationManager {
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []
  private settings: NotificationSettings = {
    email: true,
    push: true,
    inApp: true,
    categories: {
      vehicle: true,
      user: true,
      system: true,
      approval: true,
      general: true,
    },
  }

  constructor() {
    this.loadNotifications()
    this.loadSettings()
    this.requestPermission()
  }

  // 알림 권한 요청
  async requestPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  }

  // 알림 추가
  addNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    }

    this.notifications.unshift(newNotification)
    this.saveNotifications()
    this.notifyListeners()

    // 카테고리별 설정 확인
    if (this.settings.categories[notification.category]) {
      // 인앱 알림
      if (this.settings.inApp) {
        this.showToast(newNotification)
      }

      // 푸시 알림
      if (this.settings.push && this.canShowPushNotification()) {
        this.showPushNotification(newNotification)
      }
    }

    return newNotification
  }

  // 토스트 알림 표시
  private showToast(notification: Notification) {
    const event = new CustomEvent("show-toast", {
      detail: notification,
    })
    window.dispatchEvent(event)
  }

  // 푸시 알림 표시
  private showPushNotification(notification: Notification) {
    if ("Notification" in window && Notification.permission === "granted") {
      const pushNotification = new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: notification.id,
        requireInteraction: notification.priority === "urgent",
        data: {
          url: notification.actionUrl,
          notificationId: notification.id,
        },
      })

      pushNotification.onclick = () => {
        if (notification.actionUrl) {
          window.open(notification.actionUrl, "_blank")
        }
        pushNotification.close()
      }

      // 자동 닫기 (긴급하지 않은 경우)
      if (notification.priority !== "urgent") {
        setTimeout(() => {
          pushNotification.close()
        }, 5000)
      }
    }
  }

  // 푸시 알림 가능 여부 확인
  private canShowPushNotification(): boolean {
    return "Notification" in window && Notification.permission === "granted" && document.hidden
  }

  // 알림 읽음 처리
  markAsRead(notificationId: string) {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
      this.saveNotifications()
      this.notifyListeners()
    }
  }

  // 모든 알림 읽음 처리
  markAllAsRead() {
    this.notifications.forEach((n) => (n.read = true))
    this.saveNotifications()
    this.notifyListeners()
  }

  // 알림 삭제
  removeNotification(notificationId: string) {
    this.notifications = this.notifications.filter((n) => n.id !== notificationId)
    this.saveNotifications()
    this.notifyListeners()
  }

  // 모든 알림 삭제
  clearAll() {
    this.notifications = []
    this.saveNotifications()
    this.notifyListeners()
  }

  // 알림 목록 가져오기
  getNotifications(filter?: {
    category?: string
    read?: boolean
    limit?: number
  }): Notification[] {
    let filtered = [...this.notifications]

    if (filter?.category) {
      filtered = filtered.filter((n) => n.category === filter.category)
    }

    if (filter?.read !== undefined) {
      filtered = filtered.filter((n) => n.read === filter.read)
    }

    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit)
    }

    return filtered
  }

  // 읽지 않은 알림 수
  getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length
  }

  // 리스너 등록
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  // 설정 업데이트
  updateSettings(settings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...settings }
    this.saveSettings()
  }

  // 설정 가져오기
  getSettings(): NotificationSettings {
    return { ...this.settings }
  }

  // 미리 정의된 알림 생성 메서드들
  notifyVehicleRegistered(vehicleNumber: string, userName: string) {
    return this.addNotification({
      title: "새 차량 등록",
      message: `${userName}님이 차량 ${vehicleNumber}을(를) 등록했습니다.`,
      type: "info",
      category: "vehicle",
      priority: "medium",
      actionUrl: "/admin/vehicles",
      metadata: { vehicleNumber, userName },
    })
  }

  notifyVehicleApproved(vehicleNumber: string) {
    return this.addNotification({
      title: "차량 승인 완료",
      message: `차량 ${vehicleNumber}이(가) 승인되었습니다.`,
      type: "success",
      category: "approval",
      priority: "medium",
      actionUrl: "/my-vehicles",
      metadata: { vehicleNumber },
    })
  }

  notifyVehicleRejected(vehicleNumber: string, reason: string) {
    return this.addNotification({
      title: "차량 승인 반려",
      message: `차량 ${vehicleNumber}이(가) 반려되었습니다. 사유: ${reason}`,
      type: "error",
      category: "approval",
      priority: "high",
      actionUrl: "/my-vehicles",
      metadata: { vehicleNumber, reason },
    })
  }

  notifySystemMaintenance(startTime: string, duration: string) {
    return this.addNotification({
      title: "시스템 점검 안내",
      message: `${startTime}부터 ${duration} 동안 시스템 점검이 예정되어 있습니다.`,
      type: "warning",
      category: "system",
      priority: "high",
      metadata: { startTime, duration },
    })
  }

  notifyUserRegistered(userName: string, userEmail: string) {
    return this.addNotification({
      title: "새 사용자 가입",
      message: `${userName}(${userEmail})님이 가입했습니다.`,
      type: "info",
      category: "user",
      priority: "low",
      actionUrl: "/admin/users",
      metadata: { userName, userEmail },
    })
  }

  // 프라이빗 메서드들
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.notifications))
  }

  private saveNotifications() {
    try {
      localStorage.setItem("zcm_notifications", JSON.stringify(this.notifications))
    } catch (error) {
      console.error("Failed to save notifications:", error)
    }
  }

  private loadNotifications() {
    try {
      const saved = localStorage.getItem("zcm_notifications")
      if (saved) {
        this.notifications = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }))
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
      this.notifications = []
    }
  }

  private saveSettings() {
    try {
      localStorage.setItem("zcm_notification_settings", JSON.stringify(this.settings))
    } catch (error) {
      console.error("Failed to save notification settings:", error)
    }
  }

  private loadSettings() {
    try {
      const saved = localStorage.getItem("zcm_notification_settings")
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.error("Failed to load notification settings:", error)
    }
  }
}

export const notificationManager = new NotificationManager()
