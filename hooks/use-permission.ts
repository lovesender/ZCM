"use client"

import type React from "react"

import { useMemo } from "react"
import { type BranchPermissions, PermissionLevel, hasPermission, CURRENT_PERMISSIONS } from "@/app/config/permissions"

interface UsePermissionProps {
  branchName?: string
  permissions?: BranchPermissions
}

export function usePermission(branchName = "요한", permissions: BranchPermissions = CURRENT_PERMISSIONS) {
  const permissionChecker = useMemo(() => {
    return {
      // 특정 권한 확인
      can: (permissionId: string, requiredLevel: PermissionLevel = PermissionLevel.READ) => {
        return hasPermission(branchName, permissionId, requiredLevel, permissions)
      },

      // 읽기 권한 확인
      canRead: (permissionId: string) => {
        return hasPermission(branchName, permissionId, PermissionLevel.READ, permissions)
      },

      // 쓰기 권한 확인
      canWrite: (permissionId: string) => {
        return hasPermission(branchName, permissionId, PermissionLevel.WRITE, permissions)
      },

      // 관리 권한 확인
      canManage: (permissionId: string) => {
        return hasPermission(branchName, permissionId, PermissionLevel.MANAGE, permissions)
      },

      // 관리자 권한 확인
      isAdmin: (permissionId: string) => {
        return hasPermission(branchName, permissionId, PermissionLevel.ADMIN, permissions)
      },

      // 현재 권한 수준 가져오기
      getLevel: (permissionId: string): PermissionLevel => {
        const branchPermissions = permissions[branchName]
        if (!branchPermissions) return PermissionLevel.NONE
        return branchPermissions[permissionId] || PermissionLevel.NONE
      },
    }
  }, [branchName, permissions])

  return permissionChecker
}

// 권한 기반 컴포넌트 래퍼
export function withPermission<T extends object>(
  Component: React.ComponentType<T>,
  permissionId: string,
  requiredLevel: PermissionLevel = PermissionLevel.READ,
  fallback?: React.ReactNode,
) {
  return function PermissionWrapper(props: T & { branchName?: string }) {
    const { branchName = "요한", ...componentProps } = props
    const { can } = usePermission(branchName)

    if (!can(permissionId, requiredLevel)) {
      return fallback || null
    }

    return <Component {...(componentProps as T)} />
  }
}
