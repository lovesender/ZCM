"use server"

import { revalidatePath } from "next/cache"

// 설정 타입 정의
export interface GeneralSettings {
  siteName: string
  siteDescription: string
  itemsPerPage: string
  defaultLanguage: string
  enableDarkMode: boolean
  enableOfflineMode: boolean
  autoLogout: string
}

export interface SecuritySettings {
  passwordExpiry: string
  loginAttempts: string
  sessionTimeout: string
  requireTwoFactor: boolean
  allowMultipleSessions: boolean
  ipRestriction: boolean
}

export interface DatabaseSettings {
  backupFrequency: string
  retentionPeriod: string
  compressionEnabled: boolean
  encryptBackups: boolean
  autoOptimize: boolean
}

export interface MobileSettings {
  enablePushNotifications: boolean
  enableLocationServices: boolean
  cacheSize: string
  imageQuality: string
  enableOfflineEditing: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  telegramNotifications: boolean
  notifyOnLogin: boolean
  notifyOnVehicleChanges: boolean
  notifyOnApproval: boolean
  notifyOnSystemUpdates: boolean
  dailyDigest: boolean
  weeklyReport: boolean
}

// 모의 데이터베이스 (실제 구현에서는 데이터베이스 연결 사용)
// 실제 프로젝트에서는 이 부분을 데이터베이스 연결로 대체해야 합니다
const settingsDB = {
  general: {
    siteName: "차량 관리 시스템",
    siteDescription: "교회 차량 관리를 위한 통합 시스템",
    itemsPerPage: "10",
    defaultLanguage: "ko",
    enableDarkMode: true,
    enableOfflineMode: true,
    autoLogout: "30",
  } as GeneralSettings,

  security: {
    passwordExpiry: "90",
    loginAttempts: "5",
    sessionTimeout: "30",
    requireTwoFactor: false,
    allowMultipleSessions: true,
    ipRestriction: false,
  } as SecuritySettings,

  database: {
    backupFrequency: "daily",
    retentionPeriod: "30",
    compressionEnabled: true,
    encryptBackups: true,
    autoOptimize: true,
  } as DatabaseSettings,

  mobile: {
    enablePushNotifications: true,
    enableLocationServices: false,
    cacheSize: "100",
    imageQuality: "medium",
    enableOfflineEditing: true,
  } as MobileSettings,

  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    telegramNotifications: true,
    notifyOnLogin: true,
    notifyOnVehicleChanges: true,
    notifyOnApproval: true,
    notifyOnSystemUpdates: true,
    dailyDigest: false,
    weeklyReport: true,
  } as NotificationSettings,
}

// 설정 변경 이력 저장
interface SettingsHistory {
  timestamp: Date
  userId: string
  category: string
  changes: Record<string, any>
}

const settingsHistory: SettingsHistory[] = []

// 일반 설정 저장
export async function saveGeneralSettings(settings: GeneralSettings, userId = "admin") {
  try {
    // 변경 사항 기록
    const changes = findChanges(settingsDB.general, settings)

    // 설정 저장 (실제로는 데이터베이스에 저장)
    settingsDB.general = { ...settings }

    // 변경 이력 저장
    if (Object.keys(changes).length > 0) {
      settingsHistory.push({
        timestamp: new Date(),
        userId,
        category: "general",
        changes,
      })
    }

    // 캐시 무효화
    revalidatePath("/admin/settings")

    return { success: true, message: "일반 설정이 저장되었습니다." }
  } catch (error) {
    console.error("일반 설정 저장 중 오류 발생:", error)
    return { success: false, message: "설정 저장 중 오류가 발생했습니다." }
  }
}

// 보안 설정 저장
export async function saveSecuritySettings(settings: SecuritySettings, userId = "admin") {
  try {
    // 변경 사항 기록
    const changes = findChanges(settingsDB.security, settings)

    // 설정 저장
    settingsDB.security = { ...settings }

    // 변경 이력 저장
    if (Object.keys(changes).length > 0) {
      settingsHistory.push({
        timestamp: new Date(),
        userId,
        category: "security",
        changes,
      })
    }

    revalidatePath("/admin/settings")
    return { success: true, message: "보안 설정이 저장되었습니다." }
  } catch (error) {
    console.error("보안 설정 저장 중 오류 발생:", error)
    return { success: false, message: "설정 저장 중 오류가 발생했습니다." }
  }
}

// 데이터베이스 설정 저장
export async function saveDatabaseSettings(settings: DatabaseSettings, userId = "admin") {
  try {
    // 변경 사항 기록
    const changes = findChanges(settingsDB.database, settings)

    // 설정 저장
    settingsDB.database = { ...settings }

    // 변경 이력 저장
    if (Object.keys(changes).length > 0) {
      settingsHistory.push({
        timestamp: new Date(),
        userId,
        category: "database",
        changes,
      })
    }

    revalidatePath("/admin/settings")
    return { success: true, message: "데이터베이스 설정이 저장되었습니다." }
  } catch (error) {
    console.error("데이터베이스 설정 저장 중 오류 발생:", error)
    return { success: false, message: "설정 저장 중 오류가 발생했습니다." }
  }
}

