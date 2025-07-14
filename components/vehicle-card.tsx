"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Car, Phone, MapPin, Users, Calendar, CheckCircle2, Clock, XCircle, AlertCircle, Edit, Eye } from "lucide-react"
import { memo } from "react"
import OptimizedVehicleImage from "./optimized-vehicle-image"

interface Vehicle {
  id: number
  name: string
  phone: string
  carNumber: string
  carModel: string
  carType: string
  branch: string
  church: string
  department: string
  status: "완료" | "대기" | "거부"
  registeredAt: string
  approvedAt: string | null
  notes: string
}

interface VehicleCardProps {
  vehicle: Vehicle
  onViewDetails: () => void
}

// Use React.memo to prevent unnecessary re-renders
const VehicleCard = memo(function VehicleCard({ vehicle, onViewDetails }: VehicleCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "완료":
        return <CheckCircle2 className="h-4 w-4 text-green500" />
      case "대기":
        return <Clock className="h-4 w-4 text-orange500" />
      case "거부":
        return <XCircle className="h-4 w-4 text-red500" />
      default:
        return <AlertCircle className="h-4 w-4 text-grey500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "완료":
        return <Badge className="bg-green500 text-white">승인 완료</Badge>
      case "대기":
        return <Badge className="bg-orange500 text-white">검토 중</Badge>
      case "거부":
        return <Badge className="bg-red500 text-white">승인 거부</Badge>
      default:
        return <Badge className="badge-secondary">알 수 없음</Badge>
    }
  }

  return (
    <Card className="card">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="bg-blue50 p-2 rounded-lg">
              <Car className="h-5 w-5 text-blue500" />
            </div>
            <div>
              <CardTitle className="text-lg">{vehicle.carModel}</CardTitle>
              <p className="text-contentSub text-sm">{vehicle.carNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(vehicle.status)}
            {getStatusBadge(vehicle.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Optimized vehicle image */}
        <div className="flex justify-center">
          <OptimizedVehicleImage carModel={vehicle.carModel} className="rounded-lg" width={200} height={120} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-contentCaption" />
              <span className="text-contentSub">신청자:</span>
              <span className="font-medium">{vehicle.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-contentCaption" />
              <span className="text-contentSub">연락처:</span>
              <span className="font-medium">{vehicle.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-contentCaption" />
              <span className="text-contentSub">소속:</span>
              <span className="font-medium">
                {vehicle.branch} / {vehicle.church} / {vehicle.department}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Car className="h-4 w-4 text-contentCaption" />
              <span className="text-contentSub">차량 유형:</span>
              <span className="font-medium">{vehicle.carType}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-contentCaption" />
              <span className="text-contentSub">신청일:</span>
              <span className="font-medium">{vehicle.registeredAt}</span>
            </div>
            {vehicle.approvedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-contentCaption" />
                <span className="text-contentSub">승인일:</span>
                <span className="font-medium">{vehicle.approvedAt}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="bg-bgSecondary p-3 rounded-lg">
          <p className="text-sm text-contentSub">
            <strong>상태 안내:</strong> {vehicle.notes}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="btn-tertiary" onClick={onViewDetails}>
            <Eye className="h-4 w-4 mr-1" />
            상세보기
          </Button>
          {vehicle.status === "대기" && (
            <Link href={`/my-vehicles/edit/${vehicle.id}`}>
              <Button variant="outline" size="sm" className="btn-tertiary">
                <Edit className="h-4 w-4 mr-1" />
                수정하기
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

export default VehicleCard
