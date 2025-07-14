"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getRoles, createRole, updateRole, deleteRole, applyRoleToBranch } from "@/app/actions/permission-actions"
import { BRANCHES } from "@/app/config/branches"
import { Plus, Edit, Trash2, Shield, Users, AlertTriangle } from "lucide-react"

interface Role {
  id: string
  name: string
  description: string
  permissions: Record<string, number>
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

const PERMISSION_LEVELS = {
  0: { label: "없음", color: "bg-gray-100 text-gray-800" },
  1: { label: "읽기", color: "bg-blue-100 text-blue-800" },
  2: { label: "쓰기", color: "bg-green-100 text-green-800" },
  3: { label: "관리", color: "bg-purple-100 text-purple-800" },
}

const PERMISSIONS = [
  { key: "vehicle_view", label: "차량 조회" },
  { key: "vehicle_edit", label: "차량 수정" },
  { key: "vehicle_delete", label: "차량 삭제" },
  { key: "user_view", label: "사용자 조회" },
  { key: "user_edit", label: "사용자 수정" },
  { key: "user_delete", label: "사용자 삭제" },
  { key: "admin_access", label: "관리자 접근" },
  { key: "bulk_edit", label: "일괄 수정" },
  { key: "export_data", label: "데이터 내보내기" },
  { key: "system_settings", label: "시스템 설정" },
]

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: {} as Record<string, number>,
  })
  const [selectedBranch, setSelectedBranch] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    setLoading(true)
    try {
      const result = await getRoles()
      if (result.success) {
        setRoles(result.data)
      } else {
        setRoles([])
      }
    } catch (error) {
      console.error("역할 로드 실패:", error)
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    if (!formData.name.trim()) return

    setActionLoading(true)
    try {
      const result = await createRole(formData)
      if (result.success) {
        await loadRoles()
        setIsCreateModalOpen(false)
        resetForm()
      } else {
        console.error("역할 생성 실패:", result.message)
      }
    } catch (error) {
      console.error("역할 생성 실패:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateRole = async () => {
    if (!selectedRole || !formData.name.trim()) return

    setActionLoading(true)
    try {
      const result = await updateRole(selectedRole.id, formData)
      if (result.success) {
        await loadRoles()
        setIsEditModalOpen(false)
        resetForm()
      } else {
        console.error("역할 수정 실패:", result.message)
      }
    } catch (error) {
      console.error("역할 수정 실패:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm("정말로 이 역할을 삭제하시겠습니까?")) return

    setActionLoading(true)
    try {
      const result = await deleteRole(roleId)
      if (result.success) {
        await loadRoles()
      } else {
        console.error("역할 삭제 실패:", result.message)
      }
    } catch (error) {
      console.error("역할 삭제 실패:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleApplyRole = async () => {
    if (!selectedRole || !selectedBranch) return

    setActionLoading(true)
    try {
      const result = await applyRoleToBranch(selectedBranch, selectedRole.id)
      if (result.success) {
        setIsApplyModalOpen(false)
        setSelectedBranch("")
      } else {
        console.error("역할 적용 실패:", result.message)
      }
    } catch (error) {
      console.error("역할 적용 실패:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      permissions: {},
    })
    setSelectedRole(null)
  }

  const openEditModal = (role: Role) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      description: role.description,
      permissions: { ...role.permissions },
    })
    setIsEditModalOpen(true)
  }

  const openApplyModal = (role: Role) => {
    setSelectedRole(role)
    setIsApplyModalOpen(true)
  }

  const updatePermission = (permissionKey: string, level: number) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: level,
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">역할 관리</h2>
          <p className="text-gray-600">시스템 역할을 생성하고 권한을 설정합니다</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />새 역할 생성
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 역할 생성</DialogTitle>
              <DialogDescription>새로운 역할을 생성하고 권한을 설정합니다</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">역할 이름</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="역할 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium">설명</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="역할에 대한 설명을 입력하세요"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">권한 설정</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {PERMISSIONS.map((permission) => (
                    <div key={permission.key} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{permission.label}</span>
                      <Select
                        value={String(formData.permissions[permission.key] || 0)}
                        onValueChange={(value) => updatePermission(permission.key, Number.parseInt(value))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PERMISSION_LEVELS).map(([level, config]) => (
                            <SelectItem key={level} value={level}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                취소
              </Button>
              <Button onClick={handleCreateRole} disabled={actionLoading}>
                {actionLoading ? <LoadingSpinner /> : "생성"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 역할 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {role.name}
                </CardTitle>
                {role.isSystem && <Badge variant="secondary">시스템</Badge>}
              </div>
              <CardDescription>{role.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">권한 요약</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(role.permissions).map(([key, level]) => {
                      const permission = PERMISSIONS.find((p) => p.key === key)
                      const levelConfig = PERMISSION_LEVELS[level as keyof typeof PERMISSION_LEVELS]
                      if (!permission || level === 0) return null
                      return (
                        <Badge key={key} variant="secondary" className={`text-xs ${levelConfig.color}`}>
                          {permission.label}: {levelConfig.label}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(role)}
                    disabled={role.isSystem}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    수정
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openApplyModal(role)} className="flex-1">
                    <Users className="h-4 w-4 mr-1" />
                    적용
                  </Button>
                  {!role.isSystem && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRole(role.id)}
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 수정 모달 */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>역할 수정</DialogTitle>
            <DialogDescription>역할 정보와 권한을 수정합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">역할 이름</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="역할 이름을 입력하세요"
              />
            </div>
            <div>
              <label className="text-sm font-medium">설명</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="역할에 대한 설명을 입력하세요"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">권한 설정</label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {PERMISSIONS.map((permission) => (
                  <div key={permission.key} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{permission.label}</span>
                    <Select
                      value={String(formData.permissions[permission.key] || 0)}
                      onValueChange={(value) => updatePermission(permission.key, Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(PERMISSION_LEVELS).map(([level, config]) => (
                          <SelectItem key={level} value={level}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdateRole} disabled={actionLoading}>
              {actionLoading ? <LoadingSpinner /> : "수정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 역할 적용 모달 */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>역할 적용</DialogTitle>
            <DialogDescription>선택한 역할을 특정 지파에 적용합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>역할을 적용하면 해당 지파의 기존 권한 설정이 덮어씌워집니다.</AlertDescription>
            </Alert>
            <div>
              <label className="text-sm font-medium">적용할 지파</label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="지파를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch.code} value={branch.name}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRole && (
              <div>
                <p className="text-sm font-medium mb-2">적용될 권한</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(selectedRole.permissions).map(([key, level]) => {
                    const permission = PERMISSIONS.find((p) => p.key === key)
                    const levelConfig = PERMISSION_LEVELS[level as keyof typeof PERMISSION_LEVELS]
                    if (!permission || level === 0) return null
                    return (
                      <Badge key={key} variant="secondary" className={`text-xs ${levelConfig.color}`}>
                        {permission.label}: {levelConfig.label}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              취소
            </Button>
            <Button onClick={handleApplyRole} disabled={actionLoading || !selectedBranch}>
              {actionLoading ? <LoadingSpinner /> : "적용"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
