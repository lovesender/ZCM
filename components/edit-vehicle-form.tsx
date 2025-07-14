"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2, AlertCircle, ArrowLeft, Save } from "lucide-react"
import { updateVehicle } from "@/app/actions/vehicle-actions"
import { saveEditHistory } from "@/app/actions/history-actions"

const formSchema = z.object({
  name: z.string().min(2, { message: "성명은 2자 이상이어야 합니다" }),
  phone: z
    .string()
    .min(10, { message: "올바른 연락처를 입력해주세요" })
    .regex(/^[0-9-]+$/, { message: "숫자와 하이픈(-)만 입력 가능합니다" }),
  carNumber: z
    .string()
    .min(7, { message: "올바른 차량번호를 입력해주세요" })
    .regex(/^[0-9가-힣]{2,3}[0-9]{4}$/, { message: "올바른 차량번호 형식이 아닙니다" }),
  carModel: z.string().min(1, { message: "차종을 입력해주세요" }),
  branch: z.string().min(1, { message: "지파를 선택해주세요" }),
  church: z.string().min(1, { message: "교회/지역을 입력해주세요" }),
  department: z.string().min(1, { message: "부서를 선택해주세요" }),
  carType: z.enum(["sedan", "suv", "van"], { message: "차량 유형을 선택해주세요" }),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "이용약관에 동의해주세요" }),
  }),
  editReason: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Vehicle {
  id: number
  name: string
  phone: string
  carNumber: string
  carModel: string
  carType: string
  branch: string
  church: string
  department: string
  status: string
  registeredAt: string
  approvedAt: string | null
  notes: string
}

interface EditVehicleFormProps {
  vehicle: Vehicle
}

// 연락처 자동 하이픈 포맷팅 함수 추가
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

