"use client"

import { useEffect } from "react"
import Link from "next/link"

interface MobileMenuPanelProps {
  onClose: () => void
}

export default function MobileMenuPanel({ onClose }: MobileMenuPanelProps) {
  // 메뉴가 열려있을 때 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50">
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        role="button"
        tabIndex={0}
        aria-label="메뉴 닫기"
        onKeyDown={(e) => {
          if (e.key === "Escape" || e.key === "Enter") {
            onClose()
          }
        }}
      ></div>

      {/* 메뉴 패널 */}
      <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform">
        <div className="flex flex-col h-full">
          {/* 메뉴 헤더 */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">차</span>
              </div>
              <span className="text-lg font-bold text-gray-900">차량 원</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              aria-label="메뉴 닫기"
              type="button"
            >
              <div className="w-6 h-6 flex items-center justify-center relative">
                <span className="block w-4 h-0.5 bg-current rotate-45 absolute"></span>
                <span className="block w-4 h-0.5 bg-current -rotate-45 absolute"></span>
              </div>
            </button>
          </div>

          {/* 메뉴 항목들 */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              href="/"
              onClick={onClose}
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">홈</span>
                </div>
                <span>홈</span>
              </div>
            </Link>

            <Link
              href="/register"
              onClick={onClose}
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">등</span>
                </div>
                <span>차량 등록</span>
              </div>
            </Link>

            <Link
              href="/my-vehicles"
              onClick={onClose}
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">조</span>
                </div>
                <span>차량 조회</span>
              </div>
            </Link>

            <Link
              href="/admin"
              onClick={onClose}
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 bg-purple-500 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">관</span>
                </div>
                <span>관리자</span>
              </div>
            </Link>

            <div className="border-t border-gray-200 my-4"></div>

            <div className="px-4 py-3">
              <div className="text-sm text-gray-500 mb-2">빠른 작업</div>
              <div className="space-y-2">
                <Link
                  href="/admin/bulk-edit"
                  onClick={onClose}
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  일괄 수정
                </Link>
                <Link
                  href="/admin/history"
                  onClick={onClose}
                  className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  수정 이력
                </Link>
              </div>
            </div>
          </nav>

          {/* 메뉴 푸터 */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-center">
              <div className="text-sm text-gray-500">차량 원 시스템</div>
              <div className="text-xs text-gray-400 mt-1">v1.0.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
