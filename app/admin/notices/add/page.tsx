"use client"

import type React from "react"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Save, X, Calendar } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AddNoticePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const [noticeData, setNoticeData] = useState({
    title: "",
    content: "",
    category: "",
    priority: "일반",
    status: "초안",
    publishDate: "",
    publishTime: "",
    expireDate: "",
    expireTime: "",
  })

  // 공지사항 카테고리 목록
  const categories = ["시스템", "일정", "안전", "관리", "절차", "기타"]

  // 공지사항 추가
  const handleAddNotice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setFormErrors([])
    setFormSuccess(null)

    try {
      // 입력값 검증
      const errors = []
      if (!noticeData.title.trim()) errors.push("제목을 입력해주세요.")
      if (!noticeData.content.trim()) errors.push("내용을 입력해주세요.")
      if (!noticeData.category) errors.push("카테고리를 선택해주세요.")

      // 게시 일정 검증
      if (noticeData.status === "예약됨" && !noticeData.publishDate) {
        errors.push("예약 게시의 경우 게시 시작일을 설정해주세요.")
      }

      if (errors.length > 0) {
        setFormErrors(errors)
        setIsSubmitting(false)
        return
      }

      // 실제 구현에서는 서버 API 호출
      await new Promise((resolve) => setTimeout(resolve, 2000)) // 시뮬레이션

      // 폼 초기화
      setNoticeData({
        title: "",
        content: "",
        category: "",
        priority: "일반",
        status: "초안",
        publishDate: "",
        publishTime: "",
        expireDate: "",
        expireTime: "",
      })

      setFormSuccess("공지사항이 성공적으로 추가되었습니다.")
    } catch (error) {
      setFormErrors(["공지사항 추가 중 오류가 발생했습니다."])
    } finally {
      setIsSubmitting(false)
    }
  }

  // 브레드크럼 데이터 수정
  const breadcrumbs = [
    { label: "홈", href: "/" },
    { label: "공지 관리", href: "/admin/notices" },
    { label: "공지 추가" },
  ]

  return (
    <PageLayout title="공지 추가" description="새로운 공지사항을 작성합니다" breadcrumbs={breadcrumbs}>
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

          <form onSubmit={handleAddNotice} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium">
                  제목
                </label>
                <Input
                  id="title"
                  value={noticeData.title}
                  onChange={(e) => setNoticeData({ ...noticeData, title: e.target.value })}
                  placeholder="공지사항 제목을 입력하세요"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium">
                    카테고리
                  </label>
                  <Select
                    value={noticeData.category}
                    onValueChange={(value) => setNoticeData({ ...noticeData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="priority" className="block text-sm font-medium">
                    우선순위
                  </label>
                  <Select
                    value={noticeData.priority}
                    onValueChange={(value) => setNoticeData({ ...noticeData, priority: value })}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="우선순위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="일반">일반</SelectItem>
                      <SelectItem value="중요">중요</SelectItem>
                      <SelectItem value="긴급">긴급</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="block text-sm font-medium">
                    상태
                  </label>
                  <Select
                    value={noticeData.status}
                    onValueChange={(value) => setNoticeData({ ...noticeData, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="초안">초안</SelectItem>
                      <SelectItem value="게시중">즉시 게시</SelectItem>
                      <SelectItem value="예약됨">예약 게시</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium">
                  내용
                </label>
                <Textarea
                  id="content"
                  value={noticeData.content}
                  onChange={(e) => setNoticeData({ ...noticeData, content: e.target.value })}
                  placeholder="공지사항 내용을 입력하세요"
                  className="min-h-[200px]"
                  required
                />
              </div>
            </div>

            <Tabs defaultValue="schedule" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="schedule">게시 일정</TabsTrigger>
                <TabsTrigger value="preview">미리보기</TabsTrigger>
              </TabsList>
              <TabsContent value="schedule" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      게시 시작
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="publishDate" className="block text-xs text-gray-500">
                          날짜
                        </label>
                        <Input
                          type="date"
                          id="publishDate"
                          value={noticeData.publishDate}
                          onChange={(e) => setNoticeData({ ...noticeData, publishDate: e.target.value })}
                          disabled={noticeData.status !== "예약됨"}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      게시 종료
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="expireDate" className="block text-xs text-gray-500">
                          날짜
                        </label>
                        <Input
                          type="date"
                          id="expireDate"
                          value={noticeData.expireDate}
                          onChange={(e) => setNoticeData({ ...noticeData, expireDate: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="expireTime" className="block text-xs text-gray-500">
                          시간
                        </label>
                        <Input
                          type="time"
                          id="expireTime"
                          value={noticeData.expireTime}
                          onChange={(e) => setNoticeData({ ...noticeData, expireTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="preview">미리보기 내용</TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost">
                <X className="w-4 h-4 mr-2" />
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