// 모바일 설정 저장
export async function saveMobileSettings(settings: MobileSettings, userId = "admin") {
  try {
    // 변경 사항 기록
    const changes = findChanges(settingsDB.mobile, settings)

    // 설정 저장
    settingsDB.mobile = { ...settings }

    // 변경 이력 저장
    if (Object.keys(changes).length > 0) {
      settingsHistory.push({
        timestamp: new Date(),
        userId,
        category: "mobile",
        changes,
      })
    }

    revalidatePath("/admin/settings")
    return { success: true, message: "모바일 설정이 저장되었습니다." }
  } catch (error) {
    console.error("모바일 설정 저장 중 오류 발생:", error)
    return { success: false, message: "설정 저장 중 오류가 발생했습니다." }
  }
}

// 알림 설정 저장
export async function saveNotificationSettings(settings: NotificationSettings, userId = "admin") {
  try {
    // 변경 사항 기록
    const changes = findChanges(settingsDB.notifications, settings)

    // 설정 저장
    settingsDB.notifications = { ...settings }

    // 변경 이력 저장
    if (Object.keys(changes).length > 0) {
      settingsHistory.push({
        timestamp: new Date(),
        userId,
        category: "notifications",
        changes,
      })
    }

    revalidatePath("/admin/settings")
    return { success: true, message: "알림 설정이 저장되었습니다." }
  } catch (error) {
    console.error("알림 설정 저장 중 오류 발생:", error)
    return { success: false, message: "설정 저장 중 오류가 발생했습니다." }
  }
}

// 모든 설정 저장
export async function saveAllSettings(
  general: GeneralSettings,
  security: SecuritySettings,
  database: DatabaseSettings,
  mobile: MobileSettings,
  notifications: NotificationSettings,
  userId = "admin",
) {
  try {
    await saveGeneralSettings(general, userId)
    await saveSecuritySettings(security, userId)
    await saveDatabaseSettings(database, userId)
    await saveMobileSettings(mobile, userId)
    await saveNotificationSettings(notifications, userId)

    return { success: true, message: "모든 설정이 저장되었습니다." }
  } catch (error) {
    console.error("설정 저장 중 오류 발생:", error)
    return { success: false, message: "설정 저장 중 오류가 발생했습니다." }
  }
}

// 일반 설정 불러오기
export async function getGeneralSettings(): Promise<GeneralSettings> {
  // 실제로는 데이터베이스에서 불러옴
  return settingsDB.general
}

// 보안 설정 불러오기
export async function getSecuritySettings(): Promise<SecuritySettings> {
  return settingsDB.security
}

// 데이터베이스 설정 불러오기
export async function getDatabaseSettings(): Promise<DatabaseSettings> {
  return settingsDB.database
}

// 모바일 설정 불러오기
export async function getMobileSettings(): Promise<MobileSettings> {
  return settingsDB.mobile
}

// 알림 설정 불러오기
export async function getNotificationSettings(): Promise<NotificationSettings> {
  return settingsDB.notifications
}

// 모든 설정 불러오기
export async function getAllSettings() {
  return {
    general: await getGeneralSettings(),
    security: await getSecuritySettings(),
    database: await getDatabaseSettings(),
    mobile: await getMobileSettings(),
    notifications: await getNotificationSettings(),
  }
}

// 설정 변경 이력 불러오기
export async function getSettingsHistory(limit = 10) {
  return settingsHistory.slice(-limit).reverse()
}

// 변경 사항 찾기 (이전 값과 새 값 비교)
function findChanges(oldSettings: Record<string, any>, newSettings: Record<string, any>) {
  const changes: Record<string, { old: any; new: any }> = {}

  for (const key in newSettings) {
    if (oldSettings[key] !== newSettings[key]) {
      changes[key] = {
        old: oldSettings[key],
        new: newSettings[key],
      }
    }
  }

  return changes
}

// 설정 내보내기
export async function exportSettings() {
  return JSON.stringify(settingsDB, null, 2)
}

// 설정 가져오기
export async function importSettings(settingsJson: string, userId = "admin") {
  try {
    const settings = JSON.parse(settingsJson)

    // 유효성 검사
    if (!settings.general || !settings.security || !settings.database || !settings.mobile || !settings.notifications) {
      throw new Error("유효하지 않은 설정 파일입니다.")
    }

    // 설정 저장
    await saveAllSettings(
      settings.general,
      settings.security,
      settings.database,
      settings.mobile,
      settings.notifications,
      userId,
    )

    return { success: true, message: "설정을 성공적으로 가져왔습니다." }
  } catch (error) {
    console.error("설정 가져오기 중 오류 발생:", error)
    return {
      success: false,
      message: `설정 가져오기 중 오류가 발생했습니다: ${(error as Error).message}`,
    }
  }
}
