import { getBulkEditableVehicles } from "@/app/actions/bulk-edit-actions"
import BulkEditClient from "./BulkEditClient"

export default async function BulkEditPage() {
  // 서버에서 차량 목록을 가져옴
  const vehicles = await getBulkEditableVehicles()
  return <BulkEditClient vehicles={vehicles} />
}
