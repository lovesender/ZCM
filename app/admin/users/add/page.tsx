"use client"

import type React from "react"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Save, X } from "lucide-react"
import { BRANCHES } from "@/app/config/branches"
import { FormFieldWithValidation } from "@/components/form-field-with-validation"
import { validateUserForm, sanitizeInput, type UserFormData } from "@/lib/user-validation"

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

export default function AddUserPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const [userData, setUserData] = useState({
    name: "",
    telegramId: "", // 이메일에서 텔레그램 ID로 변경
    role: "사용자",
    branch: "",
    department: "",
    position: "",
    phone: "",
    password: "",
    passwordConfirm: "",
  })

  // 연락처 포맷팅
  const handlePhoneChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, "")
    let formattedValue = numbers

    if (numbers.length >= 3) {
      formattedValue = numbers.slice(0, 3) + "-"
      if (numbers.length >= 7) {
        formattedValue += numbers.slice(3, 7) + "-" + numbers.slice(7, 11)
      } else {
        formattedValue += numbers.slice(3)
      }
    }

    setUserData((prev) => ({ ...prev, phone: formattedValue }))
  }

  // 사용자 추가
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors([])
    setFormSuccess(null)

    try {
      // 비밀번호 확인
      if (userData.password !== userData.passwordConfirm) {
        setFormErrors(["비밀번호와 비밀번호 확인이 일치하지 않습니다."])
        setIsSubmitting(false)
        return
      }

      // 입력값 정리
      const sanitizedData: UserFormData = {
        name: sanitizeInput(userData.name),
        telegramId: sanitizeInput(userData.telegramId), // 이메일에서 텔레그램 ID로 변경
        phone: sanitizeInput(userData.phone),
        position: sanitizeInput(userData.position),
        role: userData.role,
        branch: userData.branch,
        department: userData.department,
        password: userData.password,
      }

      // 강화된 검증
      const validation = validateUserForm(sanitizedData, [], BRANCHES, departments)

      if (!validation.isValid) {
        setFormErrors(validation.errors)
        setIsSubmitting(false)
        return
      }

      // 실제 구현에서는 서버 API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000)) // 시뮬레이션

      // 폼 초기화
      setUserData({
        name: "",
        telegramId: "", // 이메일에서 텔레그램 ID로 변경
        role: "사용자",
        branch: "",
        department: "",
        position: "",
        phone: "",
        password: "",
        passwordConfirm: "",
      })

      setFormSuccess("사용자가 성공적으로 추가되었습니다.")
    } catch (error) {
      setFormErrors(["사용자 추가 중 오류가 발생했습니다."])
    } finally {
      setIsSubmitting(false)
    }
  }

  // 브레드크럼 데이터 수정
  const breadcrumbs = [
    { label: "홈", href: "/" },
    { label: "사용자 관리", href: "/admin/users" },
    { label: "사용자 추가" },
  ]

  return (
    <PageLayout title="사용자 추가" description="새로운 사용자를 시스템에 추가합니다" breadcrumbs={breadcrumbs}>
      <Card>
        <CardContent className="p-6">
          {formErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">입력 오류가 있습니다</span>
              </div>
              <ul className="list-disc pl-5 text-sm">
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {formSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">{formSuccess}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleAddUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">기본 정보</h3>

                <FormFieldWithValidation
                  label="이름"
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  required
                />

                <FormFieldWithValidation
                  label="텔레그램 ID" // 이메일에서 텔레그램 ID로 변경
                  id="telegramId" // email에서 telegramId로 변경
                  type="text" // email에서 text로 변경
                  value={userData.telegramId} // email에서 telegramId로 변경
                  onChange={(e) => setUserData({ ...userData, telegramId: e.target.value })} // email에서 telegramId로 변경
                  required
                />

                <FormFieldWithValidation
                  label="연락처"
                  id="phone"
                  value={userData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="010-0000-0000"
                />

                <div className="space-y-2">
                  <label htmlFor="role" className="block text-sm font-medium">
                    역할
                  </label>
                  <Select value={userData.role} onValueChange={(value) => setUserData({ ...userData, role: value })}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="역할 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="관리자">관리자</SelectItem>
                      <SelectItem value="사용자">사용자</SelectItem>
                      <SelectItem value="뷰어">뷰어</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">소속 정보</h3>

                <div className="space-y-2">
                  <label htmlFor="branch" className="block text-sm font-medium">
                    지파
                  </label>
                  <Select
                    value={userData.branch}
                    onValueChange={(value) => setUserData({ ...userData, branch: value })}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="지파 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="department" className="block text-sm font-medium">
                    부서
                  </label>
                  <Select
                    value={userData.department}
                    onValueChange={(value) => setUserData({ ...userData, department: value })}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="부서 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormFieldWithValidation
                  label="직책"
                  id="position"
                  value={userData.position}
                  onChange={(e) => setUserData({ ...userData, position: e.target.value })}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">계정 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormFieldWithValidation
                  label="비밀번호"
                  id="password"
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                  required
                  helperText="8자 이상, 영문, 숫자, 특수문자 포함"
                />

                <FormFieldWithValidation
                  label="비밀번호 확인"
                  id="passwordConfirm"
                  type="password"
                  value={userData.passwordConfirm}
                  onChange={(e) => setUserData({ ...userData, passwordConfirm: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                <X className="w-4 h-4 mr-1" />
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-1">⏳</span> 처리중...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
