"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { registerVehicle } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { ChevronLeft, ChevronRight, User, Car, FileText, Check } from "lucide-react"
import { useOffline } from "@/hooks/use-offline"
import { saveOfflineRegistration, getOfflineRegistrations } from "@/lib/offline-storage"
import { WifiOff, Cloud } from "lucide-react"
import { BRANCHES } from "@/app/config/branches"
import PhotoUpload from "@/components/photo-upload"

// 지역 목록
const regions = ["본부", "광산", "북구", "담양", "장성"]

// 부서 목록
const departments = [
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
  "건설부",
  "감사부",
  "체육부",
  "사업부",
  "보건후생복지부",
  "봉사교통부",
  "외교정책부",
]

const steps = [
  { id: 1, title: "소유자 정보", icon: User, description: "개인정보를 입력해주세요" },
  { id: 2, title: "차량 정보", icon: Car, description: "차량 상세정보를 입력해주세요" },
  { id: 3, title: "약관 동의", icon: FileText, description: "이용약관에 동의해주세요" },
]

export default function RegisterForm() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const [formData, setFormData] = useState({
    ownerName: "",
    phoneNumber: "",
    telegramId: "",
    branch: BRANCHES[0],
    region: regions[0],
    department: departments[0],
    vehicleType: "승용차",
    plateNumber: "",
    model: "",
    year: new Date().getFullYear(),
    color: "",
    purpose: "",
    agreeTerms: false,
    photos: [] as File[], // 추가
  })

  const { isOnline, isOffline } = useOffline()
  const [offlineRegistrations, setOfflineRegistrations] = useState<any[]>([])
  const [telegramIdError, setTelegramIdError] = useState<string | null>(null)

  // 연락처 자동 하이픈 포맷팅 함수 수정
  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, "")

    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }
  }

  // 연락처 유효성 검사 함수 수정
  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^010-\d{4}-\d{4}$/
    return phoneRegex.test(phoneNumber)
  }

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    loadOfflineRegistrations()
  }, [])

  const loadOfflineRegistrations = async () => {
    try {
      const registrations = await getOfflineRegistrations()
      setOfflineRegistrations(registrations)
    } catch (error) {
      console.error("오프라인 데이터 로드 실패:", error)
    }
  }

  const validateTelegramId = (telegramId: string): boolean => {
    if (!telegramId.trim()) return true
    const cleanId = telegramId.startsWith("@") ? telegramId.slice(1) : telegramId
    const telegramRegex = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/
    if (!telegramRegex.test(cleanId)) return false
    if (cleanId.endsWith("_")) return false
    return true
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // 연락처 필드인 경우 자동 포맷팅 적용
    if (name === "phoneNumber") {
      const formattedValue = formatPhoneNumber(value)
      setFormData((prev) => ({ ...prev, [name]: formattedValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }

    setError(null)

    if (name === "telegramId") {
      if (value && !validateTelegramId(value)) {
        setTelegramIdError("5-32자, 영문자로 시작, 영문자/숫자/언더스코어만 사용 가능")
      } else {
        setTelegramIdError(null)
      }
    }
  }

  const handleRadioChange = (value: string, name: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 체크박스 변경 핸들러 - 명시적으로 boolean 타입 처리
  const handleCheckboxChange = (checked: boolean | string) => {
    // 명시적으로 boolean 타입으로 변환
    const isChecked = checked === true || checked === "true"
    setFormData((prev) => ({ ...prev, agreeTerms: isChecked }))
    setError(null)
  }

  // 컨테이너 클릭 핸들러
  const handleContainerClick = (e: React.MouseEvent) => {
    // 체크박스 직접 클릭은 제외
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
      return
    }

    // 체크박스 상태 토글
    const newValue = !formData.agreeTerms
    setFormData((prev) => ({ ...prev, agreeTerms: newValue }))
    setError(null)
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.ownerName.trim()) {
          setError("이름을 입력해주세요.")
          return false
        }
        if (!formData.phoneNumber.trim()) {
          setError("연락처를 입력해주세요.")
          return false
        }
        if (formData.phoneNumber && !validatePhoneNumber(formData.phoneNumber)) {
          setError("연락처 형식이 올바르지 않습니다. (010-0000-0000)")
          return false
        }
        if (formData.telegramId && !validateTelegramId(formData.telegramId)) {
          setError("텔레그램 ID 형식이 올바르지 않습니다.")
          return false
        }
        break
      case 2:
        if (!formData.plateNumber.trim()) {
          setError("차량 번호를 입력해주세요.")
          return false
        }
        if (!formData.model.trim()) {
          setError("차량 모델을 입력해주세요.")
          return false
        }
        break
      case 3:
        if (!formData.agreeTerms) {
          setError("이용약관에 동의해주세요.")
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
      setError(null)
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setError(null)
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep(3)) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (isOnline) {
        const result = await registerVehicle(formData)

        if (result.success) {
          setSuccess(result.message)
          setTimeout(() => {
            router.push("/")
          }, 3000)
        } else {
          setError("등록에 실패했습니다. 다시 시도해주세요.")
        }
      } else {
        await saveOfflineRegistration(formData)
        setSuccess("오프라인 상태입니다. 데이터가 로컬에 저장되었으며, 온라인 연결 시 자동으로 동기화됩니다.")

        if ("serviceWorker" in navigator && "sync" in window.ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready
          await registration.sync.register("vehicle-registration")
        }

        setTimeout(() => {
          router.push("/")
        }, 3000)
      }
    } catch (err) {
      if (isOffline) {
        setError("오프라인 저장에 실패했습니다. 브라우저 저장소를 확인해주세요.")
      } else {
        setError(err instanceof Error ? err.message : "등록 중 오류가 발생했습니다.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  const handlePlateNumberDetected = (plateNumber: string) => {
    setFormData((prev) => ({ ...prev, plateNumber }))
    setError(null)
    // 성공 메시지 표시
    setSuccess(`번호판이 자동으로 인식되었습니다: ${plateNumber}`)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handlePhotoChange = (photos: File[]) => {
    setFormData((prev) => ({ ...prev, photos }))
    console.log(`${photos.length}개의 사진이 업로드되었습니다.`)
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* 진행률 표시 */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            단계 {currentStep} / {steps.length}
          </span>
          <span>{Math.round(progress)}% 완료</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* 오프라인 상태 표시 */}
      {isOffline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            현재 오프라인 상태입니다. 입력한 데이터는 로컬에 저장되며, 온라인 연결 시 자동으로 동기화됩니다.
          </AlertDescription>
        </Alert>
      )}

      {/* 오프라인 등록 데이터 표시 */}
      {offlineRegistrations.length > 0 && (
        <Alert>
          <Cloud className="h-4 w-4" />
          <AlertDescription>동기화 대기 중인 등록 데이터가 {offlineRegistrations.length}개 있습니다.</AlertDescription>
        </Alert>
      )}

      {/* 단계 네비게이션 */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id

          return (
            <div key={step.id} className="flex flex-col items-center space-y-2 flex-1">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white"
                    : isCompleted
                      ? "bg-green-600 border-green-600 text-white"
                      : "border-gray-300 text-gray-400"
                }
              `}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <div className="text-center">
                <div
                  className={`text-xs font-medium ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"}`}
                >
                  {step.title}
                </div>
                {isMobile && isActive && <div className="text-xs text-gray-500 mt-1">{step.description}</div>}
              </div>
              {index < steps.length - 1 && (
                <div className={`hidden md:block w-full h-0.5 ${isCompleted ? "bg-green-600" : "bg-gray-300"}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* 에러/성공 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* 폼 내용 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {React.createElement(steps[currentStep - 1].icon, { className: "w-5 h-5" })}
            <span>{steps[currentStep - 1].title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 1단계: 소유자 정보 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">이름 *</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="성명을 입력해주세요"
                  className="h-12 text-base"
                  autoComplete="name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">연락처 *</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                  className="h-12 text-base"
                  autoComplete="tel"
                  maxLength={13} // 010-0000-0000 형식의 최대 길이
                  required
                />
                <p className="text-xs text-gray-500">숫자를 입력하면 자동으로 하이픈이 추가됩니다.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegramId">텔레그램 ID</Label>
                <Input
                  id="telegramId"
                  name="telegramId"
                  type="text"
                  value={formData.telegramId}
                  onChange={handleChange}
                  placeholder="@username 또는 username (5-32자)"
                  className={`h-12 text-base ${telegramIdError ? "border-red-500" : ""}`}
                  autoComplete="username"
                />
                {telegramIdError && <p className="text-sm text-red-500 mt-1">{telegramIdError}</p>}
                <p className="text-xs text-gray-500">
                  • 5-32자 길이
                  <br />• 영문자로 시작
                  <br />• 영문자, 숫자, 언더스코어(_)만 사용
                  <br />• 언더스코어로 끝날 수 없음
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">소속 지파 *</Label>
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base border rounded-md bg-white"
                    required
                  >
                    {BRANCHES.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">소속 지역 *</Label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base border rounded-md bg-white"
                    required
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">소속 부서 *</Label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full h-12 p-3 text-base border rounded-md bg-white"
                    required
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 2단계: 차량 정보 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* 사진 업로드 섹션 추가 */}
              <PhotoUpload
                onPlateNumberDetected={handlePlateNumberDetected}
                onPhotoChange={handlePhotoChange}
                maxFiles={3}
                isMobile={isMobile}
              />

              <div className="space-y-3">
                <Label>차량 유형 *</Label>
                <RadioGroup
                  defaultValue={formData.vehicleType}
                  onValueChange={(value) => handleRadioChange(value, "vehicleType")}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {["승용차", "SUV", "승합차", "화물차", "기타"].map((type) => (
                    <div key={type} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={type} id={type} />
                      <Label htmlFor={type} className="flex-1 cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plateNumber">차량 번호 *</Label>
                  <Input
                    id="plateNumber"
                    name="plateNumber"
                    value={formData.plateNumber}
                    onChange={handleChange}
                    placeholder="00가 0000"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">차량 모델 *</Label>
                  <Input
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="예: 소나타, 아반떼"
                    className="h-12 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">연식</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    inputMode="numeric"
                    value={formData.year}
                    onChange={handleChange}
                    min={1990}
                    max={new Date().getFullYear() + 1}
                    className="h-12 text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">색상</Label>
                  <Input
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="예: 흰색, 검정"
                    className="h-12 text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">사용 목적</Label>
                <Textarea
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="차량 사용 목적을 간략히 적어주세요."
                  rows={4}
                  className="text-base resize-none"
                />
              </div>
            </div>
          )}

          {/* 3단계: 약관 동의 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">개인정보 수집 및 이용 약관</h4>
                <div className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
                  <p>1. 수집하는 개인정보 항목: 이름, 연락처, 이메일, 소속 정보, 차량 정보</p>
                  <p>2. 개인정보 수집 및 이용 목적: 차량 등록 및 관리, 연락 및 공지사항 전달</p>
                  <p>3. 개인정보 보유 및 이용 기간: 차량 등록 해제 시까지</p>
                  <p>4. 개인정보 제공 거부 권리: 개인정보 제공을 거부할 수 있으나, 서비스 이용이 제한될 수 있습니다.</p>
                </div>
              </div>

              <div
                className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors select-none"
                onClick={handleContainerClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    setFormData((prev) => ({ ...prev, agreeTerms: !prev.agreeTerms }))
                    setError(null)
                  }
                }}
                aria-pressed={formData.agreeTerms}
              >
                <div className="flex-shrink-0 mt-1">
                  <Checkbox
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true
                      setFormData((prev) => ({ ...prev, agreeTerms: isChecked }))
                      setError(null)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="agreeTerms" className="text-base font-medium cursor-pointer">
                    개인정보 수집 및 이용에 동의합니다. *
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    위 약관을 읽고 이해했으며, 개인정보 수집 및 이용에 동의합니다.
                  </p>
                </div>
              </div>

              {/* 입력 정보 요약 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-blue-800">입력 정보 확인</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">이름:</span>
                    <span className="font-medium">{formData.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">연락처:</span>
                    <span className="font-medium">{formData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">소속:</span>
                    <span className="font-medium">
                      {formData.branch} {formData.region} {formData.department}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">차량:</span>
                    <span className="font-medium">
                      {formData.plateNumber} ({formData.model})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 네비게이션 버튼 */}
      <div className="flex justify-between space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex-1 h-12 text-base"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          이전
        </Button>

        {currentStep < steps.length ? (
          <Button type="button" onClick={nextStep} className="flex-1 h-12 text-base">
            다음
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.agreeTerms}
            className="flex-1 h-12 text-base"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner className="mr-2" />
                등록 중...
              </>
            ) : (
              "차량 등록 완료"
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