export default function EditVehicleForm({ vehicle }: EditVehicleFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  // 차량 유형 매핑
  const getCarTypeValue = (carType: string) => {
    switch (carType) {
      case "승용차":
        return "sedan"
      case "SUV":
        return "suv"
      case "승합차":
        return "van"
      default:
        return "sedan"
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: vehicle.name,
      phone: vehicle.phone,
      carNumber: vehicle.carNumber,
      carModel: vehicle.carModel,
      branch: vehicle.branch,
      church: vehicle.church,
      department: vehicle.department,
      carType: getCarTypeValue(vehicle.carType),
      agreeTerms: true,
      editReason: "",
    },
  })

  // handleChange 함수 수정
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // 연락처 필드인 경우 자동 포맷팅 적용
    if (name === "phone") {
      const formattedValue = formatPhoneNumber(value)
      setValue("phone", formattedValue)
    } else {
      setValue(name as any, value)
    }
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // 원본 데이터 저장 (수정 이력용)
      const originalData = {
        name: vehicle.name,
        phone: vehicle.phone,
        carNumber: vehicle.carNumber,
        carModel: vehicle.carModel,
        branch: vehicle.branch,
        church: vehicle.church,
        department: vehicle.department,
        carType: vehicle.carType,
      }

      // 차량 정보 업데이트
      const result = await updateVehicle(vehicle.id, data)

      if (result.success) {
        // 수정 이력 저장
        await saveEditHistory(
          vehicle.id,
          originalData,
          {
            name: data.name,
            phone: data.phone,
            carNumber: data.carNumber,
            carModel: data.carModel,
            branch: data.branch,
            church: data.church,
            department: data.department,
            carType: data.carType === "sedan" ? "승용차" : data.carType === "suv" ? "SUV" : "승합차",
          },
          data.editReason || "정보 수정",
        )

        setSubmitStatus("success")
        // 2초 후 조회 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/my-vehicles")
        }, 2000)
      } else {
        throw new Error(result.message || "차량 정보 수정에 실패했습니다")
      }
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "차량 정보 수정 중 오류가 발생했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm("수정 중인 내용이 있습니다. 정말 취소하시겠습니까?")
      if (!confirmed) return
    }
    router.push("/my-vehicles")
  }

  // 변경된 필드 개수 계산
  const changedFieldsCount = Object.keys(dirtyFields).filter(
    (key) => key !== "agreeTerms" && key !== "editReason",
  ).length

  return (
    <div className="space-y-6">
      {/* 현재 차량 정보 표시 */}
      <div className="bg-blue50 p-4 rounded-lg border border-blue200">
        <h3 className="font-semibold text-blue800 mb-2">현재 등록된 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-blue600">차량번호:</span> <span className="font-medium">{vehicle.carNumber}</span>
          </div>
          <div>
            <span className="text-blue600">차종:</span> <span className="font-medium">{vehicle.carModel}</span>
          </div>
          <div>
            <span className="text-blue600">신청자:</span> <span className="font-medium">{vehicle.name}</span>
          </div>
          <div>
            <span className="text-blue600">상태:</span> <span className="font-medium text-orange600">승인 대기 중</span>
          </div>
        </div>
      </div>

      {submitStatus === "success" && (
        <Alert className="bg-green50 border-green500 text-green700">
          <CheckCircle2 className="h-4 w-4 text-green500" />
          <AlertTitle>수정 완료</AlertTitle>
          <AlertDescription>차량 정보가 성공적으로 수정되었습니다. 잠시 후 조회 페이지로 이동합니다.</AlertDescription>
        </Alert>
      )}

      {submitStatus === "error" && (
        <Alert className="bg-red50 border-red500 text-red700">
          <AlertCircle className="h-4 w-4 text-red500" />
          <AlertTitle>수정 실패</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">개인 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                성명 <span className="text-red500">*</span>
              </Label>
              <Input id="name" className={`input ${errors.name ? "border-red500" : ""}`} {...register("name")} />
              {errors.name && <p className="text-red500 text-xs">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                연락처 <span className="text-red500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="010-0000-0000"
                className={`input ${errors.phone ? "border-red500" : ""}`}
                {...register("phone", {
                  onChange: handleChange,
                })}
              />
              {errors.phone && <p className="text-red500 text-xs">{errors.phone.message}</p>}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">차량 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="carNumber">
                차량번호 <span className="text-red500">*</span>
              </Label>
              <Input
                id="carNumber"
                placeholder="12가3456"
                className={`input ${errors.carNumber ? "border-red500" : ""}`}
                {...register("carNumber")}
              />
              {errors.carNumber && <p className="text-red500 text-xs">{errors.carNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="carModel">
                차종 <span className="text-red500">*</span>
              </Label>
              <Input
                id="carModel"
                placeholder="예) 소나타, 아반떼"
                className={`input ${errors.carModel ? "border-red500" : ""}`}
                {...register("carModel")}
              />
              {errors.carModel && <p className="text-red500 text-xs">{errors.carModel.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              차량 유형 <span className="text-red500">*</span>
            </Label>
            <RadioGroup
              value={watch("carType")}
              className="flex flex-wrap gap-4"
              onValueChange={(value) => setValue("carType", value as "sedan" | "suv" | "van")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sedan" id="sedan" />
                <Label htmlFor="sedan">승용차</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="suv" id="suv" />
                <Label htmlFor="suv">SUV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="van" id="van" />
                <Label htmlFor="van">승합차</Label>
              </div>
            </RadioGroup>
            {errors.carType && <p className="text-red500 text-xs">{errors.carType.message}</p>}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">소속 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="branch">
                지파 <span className="text-red500">*</span>
              </Label>
              <Select value={watch("branch")} onValueChange={(value) => setValue("branch", value)}>
                <SelectTrigger className={`select ${errors.branch ? "border-red500" : ""}`}>
                  <SelectValue placeholder="지파 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="서울지파">서울지파</SelectItem>
                  <SelectItem value="경기지파">경기지파</SelectItem>
                  <SelectItem value="인천지파">인천지파</SelectItem>
                  <SelectItem value="강원지파">강원지파</SelectItem>
                  <SelectItem value="충청지파">충청지파</SelectItem>
                  <SelectItem value="전라지파">전라지파</SelectItem>
                  <SelectItem value="경상지파">경상지파</SelectItem>
                  <SelectItem value="제주지파">제주지파</SelectItem>
                </SelectContent>
              </Select>
              {errors.branch && <p className="text-red500 text-xs">{errors.branch.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="church">
                교회/지역 <span className="text-red500">*</span>
              </Label>
              <Input
                id="church"
                placeholder="예) 본교회, 강남교회"
                className={`input ${errors.church ? "border-red500" : ""}`}
                {...register("church")}
              />
              {errors.church && <p className="text-red500 text-xs">{errors.church.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">
                부서 <span className="text-red500">*</span>
              </Label>
              <Select value={watch("department")} onValueChange={(value) => setValue("department", value)}>
                <SelectTrigger className={`select ${errors.department ? "border-red500" : ""}`}>
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="장년부">장년부</SelectItem>
                  <SelectItem value="청년부">청년부</SelectItem>
                  <SelectItem value="여전도회">여전도회</SelectItem>
                  <SelectItem value="남전도회">남전도회</SelectItem>
                  <SelectItem value="학생회">학생회</SelectItem>
                  <SelectItem value="주일학교">주일학교</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
              {errors.department && <p className="text-red500 text-xs">{errors.department.message}</p>}
            </div>
          </div>
        </div>

        <Separator />

        {/* 수정 사유 입력 필드 추가 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">수정 사유</h3>
          <div className="space-y-2">
            <Label htmlFor="editReason">
              수정 사유 <span className="text-contentCaption">(선택사항)</span>
            </Label>
            <Textarea
              id="editReason"
              placeholder="정보를 수정하는 이유를 간략히 입력해주세요."
              className="input min-h-[80px]"
              {...register("editReason")}
            />
            <p className="text-contentCaption text-xs">
              수정 사유를 입력하면 관리자가 변경 내용을 검토할 때 도움이 됩니다.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="agreeTerms"
              checked={watch("agreeTerms")}
              onCheckedChange={(checked) => setValue("agreeTerms", checked === true)}
            />
            <Label htmlFor="agreeTerms" className="text-sm">
              개인정보 수집 및 이용에 동의합니다. <span className="text-red500">*</span>
            </Label>
          </div>
          {errors.agreeTerms && <p className="text-red500 text-xs">{errors.agreeTerms.message}</p>}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="btn-tertiary w-full sm:w-1/3 h-12"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            취소
          </Button>
          <Button type="submit" className="btn-primary w-full sm:w-1/3 h-12" disabled={isSubmitting || !isDirty}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "수정 중..." : "수정 완료"}
          </Button>
        </div>

        {!isDirty && (
          <p className="text-center text-contentCaption text-sm">
            변경된 내용이 없습니다. 정보를 수정한 후 저장해주세요.
          </p>
        )}

        {isDirty && changedFieldsCount > 0 && (
          <p className="text-center text-blue600 text-sm">{changedFieldsCount}개 항목이 변경되었습니다.</p>
        )}
      </form>
    </div>
  )
}
