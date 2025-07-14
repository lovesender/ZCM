"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Search, Star, StarOff, Trash2, Eye, Clock, Tag, Download, Heart, Filter } from "lucide-react"
import {
  getTemplates,
  toggleTemplateFavorite,
  deleteTemplate,
  incrementTemplateUsage,
  type BulkEditTemplate,
} from "@/app/actions/template-actions"

interface TemplateListModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyTemplate: (template: BulkEditTemplate) => void
}

export default function TemplateListModal({ isOpen, onClose, onApplyTemplate }: TemplateListModalProps) {
  const [templates, setTemplates] = useState<BulkEditTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<BulkEditTemplate | null>(null)

  // 템플릿 목록 로드
  const loadTemplates = async () => {
    setLoading(true)
    try {
      const result = await getTemplates({
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        search: searchTerm || undefined,
        onlyFavorites: showOnlyFavorites,
      })
      setTemplates(result)
    } catch (error) {
      console.error("템플릿 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  // 필터 변경 시 템플릿 재로드
  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen, searchTerm, selectedCategory, showOnlyFavorites])

  // 즐겨찾기 토글
  const handleToggleFavorite = async (id: number, currentFavorite: boolean) => {
    try {
      const result = await toggleTemplateFavorite(id, !currentFavorite)
      if (result.success) {
        setTemplates((prev) =>
          prev.map((template) => (template.id === id ? { ...template, isFavorite: !currentFavorite } : template)),
        )
      }
    } catch (error) {
      console.error("즐겨찾기 토글 오류:", error)
    }
  }

  // 템플릿 삭제
  const handleDeleteTemplate = async (id: number, name: string) => {
    const confirmed = window.confirm(`"${name}" 템플릿을 삭제하시겠습니까?`)
    if (!confirmed) return

    try {
      const result = await deleteTemplate(id)
      if (result.success) {
        setTemplates((prev) => prev.filter((template) => template.id !== id))
      }
    } catch (error) {
      console.error("템플릿 삭제 오류:", error)
    }
  }

  // 템플릿 적용
  const handleApplyTemplate = async (template: BulkEditTemplate) => {
    try {
      // 사용 횟수 증가
      await incrementTemplateUsage(template.id)

      // 템플릿 적용
      onApplyTemplate(template)
      onClose()
    } catch (error) {
      console.error("템플릿 적용 오류:", error)
    }
  }

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

  // 카테고리별 색상
  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      "지파 관리": "bg-blue100 text-blue700",
      "교회 관리": "bg-green100 text-green700",
      "부서 관리": "bg-purple100 text-purple700",
      "상태 관리": "bg-orange100 text-orange700",
      "일반 관리": "bg-grey100 text-grey700",
      기타: "bg-grey100 text-grey700",
    }
    return colorMap[category] || "bg-grey100 text-grey700"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="card w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">템플릿 목록</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-contentCaption" />
              <Input
                placeholder="템플릿 이름, 설명, 태그로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="select w-[150px]">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                <SelectItem value="지파 관리">지파 관리</SelectItem>
                <SelectItem value="교회 관리">교회 관리</SelectItem>
                <SelectItem value="부서 관리">부서 관리</SelectItem>
                <SelectItem value="상태 관리">상태 관리</SelectItem>
                <SelectItem value="일반 관리">일반 관리</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showOnlyFavorites ? "default" : "outline"}
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={showOnlyFavorites ? "btn-primary" : "btn-tertiary"}
            >
              <Heart className="h-4 w-4 mr-2" />
              즐겨찾기만
            </Button>
          </div>

          {/* 템플릿 목록 */}
          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-contentSub">템플릿을 불러오는 중...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <Filter className="h-12 w-12 text-contentCaption mx-auto mb-4" />
                <p className="text-contentSub">검색 조건에 맞는 템플릿이 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="border border-borderOutline hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-contentMain">{template.name}</h3>
                            {template.isFavorite && <Star className="h-4 w-4 text-yellow500 fill-current" />}
                          </div>
                          <Badge className={getCategoryColor(template.category)}>{template.category}</Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(template.id, template.isFavorite)}
                            className="p-1 h-8 w-8"
                          >
                            {template.isFavorite ? (
                              <Star className="h-4 w-4 text-yellow500 fill-current" />
                            ) : (
                              <StarOff className="h-4 w-4 text-contentCaption" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTemplate(template)}
                            className="p-1 h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id, template.name)}
                            className="p-1 h-8 w-8 text-red500 hover:text-red700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-contentSub text-sm">{template.description}</p>

                      {/* 수정할 필드 */}
                      <div>
                        <span className="text-xs text-contentCaption">수정할 필드:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.keys(template.fieldsToUpdate)
                            .filter((field) => template.fieldsToUpdate[field])
                            .map((field) => (
                              <Badge key={field} className="bg-blue100 text-blue700 text-xs">
                                {getFieldLabel(field)}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      {/* 태그 */}
                      {template.tags.length > 0 && (
                        <div>
                          <span className="text-xs text-contentCaption">태그:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.tags.map((tag) => (
                              <Badge key={tag} className="bg-grey100 text-grey700 text-xs">
                                <Tag className="h-2 w-2 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 사용 통계 */}
                      <div className="flex items-center justify-between text-xs text-contentCaption">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>사용 {template.usageCount}회</span>
                        </div>
                        <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                      </div>

                      {/* 적용 버튼 */}
                      <Button
                        onClick={() => handleApplyTemplate(template)}
                        className="btn-primary w-full h-9"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        템플릿 적용
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 템플릿 상세보기 모달 */}
      {selectedTemplate && (
        <TemplateDetailModal template={selectedTemplate} onClose={() => setSelectedTemplate(null)} />
      )}
    </div>
  )
}

// 템플릿 상세보기 모달 컴포넌트
function TemplateDetailModal({ template, onClose }: { template: BulkEditTemplate; onClose: () => void }) {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <Card className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">템플릿 상세 정보</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {template.name}
                {template.isFavorite && <Star className="h-5 w-5 text-yellow500 fill-current" />}
              </h3>
              <p className="text-contentSub mt-1">{template.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-contentCaption">카테고리</span>
                <p className="font-medium">{template.category}</p>
              </div>
              <div>
                <span className="text-sm text-contentCaption">사용 횟수</span>
                <p className="font-medium">{template.usageCount}회</p>
              </div>
              <div>
                <span className="text-sm text-contentCaption">생성일</span>
                <p className="font-medium">{new Date(template.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-contentCaption">생성자</span>
                <p className="font-medium">{template.createdBy}</p>
              </div>
            </div>
          </div>

          {/* 수정 설정 */}
          <div className="space-y-4">
            <h4 className="font-semibold">수정 설정</h4>
            <div className="bg-bgSecondary p-4 rounded-lg">
              {Object.keys(template.fieldsToUpdate)
                .filter((field) => template.fieldsToUpdate[field])
                .map((field) => (
                  <div
                    key={field}
                    className="flex justify-between items-center py-2 border-b border-borderOutline last:border-b-0"
                  >
                    <span className="font-medium">{getFieldLabel(field)}</span>
                    <span className="text-blue600">{template.updates[field] || "설정되지 않음"}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* 태그 */}
          {template.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">태그</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} className="bg-grey100 text-grey700">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={onClose} className="btn-secondary">
              닫기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
