"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  Eye,
  Edit,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Clock,
  Trash2,
  Save,
  X,
  AlertTriangle,
} from "lucide-react"
import { BRANCHES } from "@/app/config/branches"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { PageLayout } from "@/components/page-layout"
import { FormFieldWithValidation } from "@/components/form-field-with-validation"
import { validateUserForm, sanitizeInput, type UserFormData } from "@/lib/user-validation"

// 사용자 데이터 타입
interface User {
  id: number
  name: string
  email: string
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

// 샘플 사용자 데이터 - 고정된 ID 사용
const initialUsers: User[] = [
  {
    id: 1001,
    name: "김관리자",
    email: "admin@example.com",
    role: "관리자",
    branch: "요한",
    department: "총무부",
    status: "활성",
    lastLogin: "2024-01-15 14:30",
    createdAt: "2023-01-10",
    phone: "010-1234-5678",
    position: "부장",
  },
  {
    id: 1002,
    name: "이사용자",
    email: "user1@example.com",
    role: "사용자",
    branch: "베드로",
    department: "행정서무부",
    status: "활성",
    lastLogin: "2024-01-14 09:15",
    createdAt: "2023-02-15",
    phone: "010-2345-6789",
    position: "과장",
  },
  {
    id: 1003,
    name: "박직원",
    email: "user2@example.com",
    role: "사용자",
    branch: "부산야고보",
    department: "내무부",
    status: "대기",
    lastLogin: "2024-01-10 16:45",
    createdAt: "2023-03-20",
    phone: "010-3456-7890",
    position: "대리",
  },
  {
    id: 1004,
    name: "최담당자",
    email: "user3@example.com",
    role: "사용자",
    branch: "안드레",
    department: "기획부",
    status: "활성",
    lastLogin: "2024-01-13 11:20",
    createdAt: "2023-04-05",
    phone: "010-4567-8901",
    position: "주임",
  },
  {
    id: 1005,
    name: "정관리",
    email: "user4@example.com",
    role: "관리자",
    branch: "다대오",
    department: "재정부",
    status: "활성",
    lastLogin: "2024-01-15 08:30",
    createdAt: "2023-05-12",
    phone: "010-5678-9012",
    position: "차장",
  },
  {
    id: 1006,
    name: "김신입",
    email: "user5@example.com",
    role: "뷰어",
    branch: "빌립",
    department: "교육부",
    status: "대기",
    lastLogin: "미접속",
    createdAt: "2024-01-10",
    phone: "010-6789-0123",
    position: "사원",
  },
  {
    id: 1007,
    name: "송부장",
    email: "user6@example.com",
    role: "관리자",
    branch: "시몬",
    department: "봉사교통부",
    status: "활성",
    lastLogin: "2024-01-14 17:20",
    createdAt: "2022-11-08",
    phone: "010-7890-1234",
    position: "부장",
  },
  {
    id: 1008,
    name: "한직원",
    email: "user7@example.com",
    role: "사용자",
    branch: "바돌로매",
    department: "문화부",
    status: "비활성",
    lastLogin: "2023-12-20 10:15",
    createdAt: "2023-08-15",
    phone: "010-8901-2345",
    position: "대리",
  },
]

const getStatusBadge = (status: User["status"]) => {
  const statusConfig = {
    활성: { color: "bg-green-100 text-green-800", icon: UserCheck },
    비활성: { color: "bg-red-100 text-red-800", icon: UserX },
    대기: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  )
}

const getRoleBadge = (role: User["role"]) => {
  const roleConfig = {
    관리자: "bg-purple-100 text-purple-800",
    사용자: "bg-blue-100 text-blue-800",
    뷰어: "bg-gray-100 text-gray-800",
  }

  return <Badge className={roleConfig[role]}>{role}</Badge>
}

export default function UsersPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false)
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [nextUserId, setNextUserId] = useState(2000) // Start from a high number to avoid conflicts

  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    role: "사용자" as User["role"],
    branch: "",
    department: "",
    position: "",
    phone: "",
  })

  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    role: "사용자" as User["role"],
    branch: "",
    department: "",
    position: "",
    phone: "",
    status: "활성" as User["status"],
  })

  // 기존 이메일 목록
  const existingEmails = useMemo(() => users.map((user) => user.email.toLowerCase()), [users])

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    } else {
      setSelectedUsers([])
    }
  }

  // 개별 선택/해제
  const handleSelectUser = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId])
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId))
    }
  }

  // 일괄 작업 처리
  const handleBulkAction = async (actionId: string, value?: string) => {
    console.log("일괄 작업:", actionId, "값:", value, "선택된 사용자:", selectedUsers)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (actionId === "changeStatus" && value) {
      // Update the status of selected users
      setUsers(
        users.map((user) => (selectedUsers.includes(user.id) ? { ...user, status: value as User["status"] } : user)),
      )

      return {
        success: true,
        message: `${selectedUsers.length}명의 상태가 ${value}(으)로 변경되었습니다.`,
      }
    } else if (actionId === "changeRole" && value) {
      // Update the role of selected users
      setUsers(users.map((user) => (selectedUsers.includes(user.id) ? { ...user, role: value as User["role"] } : user)))

      return {
        success: true,
        message: `${selectedUsers.length}명의 역할이 ${value}(으)로 변경되었습니다.`,
      }
    } else if (actionId === "delete") {
      // Delete selected users
      setUsers(users.filter((user) => !selectedUsers.includes(user.id)))
      setSelectedUsers([])

      return {
        success: true,
        message: `${selectedUsers.length}명이 삭제되었습니다.`,
      }
    }

    return { success: false, message: "알 수 없는 작업입니다." }
  }

  // 일괄 작업 정의
  const bulkActions = [
    {
      id: "changeStatus",
      label: "상태 변경",
      icon: <Edit className="w-4 h-4" />,
      requiresValue: true,
      options: [
        { value: "활성", label: "활성" },
        { value: "비활성", label: "비활성" },
        { value: "대기", label: "대기" },
      ],
    },
    {
      id: "changeRole",
      label: "역할 변경",
      icon: <Edit className="w-4 h-4" />,
      requiresValue: true,
      options: [
        { value: "관리자", label: "관리자" },
        { value: "사용자", label: "사용자" },
        { value: "뷰어", label: "뷰어" },
      ],
    },
    {
      id: "delete",
      label: "삭제",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
    },
  ]

  // 필터링된 사용자 목록
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || user.status === statusFilter
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesBranch = branchFilter === "all" || user.branch === branchFilter

      return matchesSearch && matchesStatus && matchesRole && matchesBranch
    })
  }, [users, searchTerm, statusFilter, roleFilter, branchFilter])

  // 통계 계산
  const stats = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.status === "활성").length
    const inactive = users.filter((u) => u.status === "비활성").length
    const pending = users.filter((u) => u.status === "대기").length
    const admins = users.filter((u) => u.role === "관리자").length

    return { total, active, inactive, pending, admins }
  }, [users])

  // 사용자 추가
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors([])

    try {
      // 입력값 정리
      const sanitizedData: UserFormData = {
        name: sanitizeInput(newUserData.name),
        email: sanitizeInput(newUserData.email.toLowerCase()),
        phone: sanitizeInput(newUserData.phone),
        position: sanitizeInput(newUserData.position),
        role: newUserData.role,
        branch: newUserData.branch,
        department: newUserData.department,
      }

      // 강화된 검증
      const validation = validateUserForm(sanitizedData, existingEmails, BRANCHES, departments)

      if (!validation.isValid) {
        setFormErrors(validation.errors)
        return
      }

      // 새 사용자 추가 - 고정된 ID 사용
      const newUser: User = {
        id: nextUserId,
        ...sanitizedData,
        status: "대기",
        lastLogin: "미접속",
        createdAt: new Date().toISOString().split("T")[0],
      }

      setUsers((prev) => [...prev, newUser])
      setNextUserId((prev) => prev + 1)

      // 폼 초기화 및 모달 닫기
      setNewUserData({
        name: "",
        email: "",
        role: "사용자",
        branch: "",
        department: "",
        position: "",
        phone: "",
      })
      setIsAddUserModalOpen(false)
      setFormErrors([])

      alert("사용자가 성공적으로 추가되었습니다.")
    } catch (error) {
      setFormErrors(["사용자 추가 중 오류가 발생했습니다."])
    } finally {
      setIsSubmitting(false)
    }
  }

  // 사용자 수정
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors([])

    try {
      if (!editingUser) return

      // 입력값 정리
      const sanitizedData: UserFormData = {
        name: sanitizeInput(editUserData.name),
        email: sanitizeInput(editUserData.email.toLowerCase()),
        phone: sanitizeInput(editUserData.phone),
        position: sanitizeInput(editUserData.position),
        role: editUserData.role,
        branch: editUserData.branch,
        department: editUserData.department,
        status: editUserData.status,
      }

      // 강화된 검증 (현재 이메일 제외)
      const validation = validateUserForm(
        sanitizedData,
        existingEmails,
        BRANCHES,
        departments,
        editingUser.email.toLowerCase(),
      )

      if (!validation.isValid) {
        setFormErrors(validation.errors)
        return
      }

      // 사용자 정보 업데이트
      const updatedUser: User = {
        ...editingUser,
        ...sanitizedData,
      }

      setUsers((prev) => prev.map((user) => (user.id === editingUser.id ? updatedUser : user)))

      // 모달 닫기
      setIsEditUserModalOpen(false)
      setEditingUser(null)
      setFormErrors([])

      alert("사용자 정보가 성공적으로 수정되었습니다.")
    } catch (error) {
      setFormErrors(["사용자 정보 수정 중 오류가 발생했습니다."])
    } finally {
      setIsSubmitting(false)
    }
  }

  // 편집 모달 열기
  const openEditModal = (user: User) => {
    setEditingUser(user)
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      department: user.department,
      position: user.position,
      phone: user.phone,
      status: user.status,
    })
    setFormErrors([])
    setIsEditUserModalOpen(true)
  }

  // 연락처 포맷팅
  const handlePhoneChange = (value: string, isEdit = false) => {
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

    if (isEdit) {
      setEditUserData((prev) => ({ ...prev, phone: formattedValue }))
    } else {
      setNewUserData((prev) => ({ ...prev, phone: formattedValue }))
    }
  }

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (confirm(`"${userName}" 사용자를 삭제하시겠습니까?`)) {
      try {
        // In a real app, this would call the server action
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Remove the user from the local state
        setUsers(users.filter((user) => user.id !== userId))
        alert("사용자가 성공적으로 삭제되었습니다.")
      } catch (error) {
        console.error("사용자 삭제 오류:", error)
        alert("사용자 삭제 중 오류가 발생했습니다.")
      }
    }
  }

  // 브레드크럼 데이터 수정
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "사용자 관리" }]

  return (
    <PageLayout
      title="사용자 관리"
      description="시스템 사용자를 관리합니다"
      breadcrumbs={breadcrumbs}
      headerAction={
        <Button className="flex items-center gap-2" onClick={() => setIsAddUserModalOpen(true)}>
          <UserPlus className="w-4 h-4" />
          사용자 추가
        </Button>
      }
    >
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">비활성</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">대기</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">관리자</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="이름, 이메일, 부서로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 상태</SelectItem>
                <SelectItem value="활성">활성</SelectItem>
                <SelectItem value="비활성">비활성</SelectItem>
                <SelectItem value="대기">대기</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="역할 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 역할</SelectItem>
                <SelectItem value="관리자">관리자</SelectItem>
                <SelectItem value="사용자">사용자</SelectItem>
                <SelectItem value="뷰어">뷰어</SelectItem>
              </SelectContent>
            </Select>
            <Select value={branchFilter} onValueChange={setBranchFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="지파 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지파</SelectItem>
                {BRANCHES.map((branch) => (
                  <SelectItem key={branch} value={branch}>
                    {branch}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <BulkActionBar
            selectedCount={selectedUsers.length}
            totalCount={filteredUsers.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedUsers([])}
          />

          {/* 사용자 테이블 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead>이메일</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>지파/부서</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>마지막 로그인</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.branch}</div>
                        <div className="text-sm text-gray-500">{user.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>사용자 상세 정보</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">이름</label>
                                    <p className="text-lg font-semibold">{selectedUser.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">이메일</label>
                                    <p>{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">역할</label>
                                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">연락처</label>
                                    <p>{selectedUser.phone}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">지파/부서</label>
                                    <p>
                                      {selectedUser.branch} / {selectedUser.department}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">직책</label>
                                    <p>{selectedUser.position}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">상태</label>
                                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">가입일</label>
                                    <p>{selectedUser.createdAt}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">검색 조건에 맞는 사용자가 없습니다.</div>
          )}
        </CardContent>
      </Card>

      {/* 사용자 추가 모달 */}
      <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>사용자 추가</DialogTitle>
          </DialogHeader>

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

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWithValidation
                label="이름"
                id="name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                required
              />

              <FormFieldWithValidation
                label="이메일"
                id="email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
              />

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium">
                  역할
                </label>
                <Select
                  value={newUserData.role}
                  onValueChange={(value) => setNewUserData({ ...newUserData, role: value as User["role"] })}
                >
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

              <div className="space-y-2">
                <label htmlFor="branch" className="block text-sm font-medium">
                  지파
                </label>
                <Select
                  value={newUserData.branch}
                  onValueChange={(value) => setNewUserData({ ...newUserData, branch: value })}
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
                  value={newUserData.department}
                  onValueChange={(value) => setNewUserData({ ...newUserData, department: value })}
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
                value={newUserData.position}
                onChange={(e) => setNewUserData({ ...newUserData, position: e.target.value })}
              />

              <FormFieldWithValidation
                label="연락처"
                id="phone"
                value={newUserData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="010-0000-0000"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserModalOpen(false)}
                disabled={isSubmitting}
              >
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
        </DialogContent>
      </Dialog>

      {/* 사용자 편집 모달 */}
      <Dialog open={isEditUserModalOpen} onOpenChange={setIsEditUserModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>사용자 정보 수정</DialogTitle>
          </DialogHeader>

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

          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldWithValidation
                label="이름"
                id="edit-name"
                value={editUserData.name}
                onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                required
              />

              <FormFieldWithValidation
                label="이메일"
                id="edit-email"
                type="email"
                value={editUserData.email}
                onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                required
              />

              <div className="space-y-2">
                <label htmlFor="edit-role" className="block text-sm font-medium">
                  역할
                </label>
                <Select
                  value={editUserData.role}
                  onValueChange={(value) => setEditUserData({ ...editUserData, role: value as User["role"] })}
                >
                  <SelectTrigger id="edit-role">
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="관리자">관리자</SelectItem>
                    <SelectItem value="사용자">사용자</SelectItem>
                    <SelectItem value="뷰어">뷰어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-status" className="block text-sm font-medium">
                  상태
                </label>
                <Select
                  value={editUserData.status}
                  onValueChange={(value) => setEditUserData({ ...editUserData, status: value as User["status"] })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="활성">활성</SelectItem>
                    <SelectItem value="비활성">비활성</SelectItem>
                    <SelectItem value="대기">대기</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-branch" className="block text-sm font-medium">
                  지파
                </label>
                <Select
                  value={editUserData.branch}
                  onValueChange={(value) => setEditUserData({ ...editUserData, branch: value })}
                >
                  <SelectTrigger id="edit-branch">
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
                <label htmlFor="edit-department" className="block text-sm font-medium">
                  부서
                </label>
                <Select
                  value={editUserData.department}
                  onValueChange={(value) => setEditUserData({ ...editUserData, department: value })}
                >
                  <SelectTrigger id="edit-department">
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
                id="edit-position"
                value={editUserData.position}
                onChange={(e) => setEditUserData({ ...editUserData, position: e.target.value })}
              />

              <FormFieldWithValidation
                label="연락처"
                id="edit-phone"
                value={editUserData.phone}
                onChange={(e) => handlePhoneChange(e.target.value, true)}
                placeholder="010-0000-0000"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditUserModalOpen(false)}
                disabled={isSubmitting}
              >
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
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
