"use client"

import { useState, type ReactNode } from "react"
import { getChurchVehiclesForExcel } from "@/app/actions/church-vehicle-actions"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"

interface ChurchVehicleExcelDownloadProps {
  className?: string
  variant?: "default" | "outline"
  children?: ReactNode
  filteredData?: any[]
}

export default function ChurchVehicleExcelDownload({
  className = "",
  variant = "default",
  children,
  filteredData,
}: ChurchVehicleExcelDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)
    try {
      // 필터링된 데이터가 있으면 사용, 없으면 전체 데이터 가져오기
      let vehicles
      if (filteredData && filteredData.length > 0) {
        vehicles = filteredData
      } else {
        vehicles = await getChurchVehiclesForExcel()
      }

      // CSV 헤더 정의
      const headers = [
        "ID",
        "차량번호",
        "모델",
        "연식",
        "지파",
        "부서",
        "담당자",
        "상태",
        "최근점검일",
        "주행거리",
        "연료타입",
        "등록일",
        "보험만료일",
        "정비예정일",
        "비고",
      ]

      // CSV 데이터 생성
      const csvData = vehicles.map((vehicle) => [
        vehicle.ID,
        vehicle.차량번호,
        vehicle.모델,
        vehicle.연식,
        vehicle.지파,
        vehicle.부서,
        vehicle.담당자,
        vehicle.상태,
        vehicle.최근점검일,
        vehicle.주행거리,
        vehicle.연료타입,
        vehicle.등록일,
        vehicle.보험만료일,
        vehicle.정비예정일,
        vehicle.비고,
      ])

      // CSV 문자열 생성
      const csvContent = [headers, ...csvData].map((row) => row.map((field) => `"${field}"`).join(",")).join("\n")

      // BOM 추가 (한글 깨짐 방지)
      const BOM = "\uFEFF"
      const csvWithBOM = BOM + csvContent

      // 파일 다운로드
      const blob = new Blob([csvWithBOM], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      // 파일명 생성
      const fileName = `교회차량목록_${new Date().toISOString().split("T")[0]}.csv`

      link.setAttribute("href", url)
      link.setAttribute("download", fileName)
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("엑셀 다운로드 오류:", error)
      alert("엑셀 다운로드 중 오류가 발생했습니다.")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isDownloading} variant={variant} className={className}>
      <FileSpreadsheet className="w-4 h-4 mr-2" />
      {isDownloading ? "다운로드 중..." : children || "엑셀로 내보내기"}
    </Button>
  )
}
