"use client"

import type React from "react"
import { useState, memo, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Users, Phone, MapPin } from "lucide-react"
import { bulkEditVehicles } from "@/app/actions/bulk-edit-actions"
import BulkEditResultModal from "./bulk-edit-result-modal"
import { BRANCHES } from "@/app/config/branches"

// 부서 목록 정의
const DEPARTMENTS = [
  "총무부",
  "행정서무부",
  "내무부",
  "자문회",
  "장년회",
  "부녀회",
  "청년회",
  "학생회",
  "유년회",
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
]

// 지역 목록 정의 (수정됨)
const REGIONS = ["본부", "광산", "북구", "담양", "장성"]

const bulkEditSchema = z.object({
  branch: z.string().optional(),
  church: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  reason: z.string().min(1, { message: "수정 사유를 입력해주세요" }),
})

type BulkEditValues = z.infer<typeof bulkEditSchema>

interface Vehicle {
  id: number
  name: string
  phone: string
  carNumber: string
  carModel: string
  branch: string
  church: string
  department: string
  status: string
  registeredAt: string
  address?: string
  notes?: string
}

interface BulkEditComponentProps {
  vehicles: Vehicle[]
}

// Memoize the vehicle row to prevent unnecessary re-renders
const MemoizedVehicleRow = memo(
  ({
    vehicle,
    isSelected,
    onSelect,
    getStatusBadge,
    onViewDetails,
  }: {
    vehicle: Vehicle
    isSelected: boolean
    onSelect: (id: number, checked: boolean) => void
    getStatusBadge: (status: string) => React.ReactNode
    onViewDetails: (id: number) => void
  }) => (
    <TableRow key={vehicle.id} className={isSelected ? "bg-blue-50" : ""}>
      <TableCell className="w-12">
        <Checkbox checked={isSelected} onCheckedChange={(checked) => onSelect(vehicle.id, checked as boolean)} />
      </TableCell>
      <TableCell className="font-medium min-w-[100px]">{vehicle.name}</TableCell>
      <TableCell className="min-w-[120px]">{vehicle.carNumber}</TableCell>
      <TableCell className="min-w-[120px]">{vehicle.carModel}</TableCell>
      <TableCell className="min-w-[100px]">{vehicle.branch}</TableCell>
      <TableCell className="min-w-[120px]">{vehicle.church}</TableCell>
      <TableCell className="min-w-[100px]">{vehicle.department}</TableCell>
      <TableCell className="min-w-[120px]">{getStatusBadge(vehicle.status)}</TableCell>
      <TableCell className="min-w-[100px]">
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(vehicle.id)}>
          상세보기
        </Button>
      </TableCell>
    </TableRow>
  ),
)
MemoizedVehicleRow.displayName = "MemoizedVehicleRow"

