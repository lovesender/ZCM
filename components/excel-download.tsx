"use client"

import { useState, type ReactNode } from "react"
import { getVehiclesForExcel } from "@/app/actions/excel-actions"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet } from "lucide-react"

interface ExcelDownloadProps {
  className?: string
  variant?: "default" | "outline"
  children?: ReactNode
  vehicleType?: "church" | "member" | "all"
  filteredData?: any[]
}

export default function ExcelDownload({
  className = "",
  variant = "default",
  children,
  vehicleType = "all",
  filteredData,
}: ExcelDownloadProps) {
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
        vehicles = await getVehiclesForExcel()

        // 차량 유형에 따라 필터링
        if (vehicleType === "church") {
          vehicles = vehicles.filter((v) => v.church === "본교회" && v.department?.includes("부"))
        } else if (vehicleType === "member") {
          vehicles = vehicles.filter((v) => !v.department?.includes("부"))
        }
      }

      // CSV 헤더 정의
      const headers = [
        "ID",
        "이름",
        "전화번호",
        "차량번호",
        "차량모델",
        "차량유형",
        "지파",
        "교회",
        "부서",
        "상태",
        "등록일",
        "승인일",
        "비고",
      ]

      // CSV 데이터 생성
      const csvData = vehicles.map((vehicle) => [
        vehicle.id,
        vehicle.name,
        vehicle.phone,
        vehicle.carNumber,
        vehicle.carModel,
        vehicle.carType,
        vehicle.branch,
        vehicle.church,
        vehicle.department,
        vehicle.status,
        vehicle.registeredAt,
        vehicle.approvedAt || "",
        vehicle.notes,
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
      const typeText = vehicleType === "church" ? "교회차량" : vehicleType === "member" ? "성도차량" : "전체차량"
      const fileName = `${typeText}_${new Date().toISOString().split("T")[0]}.csv`

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
      {isDownloading ? "다운로드 중..." : children || "엑셀 내보내기"}
    </Button>
  )
}
