"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { getNotices, deleteNotice, type Notice } from "@/app/actions/notice-actions"
import NoticeModal from "./notice-modal"

interface NoticeListModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NoticeListModal({ isOpen, onClose }: NoticeListModalProps) {
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    search: "",
  })
  const [showNoticeModal, setShowNoticeModal] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)

  // 공지사항 목록 로드
  const loadNotices = async () => {
    setLoading(true)
    try {
      const result = await getNotices({
        ...filters,
        category: filters.category === "all" ? undefined : filters.category,
        status: filters.status === "all" ? undefined : filters.status,
        search: filters.search || undefined,
        page: currentPage,
        limit: 10,
      })

      setNotices(result.notices)
      setTotalPages(result.totalPages)
    } catch (error) {
      console.error("공지사항 로드 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadNotices()
    }
  }, [isOpen, currentPage, filters])

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadNotices()
  }

  // 필터 변경 핸들러
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  // 공지사항 삭제
  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 공지사항을 삭제하시겠습니까?")) return

    try {
      const result = await deleteNotice(id)
      if (result.success) {
        alert(result.message)
        loadNotices()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("공지사항 삭제 오류:", error)
      alert("공지사항 삭제 중 오류가 발생했습니다.")
    }
  }

  // 공지사항 수정
  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setShowNoticeModal(true)
  }

  // 새 공지사항 작성
  const handleCreate = () => {
    setEditingNotice(null)
    setShowNoticeModal(true)
  }

  // 모달 성공 핸들러
  const handleNoticeModalSuccess = () => {
    loadNotices()
    setShowNoticeModal(false)
    setEditingNotice(null)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">공지사항 관리</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                새 공지사항
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* 검색 및 필터 */}
            <div className="mb-6 space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="제목 또는 내용으로 검색..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  검색
                </button>
              </form>

              <div className="flex gap-4">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 카테고리</option>
                  <option value="일반">일반</option>
                  <option value="중요">중요</option>
                  <option value="긴급">긴급</option>
                  <option value="시스템">시스템</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 상태</option>
                  <option value="게시">게시</option>
                  <option value="임시저장">임시저장</option>
                  <option value="숨김">숨김</option>
                </select>
              </div>
            </div>

            {/* 공지사항 목록 */}
            <div className="overflow-y-auto max-h-[50vh]">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">공지사항을 불러오는 중...</p>
                </div>
              ) : notices.length > 0 ? (
                <div className="space-y-3">
                  {notices.map((notice) => (
                    <div key={notice.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900">{notice.title}</h3>
                            {notice.isPinned && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">고정</span>
                            )}
                            {notice.isImportant && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">중요</span>
                            )}
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                notice.category === "긴급"
                                  ? "bg-red-100 text-red-800"
                                  : notice.category === "중요"
                                    ? "bg-orange-100 text-orange-800"
                                    : notice.category === "시스템"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {notice.category}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                notice.status === "게시"
                                  ? "bg-green-100 text-green-800"
                                  : notice.status === "임시저장"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {notice.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{notice.content}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>작성자: {notice.author}</span>
                            <span>작성일: {new Date(notice.createdAt).toLocaleDateString()}</span>
                            <span>조회: {notice.viewCount}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(notice)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(notice.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">공지사항이 없습니다.</p>
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 공지사항 작성/수정 모달 */}
      <NoticeModal
        isOpen={showNoticeModal}
        onClose={() => {
          setShowNoticeModal(false)
          setEditingNotice(null)
        }}
        onSuccess={handleNoticeModalSuccess}
        editNotice={editingNotice}
      />
    </>
  )
}
