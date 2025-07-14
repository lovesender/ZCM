import type { User } from "@/app/actions/user-actions"

// 명령어 처리 타입 정의
type CommandHandler = (
  telegramId: string,
  args: string[],
  userData?: any,
) => Promise<{ text: string; parseMode?: "HTML" | "Markdown" }>

// 사용자 데이터 조회 함수 (실제 구현에서는 데이터베이스에서 조회)
async function getUserByTelegramId(telegramId: string): Promise<User | null> {
  // 실제 구현에서는 데이터베이스에서 조회
  // 여기서는 예시 데이터 반환
  if (telegramId === "@testuser") {
    return {
      id: 1,
      name: "테스트 사용자",
      telegramId: "@testuser",
      role: "사용자",
      branch: "본부",
      department: "정보통신부",
      status: "활성",
      lastLogin: "2023-06-14",
      createdAt: "2023-01-01",
      phone: "010-1234-5678",
      position: "팀원",
    }
  }
  return null
}

// 차량 데이터 조회 함수 (실제 구현에서는 데이터베이스에서 조회)
async function getVehiclesByUserId(userId: number): Promise<any[]> {
  // 실제 구현에서는 데이터베이스에서 조회
  // 여기서는 예시 데이터 반환
  return [
    {
      id: 101,
      carNumber: "12가 3456",
      carModel: "현대 아반떼",
      status: "승인됨",
      registeredAt: "2023-02-15",
    },
    {
      id: 102,
      carNumber: "78나 9012",
      carModel: "기아 K5",
      status: "승인됨",
      registeredAt: "2023-03-20",
    },
  ]
}

// 알림 설정 조회 및 업데이트 함수 (실제 구현에서는 데이터베이스에서 조회/업데이트)
const userNotificationSettings = new Map<number, { [key: string]: boolean }>()

async function getUserNotificationSettings(userId: number): Promise<{ [key: string]: boolean }> {
  // 기본 설정
  const defaultSettings = {
    approvalNotice: true,
    systemNotice: true,
    eventNotice: true,
    maintenanceNotice: true,
  }

  // 저장된 설정이 있으면 반환, 없으면 기본 설정 반환
  return userNotificationSettings.get(userId) || defaultSettings
}

async function updateUserNotificationSetting(userId: number, settingKey: string, value: boolean): Promise<boolean> {
  try {
    // 현재 설정 가져오기
    const currentSettings = await getUserNotificationSettings(userId)

    // 유효한 설정 키인지 확인
    if (!(settingKey in currentSettings)) {
      return false
    }

    // 설정 업데이트
    const newSettings = {
      ...currentSettings,
      [settingKey]: value,
    }

    // 설정 저장
    userNotificationSettings.set(userId, newSettings)
    return true
  } catch (error) {
    console.error("알림 설정 업데이트 오류:", error)
    return false
  }
}

