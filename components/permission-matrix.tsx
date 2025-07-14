"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { BRANCHES } from "@/app/config/branches"
import {
  type BranchPermissions,
  PermissionLevel,
  PERMISSION_LABELS,
  PERMISSION_COLORS,
  SYSTEM_PERMISSIONS,
  getPermissionCategories,
  getPermissionsByCategory,
} from "@/app/config/permissions"
import { Save, Filter, RotateCcw, CheckCircle, XCircle } from "lucide-react"

interface PermissionMatrixProps {
  initialPermissions: BranchPermissions
  onSave: (permissions: BranchPermissions) => Promise<boolean>
}

export function PermissionMatrix({ initialPermissions, onSave }: PermissionMatrixProps) {
  const [permissions, setPermissions] = useState<BranchPermissions>(initialPermissions)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isSaving, setIsSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)

  const categories = getPermissionCategories()

  // 필터링된 권한 목록
  const filteredPermissions = useMemo(() => {
    if (selectedCategory === "all") {
      return SYSTEM_PERMISSIONS
    }
    return getPermissionsByCategory(selectedCategory)
  }, [selectedCategory])

  // 권한 변경 핸들러
  const handlePermissionChange = (branchName: string, permissionId: string, level: PermissionLevel) => {
    setPermissions((prev) => ({
      ...prev,
      [branchName]: {
        ...prev[branchName],
        [permissionId]: level,
      },
    }))
    setSaveResult(null)
  }

  // 지파별 일괄 권한 설정
  const setBranchPermissions = (branchName: string, level: PermissionLevel) => {
    setPermissions((prev) => {
      const newBranchPermissions = { ...prev[branchName] }
      filteredPermissions.forEach((permission) => {
        newBranchPermissions[permission.id] = level
      })
      return {
        ...prev,
        [branchName]: newBranchPermissions,
      }
    })
    setSaveResult(null)
  }

  // 기능별 일괄 권한 설정
  const setPermissionForAllBranches = (permissionId: string, level: PermissionLevel) => {
    setPermissions((prev) => {
      const newPermissions = { ...prev }
      BRANCHES.forEach((branch) => {
        if (!newPermissions[branch]) {
          newPermissions[branch] = {}
        }
        newPermissions[branch][permissionId] = level
      })
      return newPermissions
    })
    setSaveResult(null)
  }

  // 권한 저장
  const handleSave = async () => {
    setIsSaving(true)
    setSaveResult(null)

    try {
      const success = await onSave(permissions)
      setSaveResult({
        success,
        message: success ? "권한이 성공적으로 저장되었습니다." : "권한 저장에 실패했습니다.",
      })
    } catch (error) {
      setSaveResult({
        success: false,
        message: "권한 저장 중 오류가 발생했습니다.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 초기화
  const handleReset = () => {
    setPermissions(initialPermissions)
    setSaveResult(null)
  }

  // 권한 수준 배지 렌더링
  const renderPermissionBadge = (level: PermissionLevel) => {
    return <Badge className={`${PERMISSION_COLORS[level]} text-xs`}>{PERMISSION_LABELS[level]}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* 컨트롤 영역 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="기능 영역 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기능</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            <RotateCcw className="w-4 h-4 mr-2" />
            초기화
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                권한 저장
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 저장 결과 알림 */}
      {saveResult && (
        <Alert className={saveResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {saveResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={saveResult.success ? "text-green-800" : "text-red-800"}>
            {saveResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* 권한 매트릭스 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>권한 매트릭스</CardTitle>
          <CardDescription>
            {selectedCategory === "all"
              ? "전체 기능에 대한 지파별 권한을 설정합니다"
              : `${selectedCategory} 기능에 대한 지파별 권한을 설정합니다`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">기능</TableHead>
                  {BRANCHES.map((branch) => (
                    <TableHead key={branch} className="text-center min-w-[120px]">
                      <div className="space-y-2">
                        <div className="font-medium">{branch}</div>
                        <Select
                          value=""
                          onValueChange={(value) => setBranchPermissions(branch, Number(value) as PermissionLevel)}
                        >
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="일괄 설정" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PERMISSION_LABELS).map(([level, label]) => (
                              <SelectItem key={level} value={level}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center min-w-[120px]">
                    <div className="space-y-2">
                      <div className="font-medium">일괄 설정</div>
                      <div className="text-xs text-gray-500">모든 지파</div>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPermissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-gray-500">{permission.description}</div>
                      </div>
                    </TableCell>
                    {BRANCHES.map((branch) => {
                      const currentLevel = permissions[branch]?.[permission.id] || PermissionLevel.NONE
                      return (
                        <TableCell key={branch} className="text-center">
                          <Select
                            value={currentLevel.toString()}
                            onValueChange={(value) =>
                              handlePermissionChange(branch, permission.id, Number(value) as PermissionLevel)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue>{renderPermissionBadge(currentLevel)}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PERMISSION_LABELS).map(([level, label]) => (
                                <SelectItem key={level} value={level}>
                                  <div className="flex items-center gap-2">
                                    {renderPermissionBadge(Number(level) as PermissionLevel)}
                                    <span>{label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      )
                    })}
                    <TableCell className="text-center">
                      <Select
                        value=""
                        onValueChange={(value) =>
                          setPermissionForAllBranches(permission.id, Number(value) as PermissionLevel)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="일괄 설정" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PERMISSION_LABELS).map(([level, label]) => (
                            <SelectItem key={level} value={level}>
                              <div className="flex items-center gap-2">
                                {renderPermissionBadge(Number(level) as PermissionLevel)}
                                <span>{label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 권한 수준 설명 */}
      <Card>
        <CardHeader>
          <CardTitle>권한 수준 설명</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {Object.entries(PERMISSION_LABELS).map(([level, label]) => (
              <div key={level} className="flex items-center gap-2">
                {renderPermissionBadge(Number(level) as PermissionLevel)}
                <div className="text-sm">
                  <div className="font-medium">{label}</div>
                  <div className="text-gray-500 text-xs">
                    {Number(level) === PermissionLevel.NONE && "기능에 접근할 수 없음"}
                    {Number(level) === PermissionLevel.READ && "조회만 가능"}
                    {Number(level) === PermissionLevel.WRITE && "조회 및 수정 가능"}
                    {Number(level) === PermissionLevel.MANAGE && "관리 기능 포함"}
                    {Number(level) === PermissionLevel.ADMIN && "모든 권한"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
