"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // 페이지 번호 배열 생성 (현재 페이지 주변 5개)
  const generatePagination = () => {
    // 총 페이지가 7개 이하면 모든 페이지 표시
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // 현재 페이지가 앞쪽에 있는 경우
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "...", totalPages]
    }

    // 현재 페이지가 뒤쪽에 있는 경우
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    // 현재 페이지가 중간에 있는 경우
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages]
  }

  const pages = generatePagination()

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page)
    }
  }

  return (
    <div className="flex justify-center items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        <ChevronsLeft className="h-4 w-4" />
        <span className="sr-only">처음 페이지</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">이전 페이지</span>
      </Button>

      {pages.map((page, i) => (
        <Button
          key={i}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          className={`h-8 w-8 ${typeof page === "string" ? "pointer-events-none" : ""}`}
          disabled={typeof page === "string"}
          onClick={() => typeof page === "number" && handlePageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">다음 페이지</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(totalPages)}
      >
        <ChevronsRight className="h-4 w-4" />
        <span className="sr-only">마지막 페이지</span>
      </Button>
    </div>
  )
}

export default Pagination
