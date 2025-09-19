/**
 * Authentication utilities for the vehicle management system
 */

export interface User {
  id: string
  name: string
  phone: string
  role: "admin" | "user" | "moderator"
  branch?: string
  department?: string
  isVerified: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: Date
}

// Mock user data for development
const mockUsers: User[] = [
  {
    id: "1",
    name: "관리자",
    phone: "010-1234-5678",
    role: "admin",
    branch: "요한",
    department: "총무부",
    isVerified: true,
    createdAt: new Date("2024-01-01"),
    lastLogin: new Date(),
  },
  {
    id: "2",
    name: "사용자1",
    phone: "010-9876-5432",
    role: "user",
    branch: "베드로",
    department: "교육부",
    isVerified: true,
    createdAt: new Date("2024-01-15"),
    lastLogin: new Date(),
  },
]

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  try {
    const authData = localStorage.getItem("auth_session")
    if (!authData) return false

    const session: AuthSession = JSON.parse(authData)
    return new Date() < new Date(session.expiresAt)
  } catch (error) {
    console.error("Error checking authentication:", error)
    return false
  }
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  try {
    const authData = localStorage.getItem("auth_session")
    if (!authData) return null

    const session: AuthSession = JSON.parse(authData)
    if (new Date() >= new Date(session.expiresAt)) {
      clearAuthData()
      return null
    }

    return session.user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === "admin" || false
}

/**
 * Set authentication data
 */
export function setAuthData(user: User, token: string, expiresIn: number = 24 * 60 * 60 * 1000): void {
  if (typeof window === "undefined") return

  const expiresAt = new Date(Date.now() + expiresIn)
  const session: AuthSession = {
    user: { ...user, lastLogin: new Date() },
    token,
    expiresAt,
  }

  localStorage.setItem("auth_session", JSON.stringify(session))
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("auth_session")
}

/**
 * Get authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null

  try {
    const authData = localStorage.getItem("auth_session")
    if (!authData) return null

    const session: AuthSession = JSON.parse(authData)
    if (new Date() >= new Date(session.expiresAt)) {
      clearAuthData()
      return null
    }

    return session.token
  } catch (error) {
    console.error("Error getting auth token:", error)
    return null
  }
}

/**
 * Mock login function (replace with actual API call)
 */
export async function login(phone: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication logic
    const user = mockUsers.find((u) => u.phone === phone)
    if (!user) {
      return { success: false, error: "사용자를 찾을 수 없습니다." }
    }

    // In real implementation, verify password hash
    if (password !== "password123") {
      return { success: false, error: "비밀번호가 올바르지 않습니다." }
    }

    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`

    // Set auth data (expires in 24 hours)
    setAuthData(user, token)

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, error: "로그인 중 오류가 발생했습니다." }
  }
}

/**
 * Logout function
 */
export function logout(): void {
  clearAuthData()
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }
}

/**
 * Require authentication (redirect to login if not authenticated)
 */
export function requireAuth(): boolean {
  if (!isAuthenticated()) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return false
  }
  return true
}

/**
 * Require admin role (redirect if not admin)
 */
export function requireAdmin(): boolean {
  if (!isAuthenticated() || !isAdmin()) {
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
    return false
  }
  return true
}

/**
 * Get user permissions based on role
 */
export function getUserPermissions(): string[] {
  const user = getCurrentUser()
  if (!user) return []

  const basePermissions = ["read_own_vehicles", "edit_own_vehicles"]

  switch (user.role) {
    case "admin":
      return [
        ...basePermissions,
        "read_all_vehicles",
        "edit_all_vehicles",
        "delete_vehicles",
        "manage_users",
        "view_statistics",
        "manage_settings",
        "bulk_operations",
      ]
    case "moderator":
      return [...basePermissions, "read_branch_vehicles", "edit_branch_vehicles", "view_branch_statistics"]
    default:
      return basePermissions
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(permission: string): boolean {
  const permissions = getUserPermissions()
  return permissions.includes(permission)
}
