"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { X, Save, Star, Tag } from "lucide-react"
import { saveTemplate } from "@/app/actions/template-actions"

const templateSchema = z.object({
  name: z
    .string()
    .min(1, { message: "템플릿 이름을 입력해주세요" })
    .max(50, { message: "이름은 50자 이하여야 합니다" }),
  description: z
    .string()
    .min(1, { message: "템플릿 설명을 입력해주세요" })
    .max(200, { message: "설명은 200자 이하여야 합니다" }),
  category: z.string().min(1, { message: "카테고리를 선택해주세요" }),
  tags: z.string().optional(),
  isFavorite: z.boolean().default(false),
})

type TemplateFormValues = z.infer<typeof templateSchema>

interface TemplateSaveModalProps {
  isOpen: boolean
  onClose: () => void
  fieldsToUpdate: Record<string, boolean>
  updates: Record<string, any>
  onSaveSuccess: () => void
}

export default function TemplateSaveModal({
  isOpen,
  onClose,
  fieldsToUpdate,
  updates,
  onSaveSuccess,
}: TemplateSaveModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      tags: "",
      isFavorite: false,
    },
  })

  const onSubmit = async (data: TemplateFormValues) => {
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // 태그 문자열을 배열로 변환
      const tags = data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : []

      const result = await saveTemplate({
        name: data.name,
        description: data.description,
        category: data.category,
        fieldsToUpdate,
        updates,
        createdBy: "관리자", // 실제 구현에서는 로그인된 사용자 정보
        isFavorite: data.isFavorite,
        tags,
      })

      if (result.success) {
        setSubmitStatus("success")
        onSaveSuccess()
        // 2초 후 모달 닫기
        setTimeout(() => {
          onClose()
          reset()
          setSubmitStatus("idle")
        }, 2000)
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "템플릿 저장 중 오류가 발생했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      reset()
      setSubmitStatus("idle")
    }
  }

  // 활성화된 필드 목록
  const activeFields = Object.keys(fieldsToUpdate).filter((field) => fieldsToUpdate[field])

  // 필드명을 한글로 변환
  const getFieldLabel = (field: string) => {
    const fieldMap: Record<string, string> = {
      branch: "지파",
      church: "교회/지역",
      department: "부서",
      status: "상태",
      notes: "메모",
    }
    return fieldMap[field] || field
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">템플릿 저장</CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={isSubmitting}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {submitStatus === "success" && (
            <Alert className="bg-green50 border-green200">
              <Save className="h-4 w-4 text-green500" />
              <AlertTitle className="text-green800">저장 완료</AlertTitle>
              <AlertDescription className="text-green700">
                템플릿이 성공적으로 저장되었습니다. 잠시 후 모달이 닫힙니다.
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === "error" && (
            <Alert className="bg-red50 border-red200">
              <X className="h-4 w-4 text-red500" />
              <AlertTitle className="text-red800">저장 실패</AlertTitle>
              <AlertDescription className="text-red700">{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* 현재 설정 미리보기 */}
          <div className="bg-blue50 p-4 rounded-lg border border-blue200">
            <h3 className="font-semibold text-blue800 mb-3">저장될 설정 미리보기</h3>
            <div className="space-y-2">
              <div>
                <span className="text-blue600 text-sm">수정할 필드:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {activeFields.map((field) => (
                    <Badge key={field} className="bg-blue100 text-blue700">
                      {getFieldLabel(field)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-blue600 text-sm">설정값:</span>
                <div className="mt-1 space-y-1">
                  {activeFields.map((field) => (
                    <div key={field} className="text-sm">
                      <span className="font-medium">{getFieldLabel(field)}:</span>{" "}
                      <span className="text-blue800">{updates[field] || "설정되지 않음"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 템플릿 이름 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                템플릿 이름 <span className="text-red500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="예) 서울지파 → 경기지파 이전"
                className={`input ${errors.name ? "border-red500" : ""}`}
                {...register("name")}
              />
              {errors.name && <p className="text-red500 text-xs">{errors.name.message}</p>}
            </div>

            {/* 템플릿 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">
                템플릿 설명 <span className="text-red500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="이 템플릿이 언제, 어떤 상황에서 사용되는지 설명해주세요"
                className={`input min-h-[80px] ${errors.description ? "border-red500" : ""}`}
                {...register("description")}
              />
              {errors.description && <p className="text-red500 text-xs">{errors.description.message}</p>}
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label htmlFor="category">
                카테고리 <span className="text-red500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("category", value)} value={watch("category") || ""}>
                <SelectTrigger className={`select ${errors.category ? "border-red500" : ""}`}>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="지파 관리">지파 관리</SelectItem>
                  <SelectItem value="교회 관리">교회 관리</SelectItem>
                  <SelectItem value="부서 관리">부서 관리</SelectItem>
                  <SelectItem value="상태 관리">상태 관리</SelectItem>
                  <SelectItem value="일반 관리">일반 관리</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red500 text-xs">{errors.category.message}</p>}
            </div>

            {/* 태그 */}
            <div className="space-y-2">
              <Label htmlFor="tags">
                태그 <span className="text-contentCaption">(선택사항)</span>
              </Label>
              <Input
                id="tags"
                placeholder="태그를 쉼표로 구분하여 입력 (예: 지파, 이전, 소속변경)"
                className="input"
                {...register("tags")}
              />
              <p className="text-contentCaption text-xs">
                <Tag className="h-3 w-3 inline mr-1" />
                태그를 사용하면 나중에 템플릿을 쉽게 찾을 수 있습니다
              </p>
            </div>

            {/* 즐겨찾기 */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFavorite"
                checked={watch("isFavorite")}
                onCheckedChange={(checked) => setValue("isFavorite", checked as boolean)}
              />
              <Label htmlFor="isFavorite" className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow500" />
                즐겨찾기에 추가
              </Label>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="btn-tertiary"
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting} className="btn-primary">
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "저장 중..." : "템플릿 저장"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
