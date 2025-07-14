"use client"

import type React from "react"

import { useState } from "react"
import { createNotice, updateNotice, type Notice } from "@/app/actions/notice-actions"

interface NoticeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editNotice?: Notice | null
}

export default function NoticeModal({ isOpen, onClose, onSuccess, editNotice }: NoticeModalProps) {
  const [formData, setFormData] = useState({
    title: editNotice?.title || "",
    content: editNotice?.content || "",
    category: editNotice?.category || "일반",
    isImportant: editNotice?.isImportant || false,
    isPinned: editNotice?.isPinned || false,
    status: editNotice?.status || "게시",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    if (!formData.title.trim() || !formData.content.trim()) {
      alert("제목과 내용을 모두 입력해주세요.")
      return
    }

    setIsSubmitting(true)
    try {
      const noticeData = {
        ...formData,
        author: "관리자", // 실제로는 로그인한 사용자 정보 사용
      }

      let result
      if (editNotice) {
        result = await updateNotice(editNotice.id, noticeData)
      } else {
        result = await createNotice(noticeData as any)
      }

      if (result.success) {
        alert(result.message)
        onSuccess()
        onClose()
        // 폼 초기화
        setFormData({
          title: "",
          content: "",
          category: "일반",
          isImportant: false,
          isPinned: false,
          status: "게시",
        })
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("공지사항 저장 오류:", error)
      alert("공지사항 저장 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{editNotice ? "공지사항 수정" : "새 공지사항 작성"}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              {showPreview ? "편집" : "미리보기"}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* 편집 영역 */}
          <div className={`${showPreview ? "w-1/2" : "w-full"} p-6 overflow-y-auto border-r`}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="공지사항 제목을 입력하세요"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="일반">일반</option>
                    <option value="중요">중요</option>
                    <option value="긴급">긴급</option>
                    <option value="시스템">시스템</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="게시">게시</option>
                    <option value="임시저장">임시저장</option>
                    <option value="숨김">숨김</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isImportant"
                    checked={formData.isImportant}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">중요 공지</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPinned"
                    checked={formData.isPinned}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">상단 고정</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="공지사항 내용을 입력하세요"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? "저장 중..." : editNotice ? "수정" : "작성"}
                </button>
              </div>
            </form>
          </div>

          {/* 미리보기 영역 */}
          {showPreview && (
            <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold">{formData.title || "제목 없음"}</h3>
                  {formData.isImportant && (
                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">중요</span>
                  )}
                  {formData.isPinned && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">고정</span>
                  )}
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      formData.category === "긴급"
                        ? "bg-red-100 text-red-800"
                        : formData.category === "중요"
                          ? "bg-orange-100 text-orange-800"
                          : formData.category === "시스템"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {formData.category}
                  </span>
                </div>
                <div className="text-gray-600 whitespace-pre-wrap">{formData.content || "내용 없음"}</div>
                <div className="mt-4 pt-4 border-t text-sm text-gray-500">작성자: 관리자 | 상태: {formData.status}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