// 명령어 핸들러 정의
const commandHandlers: Record<string, CommandHandler> = {
  // 시작 명령어
  async start(telegramId) {
    const user = await getUserByTelegramId(telegramId)

    if (!user) {
      return {
        text: `
<b>👋 안녕하세요!</b>

차량 관리 시스템 봇에 오신 것을 환영합니다.
아직 등록된 사용자가 아닌 것 같습니다.

시스템 관리자에게 문의하여 계정을 등록해주세요.

<i>도움말을 보려면 /help 명령어를 입력하세요.</i>
`,
        parseMode: "HTML",
      }
    }

    return {
      text: `
<b>👋 안녕하세요, ${user.name}님!</b>

차량 관리 시스템 봇에 오신 것을 환영합니다.
이 봇을 통해 차량 정보 조회 및 알림 설정을 관리할 수 있습니다.

<i>사용 가능한 명령어를 보려면 /help 명령어를 입력하세요.</i>
`,
      parseMode: "HTML",
    }
  },

  // 도움말 명령어
  async help() {
    return {
      text: `
<b>🔍 사용 가능한 명령어</b>

/myinfo - 내 사용자 정보 조회
/myvehicles - 내 등록 차량 목록 조회
/notifications - 알림 설정 관리
/notification_on [유형] - 특정 알림 활성화
/notification_off [유형] - 특정 알림 비활성화
/help - 도움말 표시

<b>알림 유형:</b>
• approvalNotice - 승인 알림
• systemNotice - 시스템 알림
• eventNotice - 이벤트 알림
• maintenanceNotice - 유지보수 알림

<i>예시: /notification_off eventNotice</i>
`,
      parseMode: "HTML",
    }
  },

  // 내 정보 조회 명령어
  async myinfo(telegramId) {
    const user = await getUserByTelegramId(telegramId)

    if (!user) {
      return {
        text: "❌ 등록된 사용자 정보를 찾을 수 없습니다. 시스템 관리자에게 문의하세요.",
        parseMode: "HTML",
      }
    }

    return {
      text: `
<b>👤 사용자 정보</b>

• 이름: ${user.name}
• 역할: ${user.role}
• 지파: ${user.branch}
• 부서: ${user.department}
• 직책: ${user.position}
• 연락처: ${user.phone}
• 상태: ${user.status}
• 가입일: ${user.createdAt}
• 마지막 로그인: ${user.lastLogin}
`,
      parseMode: "HTML",
    }
  },

  // 내 차량 조회 명령어
  async myvehicles(telegramId) {
    const user = await getUserByTelegramId(telegramId)

    if (!user) {
      return {
        text: "❌ 등록된 사용자 정보를 찾을 수 없습니다. 시스템 관리자에게 문의하세요.",
        parseMode: "HTML",
      }
    }

    const vehicles = await getVehiclesByUserId(user.id)

    if (!vehicles || vehicles.length === 0) {
      return {
        text: "📝 등록된 차량이 없습니다. 시스템에서 차량을 등록해주세요.",
        parseMode: "HTML",
      }
    }

    const vehicleList = vehicles
      .map(
        (v, i) => `
<b>🚗 차량 #${i + 1}</b>
• 차량번호: ${v.carNumber}
• 차종: ${v.carModel}
• 상태: ${v.status}
• 등록일: ${v.registeredAt}
`,
      )
      .join("\n")

    return {
      text: `
<b>🚘 내 등록 차량 목록</b>

${vehicleList}

<i>총 ${vehicles.length}대의 차량이 등록되어 있습니다.</i>
`,
      parseMode: "HTML",
    }
  },

  // 알림 설정 조회 명령어
  async notifications(telegramId) {
    const user = await getUserByTelegramId(telegramId)

    if (!user) {
      return {
        text: "❌ 등록된 사용자 정보를 찾을 수 없습니다. 시스템 관리자에게 문의하세요.",
        parseMode: "HTML",
      }
    }

    const settings = await getUserNotificationSettings(user.id)

    const settingsText = Object.entries(settings)
      .map(([key, value]) => {
        const status = value ? "✅ 활성화" : "❌ 비활성화"
        let label = key

        switch (key) {
          case "approvalNotice":
            label = "승인 알림"
            break
          case "systemNotice":
            label = "시스템 알림"
            break
          case "eventNotice":
            label = "이벤트 알림"
            break
          case "maintenanceNotice":
            label = "유지보수 알림"
            break
        }

        return `• ${label}: ${status}`
      })
      .join("\n")

    return {
      text: `
<b>🔔 알림 설정</b>

${settingsText}

<i>알림 설정을 변경하려면:
/notification_on [유형] - 알림 활성화
/notification_off [유형] - 알림 비활성화</i>

<i>예시: /notification_off eventNotice</i>
`,
      parseMode: "HTML",
    }
  },

  // 알림 활성화 명령어
  async notification_on(telegramId, args) {
    if (!args || args.length === 0) {
      return {
        text: "❌ 알림 유형을 지정해주세요. 예: /notification_on approvalNotice",
        parseMode: "HTML",
      }
    }

    const settingKey = args[0]
    const user = await getUserByTelegramId(telegramId)

    if (!user) {
      return {
        text: "❌ 등록된 사용자 정보를 찾을 수 없습니다. 시스템 관리자에게 문의하세요.",
        parseMode: "HTML",
      }
    }

    const success = await updateUserNotificationSetting(user.id, settingKey, true)

    if (!success) {
      return {
        text: `❌ 알림 설정 변경에 실패했습니다. 유효한 알림 유형인지 확인해주세요.`,
        parseMode: "HTML",
      }
    }

    let label = settingKey
    switch (settingKey) {
      case "approvalNotice":
        label = "승인 알림"
        break
      case "systemNotice":
        label = "시스템 알림"
        break
      case "eventNotice":
        label = "이벤트 알림"
        break
      case "maintenanceNotice":
        label = "유지보수 알림"
        break
    }

    return {
      text: `✅ ${label} 알림이 활성화되었습니다.`,
      parseMode: "HTML",
    }
  },

  // 알림 비활성화 명령어
  async notification_off(telegramId, args) {
    if (!args || args.length === 0) {
      return {
        text: "❌ 알림 유형을 지정해주세요. 예: /notification_off approvalNotice",
        parseMode: "HTML",
      }
    }

    const settingKey = args[0]
    const user = await getUserByTelegramId(telegramId)

    if (!user) {
      return {
        text: "❌ 등록된 사용자 정보를 찾을 수 없습니다. 시스템 관리자에게 문의하세요.",
        parseMode: "HTML",
      }
    }

    const success = await updateUserNotificationSetting(user.id, settingKey, false)

    if (!success) {
      return {
        text: `❌ 알림 설정 변경에 실패했습니다. 유효한 알림 유형인지 확인해주세요.`,
        parseMode: "HTML",
      }
    }

    let label = settingKey
    switch (settingKey) {
      case "approvalNotice":
        label = "승인 알림"
        break
      case "systemNotice":
        label = "시스템 알림"
        break
      case "eventNotice":
        label = "이벤트 알림"
        break
      case "maintenanceNotice":
        label = "유지보수 알림"
        break
    }

    return {
      text: `❌ ${label} 알림이 비활성화되었습니다.`,
      parseMode: "HTML",
    }
  },
}

