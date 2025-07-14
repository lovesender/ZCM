"use client"

const STORAGE_KEY = "zcm-offline-registrations"

export async function saveOfflineRegistration(data: any) {
  try {
    const existing = await getOfflineRegistrations()
    const updated = [...existing, { ...data, timestamp: Date.now() }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("오프라인 저장 실패:", error)
    throw error
  }
}

export async function getOfflineRegistrations() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("오프라인 데이터 로드 실패:", error)
    return []
  }
}

export async function clearOfflineRegistrations() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("오프라인 데이터 삭제 실패:", error)
  }
}

// 오프라인 저장소 관리 유틸리티

export interface VehicleRegistration {
  id: string
  ownerName: string
  phone: string
  email: string
  branch: string
  department: string
  vehicleType: string
  vehicleNumber: string
  model: string
  year: string
  color: string
  purpose: string
  agreedToTerms: boolean
  createdAt: string
  synced: boolean
}

// 동기화 대기 중인 등록 개수 조회
export function getPendingSyncCount(): number {
  const registrations = getOfflineRegistrations()
  return registrations.filter((reg) => !reg.synced).length
}

// 고유 ID 생성
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 동기화 완료된 등록 데이터 제거
export function removeOfflineRegistration(id: string) {
  try {
    const existingData = getOfflineRegistrations()
    const updatedData = existingData.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
  } catch (error) {
    console.error("오프라인 데이터 제거 실패:", error)
  }
}

// 백그라운드 동기화 (온라인 상태일 때 실행)
export async function syncOfflineData() {
  if (!navigator.onLine) {
    return { success: false, message: "오프라인 상태입니다." }
  }

  const pendingRegistrations = getOfflineRegistrations().filter((reg) => !reg.synced)

  if (pendingRegistrations.length === 0) {
    return { success: true, message: "동기화할 데이터가 없습니다." }
  }

  let syncedCount = 0
  const errors: string[] = []

  for (const registration of pendingRegistrations) {
    try {
      // 실제 서버 API 호출 (여기서는 시뮬레이션)
      const response = await fetch("/api/vehicles/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registration),
      })

      if (response.ok) {
        removeOfflineRegistration(registration.id)
        syncedCount++
      } else {
        errors.push(`${registration.ownerName}님의 등록 실패`)
      }
    } catch (error) {
      errors.push(`${registration.ownerName}님의 등록 중 오류 발생`)
    }
  }

  return {
    success: errors.length === 0,
    message: `${syncedCount}개 등록 완료${errors.length > 0 ? `, ${errors.length}개 실패` : ""}`,
    syncedCount,
    errors,
  }
}
