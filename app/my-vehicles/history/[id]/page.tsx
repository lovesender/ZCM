import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText } from "lucide-react"
import { getVehicleById } from "@/app/actions/vehicle-actions"
import { getVehicleEditHistory } from "@/app/actions/history-actions"
import EditHistoryList from "@/components/edit-history-list"

interface PageProps {
  params: {
    id: string
  }
}

export default async function VehicleHistoryPage({ params }: PageProps) {
  const vehicleId = Number.parseInt(params.id)

  // 실제 구현에서는 서버에서 차량 정보를 가져옵니다
  const vehicle = await getVehicleById(vehicleId)

  if (!vehicle) {
    notFound()
  }

  // 차량의 수정 이력을 가져옵니다
  const history = await getVehicleEditHistory(vehicleId)

  return (
    <div className="min-h-screen bg-bgSecondary py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="card">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl">차량 정보 수정 이력</CardTitle>
              <p className="text-contentSub mt-2">
                차량번호: {vehicle.carNumber} | 차종: {vehicle.carModel}
              </p>
            </div>
            <Link href="/my-vehicles" className="mt-4 md:mt-0">
              <Button variant="outline" className="btn-tertiary">
                <ArrowLeft className="h-4 w-4 mr-2" />
                목록으로 돌아가기
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <EditHistoryList history={history} />
            ) : (
              <div className="text-center py-12">
                <div className="bg-grey100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-grey500" />
                </div>
                <h3 className="text-lg font-medium mb-2">수정 이력이 없습니다</h3>
                <p className="text-contentSub">아직 차량 정보 수정 이력이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
