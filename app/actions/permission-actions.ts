"use server"

import { BRANCHES } from "@/app/config/branches"
import { type CURRENT_PERMISSIONS, PermissionLevel, SYSTEM_PERMISSIONS } from "@/app/config/permissions"

// 역할 타입 정의
export interface Role {
  id: string
  name: string
  description: string
  permissions: { [key: string]: PermissionLevel }
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// 권한 변경 이력 타입
export interface PermissionHistory {
  id: string
  branchName: string
  permissionId: string
  oldLevel: PermissionLevel
  newLevel: PermissionLevel
  adminName: string
  timestamp: Date
  reason?: string
}

// 모의 데이터 - 실제로는 데이터베이스에서 가져옴
const mockRoles: Role[] = [
  {
    id: "role-1",
    name: "관리자",
    description: "모든 권한을 가진 최고 관리자",
    permissions: Object.fromEntries(SYSTEM_PERMISSIONS.map((p) => [p.id, PermissionLevel.FULL])),
    isDefault: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "role-2",
    name: "지파 관리자",
    description: "지파 내 차량 및 사용자 관리 권한",
    permissions: {
      "vehicle.view": PermissionLevel.FULL,
      "vehicle.create": PermissionLevel.FULL,
      "vehicle.edit": PermissionLevel.FULL,
      "vehicle.delete": PermissionLevel.LIMITED,
      "user.view": PermissionLevel.FULL,
      "user.create": PermissionLevel.FULL,
      "user.edit": PermissionLevel.LIMITED,
      "user.delete": PermissionLevel.NONE,
      "admin.dashboard": PermissionLevel.READ_ONLY,
      "admin.users": PermissionLevel.LIMITED,
      "admin.vehicles": PermissionLevel.FULL,
      "admin.notices": PermissionLevel.FULL,
      "admin.statistics": PermissionLevel.READ_ONLY,
      "admin.settings": PermissionLevel.NONE,
      "admin.permissions": PermissionLevel.NONE,
      "admin.help": PermissionLevel.READ_ONLY,
    },
    isDefault: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "role-3",
    name: "운영자",
    description: "일반적인 운영 업무 권한",
    permissions: {
      "vehicle.view": PermissionLevel.FULL,
      "vehicle.create": PermissionLevel.FULL,
      "vehicle.edit": PermissionLevel.LIMITED,
      "vehicle.delete": PermissionLevel.NONE,
      "user.view": PermissionLevel.READ_ONLY,
      "user.create": PermissionLevel.NONE,
      "user.edit": PermissionLevel.NONE,
      "user.delete": PermissionLevel.NONE,
      "admin.dashboard": PermissionLevel.READ_ONLY,
      "admin.users": PermissionLevel.READ_ONLY,
      "admin.vehicles": PermissionLevel.LIMITED,
      "admin.notices": PermissionLevel.READ_ONLY,
      "admin.statistics": PermissionLevel.READ_ONLY,
      "admin.settings": PermissionLevel.NONE,
      "admin.permissions": PermissionLevel.NONE,
      "admin.help": PermissionLevel.READ_ONLY,
    },
    isDefault: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

const mockHistory: PermissionHistory[] = [
  {
    id: "history-1",
    branchName: "서울지파",
    permissionId: "vehicle.edit",
    oldLevel: PermissionLevel.LIMITED,
    newLevel: PermissionLevel.FULL,
    adminName: "김관리자",
    timestamp: new Date("2024-12-10T09:30:00"),
    reason: "차량 정보 수정 권한 확대 요청",
  },
  {
    id: "history-2",
    branchName: "부산지파",
    permissionId: "user.delete",
    oldLevel: PermissionLevel.LIMITED,
    newLevel: PermissionLevel.NONE,
    adminName: "이관리자",
    timestamp: new Date("2024-12-09T14:20:00"),
    reason: "보안 정책에 따른 권한 축소",
  },
  {
    id: "history-3",
    branchName: "대구지파",
    permissionId: "admin.statistics",
    oldLevel: PermissionLevel.NONE,
    newLevel: PermissionLevel.READ_ONLY,
    adminName: "박관리자",
    timestamp: new Date("2024-12-08T11:15:00"),
    reason: "통계 조회 권한 부여",
  },
  {
    id: "history-4",
    branchName: "인천지파",
    permissionId: "vehicle.create",
    oldLevel: PermissionLevel.READ_ONLY,
    newLevel: PermissionLevel.FULL,
    adminName: "최관리자",
    timestamp: new Date("2024-12-07T16:45:00"),
    reason: "신규 차량 등록 업무 담당",
  },
  {
    id: "history-5",
    branchName: "광주지파",
    permissionId: "admin.notices",
    oldLevel: PermissionLevel.LIMITED,
    newLevel: PermissionLevel.FULL,
    adminName: "정관리자",
    timestamp: new Date("2024-12-06T10:30:00"),
    reason: "공지사항 관리 권한 확대",
  },
]

// 권한 저장
export async function savePermissions(
  permissions: typeof CURRENT_PERMISSIONS,
  reason?: string,
): Promise<{ success: boolean; message: string }> {
  try {
    // 실제로는 데이터베이스에 저장
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 변경 이력 기록
    const newHistory: PermissionHistory = {
      id: `history-${Date.now()}`,
      branchName: "전체",
      permissionId: "bulk_update",
      oldLevel: PermissionLevel.NONE,
      newLevel: PermissionLevel.FULL,
      adminName: "시스템 관리자",
      timestamp: new Date(),
      reason: reason || "권한 매트릭스 업데이트",
    }
    mockHistory.unshift(newHistory)

    return {
      success: true,
      message: "권한이 성공적으로 저장되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: "권한 저장 중 오류가 발생했습니다.",
    }
  }
}

// 역할 목록 조회
export async function getRoles(): Promise<{ success: boolean; data: Role[] }> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      success: true,
      data: mockRoles,
    }
  } catch (error) {
    return {
      success: false,
      data: [],
    }
  }
}