// 명령어 처리 함수
export async function handleCommand(
  command: string,
  telegramId: string,
  args: string[] = [],
): Promise<{ text: string; parseMode?: "HTML" | "Markdown" }> {
  // 명령어에서 '/' 제거
  const cleanCommand = command.startsWith("/") ? command.substring(1) : command

  // 명령어 핸들러 찾기
  const handler = commandHandlers[cleanCommand]

  if (!handler) {
    return {
      text: `❌ 알 수 없는 명령어입니다: ${command}\n\n사용 가능한 명령어를 보려면 /help를 입력하세요.`,
      parseMode: "HTML",
    }
  }

  try {
    // 명령어 처리
    return await handler(telegramId, args)
  } catch (error) {
    console.error(`명령어 처리 오류 (${command}):`, error)
    return {
      text: "⚠️ 명령어 처리 중 오류가 발생했습니다. 나중에 다시 시도해주세요.",
      parseMode: "HTML",
    }
  }
}

// 텔레그램 봇 명령어 설정 함수
export async function setBotCommands(): Promise<boolean> {
  try {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

    if (!TELEGRAM_BOT_TOKEN) {
      console.error("텔레그램 봇 토큰이 설정되지 않았습니다.")
      return false
    }

    const commands = [
      {
        command: "start",
        description: "봇 시작 및 소개",
      },
      {
        command: "help",
        description: "도움말 표시",
      },
      {
        command: "myinfo",
        description: "내 사용자 정보 조회",
      },
      {
        command: "myvehicles",
        description: "내 등록 차량 목록 조회",
      },
      {
        command: "notifications",
        description: "알림 설정 관리",
      },
      {
        command: "notification_on",
        description: "특정 알림 활성화",
      },
      {
        command: "notification_off",
        description: "특정 알림 비활성화",
      },
    ]

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ commands }),
    })

    const result = await response.json()

    if (!result.ok) {
      console.error("봇 명령어 설정 실패:", result.description)
      return false
    }

    console.log("봇 명령어 설정 성공")
    return true
  } catch (error) {
    console.error("봇 명령어 설정 오류:", error)
    return false
  }
}
