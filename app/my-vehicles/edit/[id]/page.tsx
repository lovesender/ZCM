import { notFound } from "next/navigation"
import EditVehicleForm from "@/components/edit-vehicle-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getVehicleById } from "@/app/actions/vehicle-actions"

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditVehiclePage({ params }: PageProps) {
  const vehicleId = Number.parseInt(params.id)

  // 실제 구현에서는 서버에서 차량 정보를 가져옵니다
  const vehicle = await getVehicleById(vehicleId)

  if (!vehicle) {
    notFound()
  }

  // 대기 상태가 아닌 차량은 수정할 수 없습니다
  if (vehicle.status !== "대기") {
    return (
      <div className="min-h-screen bg-bgSecondary py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="card">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">수정할 수 없는 차량입니다</h2>
              <p className="text-contentSub mb-6">이미 승인이 완료되었거나 거부된 차량은 수정할 수 없습니다.</p>
              <a href="/my-vehicles" className="btn-primary inline-block px-6 py-2 rounded-lg">
                내 차량 조회로 돌아가기
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bgSecondary py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">차량 정보 수정</CardTitle>
            <p className="text-contentSub mt-2">
              등록하신 차량 정보를 수정할 수 있습니다. (승인 대기 중인 차량만 수정 가능)
            </p>
          </CardHeader>
          <CardContent>
            <EditVehicleForm vehicle={vehicle} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