// 역할 생성
export async function createRole(roleData: {
  name: string
  description: string
  permissions: { [key: string]: PermissionLevel }
  isDefault: boolean
}): Promise<{ success: boolean; message: string }> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newRole: Role = {
      id: `role-${Date.now()}`,
      ...roleData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockRoles.push(newRole)

    // 변경 이력 기록
    const newHistory: PermissionHistory = {
      id: `history-${Date.now()}`,
      branchName: "전체",
      permissionId: "role.create",
      oldLevel: PermissionLevel.NONE,
      newLevel: PermissionLevel.FULL,
      adminName: "시스템 관리자",
      timestamp: new Date(),
      reason: `새 역할 '${roleData.name}' 생성`,
    }
    mockHistory.unshift(newHistory)

    return {
      success: true,
      message: "역할이 성공적으로 생성되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: "역할 생성 중 오류가 발생했습니다.",
    }
  }
}

// 역할 수정
export async function updateRole(
  roleId: string,
  roleData: {
    name: string
    description: string
    permissions: { [key: string]: PermissionLevel }
  },
): Promise<{ success: boolean; message: string }> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const roleIndex = mockRoles.findIndex((role) => role.id === roleId)
    if (roleIndex === -1) {
      return {
        success: false,
        message: "역할을 찾을 수 없습니다.",
      }
    }

    mockRoles[roleIndex] = {
      ...mockRoles[roleIndex],
      ...roleData,
      updatedAt: new Date(),
    }

    // 변경 이력 기록
    const newHistory: PermissionHistory = {
      id: `history-${Date.now()}`,
      branchName: "전체",
      permissionId: "role.update",
      oldLevel: PermissionLevel.LIMITED,
      newLevel: PermissionLevel.FULL,
      adminName: "시스템 관리자",
      timestamp: new Date(),
      reason: `역할 '${roleData.name}' 수정`,
    }
    mockHistory.unshift(newHistory)

    return {
      success: true,
      message: "역할이 성공적으로 수정되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: "역할 수정 중 오류가 발생했습니다.",
    }
  }
}

// 역할 삭제
export async function deleteRole(roleId: string): Promise<{ success: boolean; message: string }> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const roleIndex = mockRoles.findIndex((role) => role.id === roleId)
    if (roleIndex === -1) {
      return {
        success: false,
        message: "역할을 찾을 수 없습니다.",
      }
    }

    const role = mockRoles[roleIndex]
    if (role.isDefault) {
      return {
        success: false,
        message: "기본 역할은 삭제할 수 없습니다.",
      }
    }

    mockRoles.splice(roleIndex, 1)

    // 변경 이력 기록
    const newHistory: PermissionHistory = {
      id: `history-${Date.now()}`,
      branchName: "전체",
      permissionId: "role.delete",
      oldLevel: PermissionLevel.FULL,
      newLevel: PermissionLevel.NONE,
      adminName: "시스템 관리자",
      timestamp: new Date(),
      reason: `역할 '${role.name}' 삭제`,
    }
    mockHistory.unshift(newHistory)

    return {
      success: true,
      message: "역할이 성공적으로 삭제되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: "역할 삭제 중 오류가 발생했습니다.",
    }
  }
}

