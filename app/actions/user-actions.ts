"use server"

import { BRANCHES } from "@/app/config/branches"

// User 인터페이스 수정
export interface User {
  id: number
  name: string
  telegramId: string // email에서 telegramId로 변경
  role: "관리자" | "사용자" | "뷰어"
  branch: string
  department: string
  status: "활성" | "비활성" | "대기"
  lastLogin: string
  createdAt: string
  phone: string
  position: string
}

// 부서 목록
const departments = [
  "총무부",
  "행정서무부",
  "내무부",
  "기획부",
  "재정부",
  "교육부",
  "신학부",
  "해외선교부",
  "전도부",
  "문화부",
  "출판부",
  "정보통신부",
  "찬양부",
  "섭외부",
  "국내선교부",
  "홍보부",
  "법무부",
  "감사부",
  "건설부",
  "체육부",
  "사업부",
  "보건후생복지부",
  "봉사교통부",
  "외교정책부",
  "자문회",
  "장년회",
  "부녀회",
  "청년회",
]

// addUser 함수 매개변수 수정
export async function addUser(userData: {
  name: string
  telegramId: string // email에서 telegramId로 변경
  role: User["role"]
  branch: string
  department: string
  position: string
  phone: string
}): Promise<{ success: boolean; message: string; user?: User }> {
  try {
    // 유효성 검사
    if (!userData.name || !userData.telegramId || !userData.branch || !userData.department) {
      return {
        success: false,
        message: "필수 항목을 모두 입력해주세요.",
      }
    }

    // 텔레그램 ID 형식 검사
    if (!userData.telegramId.startsWith("@") || !/^@[a-zA-Z0-9_]+$/.test(userData.telegramId)) {
      return {
        success: false,
        message: "올바른 텔레그램 ID 형식을 입력해주세요.",
      }
    }

    // 지파 유효성 검사
    if (!BRANCHES.includes(userData.branch)) {
      return {
        success: false,
        message: "유효하지 않은 지파입니다.",
      }
    }

    // 부서 유효성 검사
    if (!departments.includes(userData.department)) {
      return {
        success: false,
        message: "유효하지 않은 부서입니다.",
      }
    }

    // 연락처 형식 검사 (선택사항)
    if (userData.phone) {
      const phoneRegex = /^010-\d{4}-\d{4}$/
      if (!phoneRegex.test(userData.phone)) {
        return {
          success: false,
          message: "연락처는 010-0000-0000 형식으로 입력해주세요.",
        }
      }
    }

    // 실제로는 데이터베이스에 저장
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 새 사용자 객체 생성
    const newUser: User = {
      id: Date.now(), // 실제로는 DB에서 자동 생성
      ...userData,
      status: "대기", // 새 사용자는 대기 상태로 시작
      lastLogin: "미접속",
      createdAt: new Date().toISOString().split("T")[0],
    }

    return {
      success: true,
      message: "사용자가 성공적으로 추가되었습니다.",
      user: newUser,
    }
  } catch (error) {
    console.error("사용자 추가 오류:", error)
    return {
      success: false,
      message: "사용자 추가 중 오류가 발생했습니다.",
    }
  }
}

// 사용자 수정
export async function updateUser(
  userId: number,
  userData: Partial<User>,
): Promise<{ success: boolean; message: string }> {
  try {
    // 실제로는 데이터베이스에서 업데이트
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "사용자 정보가 성공적으로 수정되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: "사용자 정보 수정 중 오류가 발생했습니다.",
    }
  }
}

// 사용자 삭제
export async function deleteUser(userId: number): Promise<{ success: boolean; message: string }> {
  try {
    // 실제로는 데이터베이스에서 삭제
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: "사용자가 성공적으로 삭제되었습니다.",
    }
  } catch (error) {
    return {
      success: false,
      message: "사용자 삭제 중 오류가 발생했습니다.",
    }
  }
}

// 사용자 상태 변경
export async function updateUserStatus(
  userId: number,
  status: User["status"],
): Promise<{ success: boolean; message: string }> {
  try {
    // 실제로는 데이터베이스에서 상태 업데이트
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      success: true,
      message: `사용자 상태가 ${status}(으)로 변경되었습니다.`,
    }
  } catch (error) {
    return {
      success: false,
      message: "사용자 상태 변경 중 오류가 발생했습니다.",
    }
  }
}
