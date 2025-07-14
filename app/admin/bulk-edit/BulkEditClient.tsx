"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingSpinner from "@/components/ui/loading-spinner"
import LazyBulkEditComponent from "@/components/lazy-bulk-edit-component"
import { PageLayout } from "@/components/page-layout"
import ExcelDownload from "@/components/excel-download"
import ExcelImport from "@/components/excel-import"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

interface BulkEditClientProps {
  vehicles: any[]
}

export default function BulkEditClient({ vehicles }: BulkEditClientProps) {
  const [vehicleList, setVehicleList] = useState(vehicles)

  // 엑셀 불러오기 완료 처리
  const handleImportComplete = (importedData: any[]) => {
    // 실제 구현에서는 서버에 데이터를 저장하고 차량 목록을 새로고침
    console.log("불러온 데이터:", importedData)
    // 상태 업데이트로 목록 갱신 (예시)
    setVehicleList(importedData)
  }

  // 브레드크럼 데이터
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "성도 차량" }]

  const actions = (
    <div className="flex gap-2">
      <ExcelImport onImportComplete={handleImportComplete} vehicleType="member" />
      <ExcelDownload className="flex items-center gap-2" variant="outline" vehicleType="member">
        엑셀 내보내기
      </ExcelDownload>
      <Link href="/register">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          차량 등록
        </Button>
      </Link>
    </div>
  )

  return (
    <PageLayout
      title="성도 차량 관리"
      description="성도님들의 차량 정보를 관리하고 수정할 수 있습니다"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <Card className="w-full overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg">성도 차량 목록 및 관리</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          {/* LazyBulkEditComponent는 vehicles prop을 vehicleList로 대체 */}
          <LazyBulkEditComponent vehicles={vehicleList} />
        </CardContent>
      </Card>
    </PageLayout>
  )
}