// 역할을 지파에 적용
export async function applyRoleToBranch(
  branchName: string,
  roleId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const role = mockRoles.find((r) => r.id === roleId)
    if (!role) {
      return {
        success: false,
        message: "역할을 찾을 수 없습니다.",
      }
    }

    if (!BRANCHES.includes(branchName)) {
      return {
        success: false,
        message: "유효하지 않은 지파입니다.",
      }
    }

    // 실제로는 해당 지파의 권한을 역할의 권한으로 업데이트
    // 여기서는 모의 처리

    // 변경 이력 기록
    const newHistory: PermissionHistory = {
      id: `history-${Date.now()}`,
      branchName,
      permissionId: "role.apply",
      oldLevel: PermissionLevel.LIMITED,
      newLevel: PermissionLevel.FULL,
      adminName: "시스템 관리자",
      timestamp: new Date(),
      reason: `역할 '${role.name}'을 ${branchName}에 적용`,
    }
    mockHistory.unshift(newHistory)

    return {
      success: true,
      message: `역할이 ${branchName}에 성공적으로 적용되었습니다.`,
    }
  } catch (error) {
    return {
      success: false,
      message: "역할 적용 중 오류가 발생했습니다.",
    }
  }
}

// 권한 변경 이력 조회 (새로운 버전)
export async function getPermissionHistory(options: {
  page: number
  limit: number
  filters: {
    branch: string
    admin: string
    dateFrom: string
    dateTo: string
    permission: string
    changeType: string
  }
}): Promise<{
  success: boolean
  items: any[]
  stats: {
    totalChanges: number
    todayChanges: number
    weekChanges: number
    increaseCount: number
  }
  total: number
}> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 필터링된 데이터 (실제로는 데이터베이스 쿼리)
    let filteredHistory = [...mockHistory]

    // 필터 적용
    if (options.filters.branch && options.filters.branch !== "all") {
      filteredHistory = filteredHistory.filter((item) => item.branchName === options.filters.branch)
    }
    if (options.filters.admin) {
      filteredHistory = filteredHistory.filter((item) =>
        item.adminName.toLowerCase().includes(options.filters.admin.toLowerCase()),
      )
    }
    if (options.filters.dateFrom) {
      const fromDate = new Date(options.filters.dateFrom)
      filteredHistory = filteredHistory.filter((item) => item.timestamp >= fromDate)
    }
    if (options.filters.dateTo) {
      const toDate = new Date(options.filters.dateTo)
      toDate.setHours(23, 59, 59, 999)
      filteredHistory = filteredHistory.filter((item) => item.timestamp <= toDate)
    }

    // 페이지네이션
    const startIndex = (options.page - 1) * options.limit
    const endIndex = startIndex + options.limit
    const paginatedData = filteredHistory.slice(startIndex, endIndex)

    // 통계 계산
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const stats = {
      totalChanges: mockHistory.length,
      todayChanges: mockHistory.filter((item) => {
        const itemDate = new Date(item.timestamp)
        itemDate.setHours(0, 0, 0, 0)
        return itemDate.getTime() === today.getTime()
      }).length,
      weekChanges: mockHistory.filter((item) => item.timestamp >= weekAgo).length,
      increaseCount: mockHistory.filter((item) => item.newLevel > item.oldLevel).length,
    }

    // 데이터 변환
    const items = paginatedData.map((item) => ({
      id: item.id,
      timestamp: item.timestamp.toISOString(),
      adminName: item.adminName,
      branchName: item.branchName,
      action: `${item.permissionId} 권한 변경`,
      permission: item.permissionId,
      oldValue: getPermissionLevelText(item.oldLevel),
      newValue: getPermissionLevelText(item.newLevel),
      reason: item.reason || "사유 없음",
      changeType: item.newLevel > item.oldLevel ? "increase" : item.newLevel < item.oldLevel ? "decrease" : "no-change",
    }))

    return {
      success: true,
      items,
      stats,
      total: filteredHistory.length,
    }
  } catch (error) {
    return {
      success: false,
      items: [],
      stats: {
        totalChanges: 0,
        todayChanges: 0,
        weekChanges: 0,
        increaseCount: 0,
      },
      total: 0,
    }
  }
}

// 권한 레벨을 텍스트로 변환하는 헬퍼 함수
function getPermissionLevelText(level: PermissionLevel): string {
  switch (level) {
    case PermissionLevel.NONE:
      return "없음"
    case PermissionLevel.READ_ONLY:
      return "읽기 전용"
    case PermissionLevel.LIMITED:
      return "제한적"
    case PermissionLevel.FULL:
      return "전체"
    default:
      return "알 수 없음"
  }
}
