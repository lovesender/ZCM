import type { NextRequest } from "next/server"

// WebSocket 연결 관리
const connections = new Map<
  string,
  {
    ws: WebSocket
    userId?: string
    sessionId: string
    lastHeartbeat: number
  }
>()

// 사용자별 연결 관리
const userConnections = new Map<string, Set<string>>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId")
  const sessionId = searchParams.get("sessionId") || generateSessionId()

  // WebSocket 업그레이드 확인
  const upgrade = request.headers.get("upgrade")
  if (upgrade !== "websocket") {
    return new Response("Expected WebSocket", { status: 426 })
  }

  try {
    // WebSocket 연결 생성 (실제 구현에서는 웹소켓 라이브러리 사용)
    const response = new Response(null, {
      status: 101,
      headers: {
        Upgrade: "websocket",
        Connection: "Upgrade",
      },
    })

    // 연결 정보 저장
    const connectionInfo = {
      ws: null as any, // 실제 WebSocket 객체
      userId: userId || undefined,
      sessionId,
      lastHeartbeat: Date.now(),
    }

    connections.set(sessionId, connectionInfo)

    // 사용자별 연결 추가
    if (userId) {
      if (!userConnections.has(userId)) {
        userConnections.set(userId, new Set())
      }
      userConnections.get(userId)!.add(sessionId)
    }

    console.log(`WebSocket connected: ${sessionId}, userId: ${userId}`)

    return response
  } catch (error) {
    console.error("WebSocket connection error:", error)
    return new Response("WebSocket connection failed", { status: 500 })
  }
}

function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 메시지 브로드캐스트 함수들
export function broadcastToUser(userId: string, message: any) {
  const sessionIds = userConnections.get(userId)
  if (!sessionIds) return

  sessionIds.forEach((sessionId) => {
    const connection = connections.get(sessionId)
    if (connection && connection.ws) {
      try {
        connection.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error("Failed to send message to session:", sessionId, error)
        // 연결 정리
        cleanupConnection(sessionId)
      }
    }
  })
}

export function broadcastToAll(message: any) {
  connections.forEach((connection, sessionId) => {
    if (connection.ws) {
      try {
        connection.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error("Failed to broadcast message to session:", sessionId, error)
        cleanupConnection(sessionId)
      }
    }
  })
}

function cleanupConnection(sessionId: string) {
  const connection = connections.get(sessionId)
  if (connection) {
    if (connection.userId) {
      const userSessions = userConnections.get(connection.userId)
      if (userSessions) {
        userSessions.delete(sessionId)
        if (userSessions.size === 0) {
          userConnections.delete(connection.userId)
        }
      }
    }
    connections.delete(sessionId)
  }
}

// 하트비트 체크 (주기적으로 실행)
setInterval(() => {
  const now = Date.now()
  const timeout = 60000 // 1분

  connections.forEach((connection, sessionId) => {
    if (now - connection.lastHeartbeat > timeout) {
      console.log("Connection timeout:", sessionId)
      cleanupConnection(sessionId)
    }
  })
}, 30000) // 30초마다 체크
