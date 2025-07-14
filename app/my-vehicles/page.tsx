import type { Metadata } from "next"
import MyVehiclesComponent from "@/components/my-vehicles"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileSpreadsheet, Plus } from "lucide-react"
import Link from "next/link"
import ExcelDownload from "@/components/excel-download"
import { PageLayout } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "성도 차량 | 차량 관리 시스템",
  description: "등록된 성도 차량을 조회합니다.",
}

export default function MyVehiclesPage() {
  // 브레드크럼 데이터
  const breadcrumbs = [{ label: "대시보드", href: "/" }, { label: "성도 차량" }]

  const actions = (
    <div className="flex gap-2">
      <ExcelDownload className="flex items-center gap-2" variant="outline">
        <FileSpreadsheet className="w-4 h-4 mr-1" />
        엑셀로 보내기
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
      title="성도 차량"
      description="등록된 성도 차량을 조회합니다"
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>차량 조회</CardTitle>
        </CardHeader>
        <CardContent>
          <MyVehiclesComponent />
        </CardContent>
      </Card>
    </PageLayout>
  )
}
