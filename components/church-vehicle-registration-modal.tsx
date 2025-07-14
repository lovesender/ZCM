"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { addChurchVehicle } from "@/app/actions/church-vehicle-actions"

// 교회 지파 목록
const BRANCHES = [
  "요한",
  "베드로",
  "부산야고보",
  "안드레",
  "다대오",
  "빌립",
  "시몬",
  "바돌로매",
  "마태",
  "맛디아",
  "서울야고보",
  "도마",
]

// 관리부서 목록
const DEPARTMENTS = [
  "총무부",
  "교육부",
  "선교부",
  "찬양부",
  "청년부",
  "장년부",
  "유년부",
  "사회봉사부",
  "기획부",
  "재정부",
]

// 차량 제조사 목록
const CAR_BRANDS = [
  "현대",
  "기아",
  "제네시스",
  "쌍용",
  "르노삼성",
  "토요타",
  "혼다",
  "닛산",
  "BMW",
  "벤츠",
  "아우디",
  "폭스바겐",
  "기타",
]

// 연료 타입
const FUEL_TYPES = ["가솔린", "디젤", "하이브리드", "전기", "LPG"]

interface ChurchVehicleRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (vehicle: any) => void
}

export default function ChurchVehicleRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
}: ChurchVehicleRegistrationModalProps) {
  const [formData, setFormData] = useState({
    plateNumber: "",
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    fuelType: "",
    branch: "",
    department: "",
    manager: "",
    mileage: "",
    insuranceExpiry: "",
    notes: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // 폼 데이터 업데이트
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // 에러 메시지 초기화
    if (error) setError("")
  }

  // 폼 유효성 검사
  const validateForm = () => {
    if (!formData.plateNumber.trim()) {
      setError("차량번호를 입력해주세요.")
      return false
    }

    if (!formData.brand) {
      setError("제조사를 선택해주세요.")
      return false
    }

    if (!formData.model.trim()) {
      setError("모델명을 입력해주세요.")
      return false
    }

    if (!formData.fuelType) {
      setError("연료타입을 선택해주세요.")
      return false
    }

    if (!formData.branch) {
      setError("지파를 선택해주세요.")
      return false
    }

    if (!formData.department) {
      setError("관리부서를 선택해주세요.")
      return false
    }

    if (!formData.manager.trim()) {
      setError("담당자를 입력해주세요.")
      return false
    }

    if (!formData.mileage || isNaN(Number(formData.mileage))) {
      setError("올바른 주행거리를 입력해주세요.")
      return false
    }

    if (formData.year < 1990 || formData.year > new Date().getFullYear()) {
      setError("올바른 연식을 입력해주세요.")
      return false
    }

    // 차량번호 형식 검증 (간단한 한국 차량번호 패턴)
    const platePattern = /^[0-9]{2,3}[가-힣][0-9]{4}$|^[가-힣][0-9]{2}[가-힣][0-9]{4}$/
    if (!platePattern.test(formData.plateNumber.replace(/\s/g, ""))) {
      setError("올바른 차량번호 형식을 입력해주세요. (예: 12가1234)")
      return false
    }

    return true
  }

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const vehicleData = {
        ...formData,
        mileage: Number(formData.mileage),
        status: "운행중" as const,
        lastInspection: new Date().toISOString().split("T")[0], // 오늘 날짜
        registrationDate: new Date().toISOString().split("T")[0], // 오늘 날짜
        vehicleType: "church" as const,
      }

      const result = await addChurchVehicle(vehicleData)

      if (result.success) {
        setSuccess("교회 차량이 성공적으로 등록되었습니다!")

        // 성공 콜백 호출
        onSuccess(result.vehicle)

        // 폼 초기화
        setTimeout(() => {
          resetForm()
          onClose()
        }, 1500)
      } else {
        setError(result.message || "차량 등록 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error("차량 등록 오류:", error)
      setError("차량 등록 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      plateNumber: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      fuelType: "",
      branch: "",
      department: "",
      manager: "",
      mileage: "",
      insuranceExpiry: "",
      notes: "",
    })
    setError("")
    setSuccess("")
  }

  // 모달 닫기
  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">교회 차량 등록</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 성공 메시지 */}
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 차량번호 */}
            <div className="space-y-2">
              <Label htmlFor="plateNumber" className="text-sm font-medium">
                차량번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plateNumber"
                value={formData.plateNumber}
                onChange={(e) => handleInputChange("plateNumber", e.target.value)}
                placeholder="예: 12가1234"
                disabled={isLoading}
              />
            </div>

            {/* 제조사 */}
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-medium">
                제조사 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.brand}
                onValueChange={(value) => handleInputChange("brand", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="제조사 선택" />
                </SelectTrigger>
                <SelectContent>
                  {CAR_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 모델명 */}
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium">
                모델명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange("model", e.target.value)}
                placeholder="예: 소나타, 아반떼"
                disabled={isLoading}
              />
            </div>

            {/* 연식 */}
            <div className="space-y-2">
              <Label htmlFor="year" className="text-sm font-medium">
                연식 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="year"
                type="number"
                min="1990"
                max={new Date().getFullYear()}
                value={formData.year}
                onChange={(e) => handleInputChange("year", Number(e.target.value))}
                disabled={isLoading}
              />
            </div>

            {/* 연료타입 */}
            <div className="space-y-2">
              <Label htmlFor="fuelType" className="text-sm font-medium">
                연료타입 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.fuelType}
                onValueChange={(value) => handleInputChange("fuelType", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="연료타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((fuel) => (
                    <SelectItem key={fuel} value={fuel}>
                      {fuel}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 지파 */}
            <div className="space-y-2">
              <Label htmlFor="branch" className="text-sm font-medium">
                지파 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => handleInputChange("branch", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
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

            {/* 관리부서 */}
            <div className="space-y-2">
              <Label htmlFor="department" className="text-sm font-medium">
                관리부서 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleInputChange("department", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 담당자 */}
            <div className="space-y-2">
              <Label htmlFor="manager" className="text-sm font-medium">
                담당자 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => handleInputChange("manager", e.target.value)}
                placeholder="담당자 이름"
                disabled={isLoading}
              />
            </div>

            {/* 주행거리 */}
            <div className="space-y-2">
              <Label htmlFor="mileage" className="text-sm font-medium">
                주행거리 (km) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="mileage"
                type="number"
                min="0"
                value={formData.mileage}
                onChange={(e) => handleInputChange("mileage", e.target.value)}
                placeholder="0"
                disabled={isLoading}
              />
            </div>

            {/* 보험만료일 */}
            <div className="space-y-2">
              <Label htmlFor="insuranceExpiry" className="text-sm font-medium">
                보험만료일
              </Label>
              <Input
                id="insuranceExpiry"
                type="date"
                value={formData.insuranceExpiry}
                onChange={(e) => handleInputChange("insuranceExpiry", e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 비고 */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              비고
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="추가 정보나 특이사항을 입력하세요"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                "등록하기"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
