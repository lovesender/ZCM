export interface WebSocketMessage {
  type: "notification" | "notification_read" | "notification_deleted" | "user_status" | "system_status"
  payload: any
  timestamp: number
  userId?: string
  sessionId?: string
}

export interface ConnectionStatus {
  connected: boolean
  reconnecting: boolean
  lastConnected?: Date
  reconnectAttempts: number
}

class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectInterval = 5000
  private maxReconnectAttempts = 10
  private reconnectAttempts = 0
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageQueue: WebSocketMessage[] = []
  private listeners: Map<string, ((data: any) => void)[]> = new Map()
  private statusListeners: ((status: ConnectionStatus) => void)[] = []
  private userId: string | null = null
  private sessionId: string = this.generateSessionId()

  constructor(url?: string) {
    this.url = url || this.getWebSocketUrl()
  }

  private getWebSocketUrl(): string {
    if (typeof window === "undefined") return ""

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const host = window.location.host
    return `${protocol}//${host}/api/ws`
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  // 연결 설정
  connect(userId?: string) {
    if (typeof window === "undefined") return

    this.userId = userId || this.userId

    try {
      const wsUrl = new URL(this.url)
      if (this.userId) {
        wsUrl.searchParams.set("userId", this.userId)
      }
      wsUrl.searchParams.set("sessionId", this.sessionId)

      this.ws = new WebSocket(wsUrl.toString())
      this.setupEventListeners()

      console.log("WebSocket connecting to:", wsUrl.toString())
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
      this.scheduleReconnect()
    }
  }

  // 이벤트 리스너 설정
  private setupEventListeners() {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log("WebSocket connected")
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.flushMessageQueue()
      this.notifyStatusChange({
        connected: true,
        reconnecting: false,
        lastConnected: new Date(),
        reconnectAttempts: 0,
      })
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error)
      }
    }

    this.ws.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason)
      this.cleanup()

      if (event.code !== 1000) {
        // 정상 종료가 아닌 경우
        this.scheduleReconnect()
      }

      this.notifyStatusChange({
        connected: false,
        reconnecting: event.code !== 1000,
        reconnectAttempts: this.reconnectAttempts,
      })
    }

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error)
    }
  }

  // 메시지 처리
  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type) || []
    listeners.forEach((listener) => {
      try {
        listener(message.payload)
      } catch (error) {
        console.error("Error in message listener:", error)
      }
    })

    // 전체 메시지 리스너
    const allListeners = this.listeners.get("*") || []
    allListeners.forEach((listener) => {
      try {
        listener(message)
      } catch (error) {
        console.error("Error in global message listener:", error)
      }
    })
  }

  // 메시지 전송
  send(type: string, payload: any) {
    const message: WebSocketMessage = {
      type: type as any,
      payload,
      timestamp: Date.now(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      // 연결이 안 되어 있으면 큐에 저장
      this.messageQueue.push(message)

      // 연결 시도
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.connect()
      }
    }
  }

  // 큐에 저장된 메시지 전송
  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      if (message) {
        this.ws.send(JSON.stringify(message))
      }
    }
  }

  // 하트비트 시작
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send("heartbeat", { timestamp: Date.now() })
      }
    }, 30000) // 30초마다
  }

  // 재연결 스케줄링
  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnect attempts reached")
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000)

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)

    setTimeout(() => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.connect()
      }
    }, delay)
  }

  // 정리
  private cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  // 연결 해제
  disconnect() {
    this.cleanup()
    if (this.ws) {
      this.ws.close(1000, "Client disconnect")
      this.ws = null
    }
  }

  // 이벤트 리스너 등록
  on(type: string, listener: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(listener)

    // 구독 해제 함수 반환
    return () => {
      const listeners = this.listeners.get(type)
      if (listeners) {
        const index = listeners.indexOf(listener)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    }
  }

  // 상태 변경 리스너
  onStatusChange(listener: (status: ConnectionStatus) => void) {
    this.statusListeners.push(listener)

    return () => {
      const index = this.statusListeners.indexOf(listener)
      if (index > -1) {
        this.statusListeners.splice(index, 1)
      }
    }
  }

  private notifyStatusChange(status: ConnectionStatus) {
    this.statusListeners.forEach((listener) => {
      try {
        listener(status)
      } catch (error) {
        console.error("Error in status listener:", error)
      }
    })
  }

  // 연결 상태 확인
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  // 사용자 ID 설정
  setUserId(userId: string) {
    this.userId = userId
    if (this.isConnected()) {
      this.send("user_identify", { userId })
    }
  }

  // 알림 관련 메서드들
  sendNotification(notification: any) {
    this.send("notification", notification)
  }

  markNotificationAsRead(notificationId: string) {
    this.send("notification_read", { notificationId })
  }

  deleteNotification(notificationId: string) {
    this.send("notification_deleted", { notificationId })
  }

  // 사용자 상태 업데이트
  updateUserStatus(status: "online" | "away" | "offline") {
    this.send("user_status", { status })
  }
}

export const wsClient = new WebSocketClient()