export default function BulkEditComponent({ vehicles }: BulkEditComponentProps) {
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterBranch, setFilterBranch] = useState("all")
  const [filterRegion, setFilterRegion] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [bulkEditResult, setBulkEditResult] = useState<any>(null)
  const [fieldsToUpdate, setFieldsToUpdate] = useState<Record<string, boolean>>({})
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<BulkEditValues>({
    resolver: zodResolver(bulkEditSchema),
  })

  // Memoize filtered vehicles to prevent unnecessary recalculations
  const filteredVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) => {
        const matchesSearch =
          vehicle.name.includes(searchTerm) ||
          vehicle.carNumber.includes(searchTerm) ||
          vehicle.phone?.includes(searchTerm) ||
          vehicle.carModel.includes(searchTerm)
        const matchesStatus = filterStatus === "all" || vehicle.status === filterStatus
        const matchesBranch = filterBranch === "all" || vehicle.branch === filterBranch
        const matchesRegion = filterRegion === "all" || vehicle.church === filterRegion
        const matchesDepartment = filterDepartment === "all" || vehicle.department === filterDepartment

        return matchesSearch && matchesStatus && matchesBranch && matchesRegion && matchesDepartment
      }),
    [vehicles, searchTerm, filterStatus, filterBranch, filterRegion, filterDepartment],
  )

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVehicles(filteredVehicles.map((v) => v.id))
    } else {
      setSelectedVehicles([])
    }
  }

  // 개별 차량 선택/해제
  const handleSelectVehicle = (vehicleId: number, checked: boolean) => {
    if (checked) {
      setSelectedVehicles((prev) => [...prev, vehicleId])
    } else {
      setSelectedVehicles((prev) => prev.filter((id) => id !== vehicleId))
    }
  }

  // 차량 상세 정보 보기
  const handleViewDetails = (vehicleId: number) => {
    setSelectedVehicleId(vehicleId)
    setShowDetailModal(true)
  }

  // 수정할 필드 선택/해제
  const handleFieldToggle = (field: string, checked: boolean) => {
    setFieldsToUpdate((prev) => ({
      ...prev,
      [field]: checked,
    }))

    // 필드가 비활성화되면 값도 초기화
    if (!checked) {
      setValue(field as keyof BulkEditValues, "")
    }
  }

  // 일괄 수정 실행
  const onSubmit = async (data: BulkEditValues) => {
    if (selectedVehicles.length === 0) {
      alert("수정할 차량을 선택해주세요.")
      return
    }

    const activeFields = Object.keys(fieldsToUpdate).filter((field) => fieldsToUpdate[field])
    if (activeFields.length === 0) {
      alert("수정할 필드를 선택해주세요.")
      return
    }

    const selectedVehicleNames = vehicles
      .filter((v) => selectedVehicles.includes(v.id))
      .map((v) => v.name)
      .join(", ")

    const confirmed = window.confirm(
      `선택된 성도님들의 차량 정보를 수정하시겠습니까?\n\n대상: ${selectedVehicleNames}\n수정될 필드: ${activeFields.join(", ")}`,
    )

    if (!confirmed) return

    setIsSubmitting(true)

    try {
      // 활성화된 필드의 값만 추출
      const updates: any = {}
      activeFields.forEach((field) => {
        const value = data[field as keyof BulkEditValues]
        if (value) {
          updates[field] = value
        }
      })

      const result = await bulkEditVehicles({
        vehicleIds: selectedVehicles,
        updates,
        reason: data.reason,
        editedBy: "관리자", // 실제 구현에서는 로그인된 사용자 정보
      })

      setBulkEditResult(result)
      setShowResult(true)

      // 성공한 경우 폼 초기화
      if (result.success) {
        setSelectedVehicles([])
        setFieldsToUpdate({})
        reset()
      }
    } catch (error) {
      console.error("일괄 수정 오류:", error)
      alert("일괄 수정 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "완료":
        return <Badge className="bg-green-500 text-white">승인 완료</Badge>
      case "대기":
        return <Badge className="bg-orange-500 text-white">검토 중</Badge>
      case "거부":
        return <Badge className="bg-red-500 text-white">승인 거부</Badge>
      default:
        return <Badge className="bg-gray-500 text-white">알 수 없음</Badge>
    }
  }

  const isAllSelected = filteredVehicles.length > 0 && selectedVehicles.length === filteredVehicles.length
  const isPartiallySelected = selectedVehicles.length > 0 && selectedVehicles.length < filteredVehicles.length

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="flex flex-col gap-4">
        {/* 첫 번째 줄: 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="성명, 차량번호, 연락처로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 두 번째 줄: 필터들 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="완료">완료</SelectItem>
              <SelectItem value="대기">대기</SelectItem>
              <SelectItem value="거부">거부</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBranch} onValueChange={setFilterBranch}>
            <SelectTrigger>
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

          <Select value={filterRegion} onValueChange={setFilterRegion}>
            <SelectTrigger>
              <SelectValue placeholder="지역 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 지역</SelectItem>
              {REGIONS.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterDepartment} onValueChange={setFilterDepartment}>
            <SelectTrigger>
              <SelectValue placeholder="부서 선택" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="all">전체 부서</SelectItem>
              {DEPARTMENTS.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 선택된 차량 정보 */}
      {selectedVehicles.length > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <Users className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-800">선택된 성도 차량</AlertTitle>
          <AlertDescription className="text-blue-700">
            총 {selectedVehicles.length}개 차량이 선택되었습니다. 아래에서 수정할 정보를 입력해주세요.
          </AlertDescription>
        </Alert>
      )}

      {/* 차량 목록 테이블 */}
      <div className="w-full overflow-x-auto border border-gray-200 rounded-lg">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 sticky left-0 bg-white z-10">
                  <Checkbox
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = isPartiallySelected
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="min-w-[100px]">성명</TableHead>
                <TableHead className="min-w-[120px]">차량번호</TableHead>
                <TableHead className="min-w-[120px]">차종</TableHead>
                <TableHead className="min-w-[100px]">지파</TableHead>
                <TableHead className="min-w-[120px]">교회/지역</TableHead>
                <TableHead className="min-w-[100px]">부서</TableHead>
                <TableHead className="min-w-[120px]">상태</TableHead>
                <TableHead className="min-w-[100px]">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <MemoizedVehicleRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  isSelected={selectedVehicles.includes(vehicle.id)}
                  onSelect={handleSelectVehicle}
                  getStatusBadge={getStatusBadge}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredVehicles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">검색 조건에 맞는 차량이 없습니다.</p>
          </div>
        )}
      </div>

      {/* 선택된 차량이 있을 때만 수정 폼 표시 */}
      {selectedVehicles.length > 0 && (
        <>
          <Separator />

          {/* 일괄 수정 폼 */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">선택된 성도 차량 정보 수정</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 지파 */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="branch-field"
                      checked={fieldsToUpdate.branch || false}
                      onCheckedChange={(checked) => handleFieldToggle("branch", checked as boolean)}
                    />
                    <Label htmlFor="branch-field" className="font-medium">
                      지파
                    </Label>
                  </div>
                  <Select
                    disabled={!fieldsToUpdate.branch}
                    onValueChange={(value) => setValue("branch", value)}
                    value={watch("branch") || ""}
                  >
                    <SelectTrigger className={`${!fieldsToUpdate.branch ? "opacity-50" : ""}`}>
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

                {/* 교회/지역 */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="church-field"
                      checked={fieldsToUpdate.church || false}
                      onCheckedChange={(checked) => handleFieldToggle("church", checked as boolean)}
                    />
                    <Label htmlFor="church-field" className="font-medium">
                      교회/지역
                    </Label>
                  </div>
                  <Select
                    disabled={!fieldsToUpdate.church}
                    onValueChange={(value) => setValue("church", value)}
                    value={watch("church") || ""}
                  >
                    <SelectTrigger className={`${!fieldsToUpdate.church ? "opacity-50" : ""}`}>
                      <SelectValue placeholder="지역 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 부서 */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="department-field"
                      checked={fieldsToUpdate.department || false}
                      onCheckedChange={(checked) => handleFieldToggle("department", checked as boolean)}
                    />
                    <Label htmlFor="department-field" className="font-medium">
                      부서
                    </Label>
                  </div>
                  <Select
                    disabled={!fieldsToUpdate.department}
                    onValueChange={(value) => setValue("department", value)}
                    value={watch("department") || ""}
                  >
                    <SelectTrigger className={`${!fieldsToUpdate.department ? "opacity-50" : ""}`}>
                      <SelectValue placeholder="부서 선택" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                      {DEPARTMENTS.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 연락처 */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="phone-field"
                      checked={fieldsToUpdate.phone || false}
                      onCheckedChange={(checked) => handleFieldToggle("phone", checked as boolean)}
                    />
                    <Label htmlFor="phone-field" className="font-medium">
                      연락처
                    </Label>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="010-0000-0000"
                      disabled={!fieldsToUpdate.phone}
                      className={`pl-10 ${!fieldsToUpdate.phone ? "opacity-50" : ""}`}
                      {...register("phone")}
                    />
                  </div>
                </div>

                {/* 주소 */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="address-field"
                      checked={fieldsToUpdate.address || false}
                      onCheckedChange={(checked) => handleFieldToggle("address", checked as boolean)}
                    />
                    <Label htmlFor="address-field" className="font-medium">
                      주소
                    </Label>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="주소 입력"
                      disabled={!fieldsToUpdate.address}
                      className={`pl-10 ${!fieldsToUpdate.address ? "opacity-50" : ""}`}
                      {...register("address")}
                    />
                  </div>
                </div>

                {/* 상태 */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="status-field"
                      checked={fieldsToUpdate.status || false}
                      onCheckedChange={(checked) => handleFieldToggle("status", checked as boolean)}
                    />
                    <Label htmlFor="status-field" className="font-medium">
                      상태
                    </Label>
                  </div>
                  <Select
                    disabled={!fieldsToUpdate.status}
                    onValueChange={(value) => setValue("status", value)}
                    value={watch("status") || ""}
                  >
                    <SelectTrigger className={`${!fieldsToUpdate.status ? "opacity-50" : ""}`}>
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="완료">승인 완료</SelectItem>
                      <SelectItem value="대기">검토 중</SelectItem>
                      <SelectItem value="거부">승인 거부</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 메모 */}
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="notes-field"
                      checked={fieldsToUpdate.notes || false}
                      onCheckedChange={(checked) => handleFieldToggle("notes", checked as boolean)}
                    />
                    <Label htmlFor="notes-field" className="font-medium">
                      메모
                    </Label>
                  </div>
                  <Textarea
                    placeholder="차량에 대한 메모를 입력하세요"
                    disabled={!fieldsToUpdate.notes}
                    className={`min-h-[80px] ${!fieldsToUpdate.notes ? "opacity-50" : ""}`}
                    {...register("notes")}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* 수정 사유 */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                수정 사유 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="성도 차량 정보를 수정하는 이유를 입력해주세요"
                className={`min-h-[80px] ${errors.reason ? "border-red-500" : ""}`}
                {...register("reason")}
              />
              {errors.reason && <p className="text-red-500 text-xs">{errors.reason.message}</p>}
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-center pt-4">
              <Button
                type="submit"
                className="w-full md:w-1/2 h-12 bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isSubmitting ? "수정 중..." : `선택된 ${selectedVehicles.length}개 차량 정보 수정`}
              </Button>
            </div>
          </form>
        </>
      )}

      {/* 차량이 선택되지 않았을 때 안내 메시지 */}
      {selectedVehicles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">성도 차량을 선택해주세요</h3>
          <p className="text-gray-500">
            위 목록에서 수정하고자 하는 성도 차량을 체크하시면
            <br />
            해당 차량들의 정보를 일괄로 수정할 수 있습니다.
          </p>
        </div>
      )}

      {/* 결과 모달 */}
      {showResult && bulkEditResult && (
        <BulkEditResultModal result={bulkEditResult} onClose={() => setShowResult(false)} />
      )}

      {/* 차량 상세 정보 모달 */}
      {showDetailModal && selectedVehicleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">성도 차량 상세 정보</h3>
            <div className="space-y-4">
              {vehicles
                .filter((v) => v.id === selectedVehicleId)
                .map((vehicle) => (
                  <div key={vehicle.id} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-500">성명</Label>
                        <div className="font-medium">{vehicle.name}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500">연락처</Label>
                        <div className="font-medium">{vehicle.phone || "-"}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500">차량번호</Label>
                        <div className="font-medium">{vehicle.carNumber}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500">차종</Label>
                        <div className="font-medium">{vehicle.carModel}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500">지파</Label>
                        <div className="font-medium">{vehicle.branch}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500">교회/지역</Label>
                        <div className="font-medium">{vehicle.church}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500">부서</Label>
                        <div className="font-medium">{vehicle.department}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500">상태</Label>
                        <div>{getStatusBadge(vehicle.status)}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500">등록일</Label>
                        <div className="font-medium">{vehicle.registeredAt}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-gray-500">주소</Label>
                        <div className="font-medium">{vehicle.address || "-"}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-500">메모</Label>
                      <div className="p-3 bg-gray-50 rounded-md min-h-[80px]">
                        {vehicle.notes || "등록된 메모가 없습니다."}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                닫기
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false)
                  // 개별 차량을 선택하여 수정 폼으로 이동
                  if (selectedVehicleId) {
                    setSelectedVehicles([selectedVehicleId])
                  }
                }}
              >
                이 차량 수정하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
