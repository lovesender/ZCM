"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Car,
  Phone,
  MapPin,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
} from "lucide-react"
import Link from "next/link"
import LazyVehicleDetailModal from "./lazy-vehicle-detail-modal"

const searchSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "올바른 연락처를 입력해주세요" })
    .regex(/^[0-9-]+$/, { message: "숫자와 하이픈(-)만 입력 가능합니다" }),
  carNumber: z
    .string()
    .min(7, { message: "올바른 차량번호를 입력해주세요" })
    .regex(/^[0-9가-힣]{2,3}[0-9]{4}$/, { message: "올바른 차량번호 형식이 아닙니다" }),
})

type SearchValues = z.infer<typeof searchSchema>

// 샘플 데이터 (실제 구현에서는 서버에서 가져옴)
const sampleVehicles = [
  {
    id: 1,
    name: "김성도",
    phone: "010-1234-5678",
    carNumber: "12가3456",
    carModel: "소나타",
    carType: "승용차",
    branch: "서울지파",
    church: "본교회",
    department: "청년부",
    status: "완료",
    registeredAt: "2024-01-15",
    approvedAt: "2024-01-16",
    notes: "승인 완료되었습니다.",
  },
  {
    id: 2,
    name: "김성도",
    phone: "010-1234-5678",
    carNumber: "23나4567",
    carModel: "아반떼",
    carType: "승용차",
    branch: "서울지파",
    church: "본교회",
    department: "청년부",
    status: "대기",
    registeredAt: "2024-01-20",
    approvedAt: null,
    notes: "관리자 검토 중입니다.",
  },
]

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

export default function MyVehiclesComponent() {
  const [isSearching, setIsSearching] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
  })

  const onSearch = async (data: SearchValues) => {
    setIsSearching(true)
    setSearchPerformed(false)

    try {
      // 실제 구현에서는 서버 액션을 호출하여 데이터를 가져옵니다
      // const result = await searchVehicles(data);

      // 현재는 샘플 데이터로 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const foundVehicles = sampleVehicles.filter(
        (vehicle) => vehicle.phone === data.phone && vehicle.carNumber === data.carNumber,
      )

      setVehicles(foundVehicles)
      setSearchPerformed(true)
    } catch (error) {
      console.error("차량 조회 중 오류:", error)
      setVehicles([])
      setSearchPerformed(true)
    } finally {
      setIsSearching(false)
    }
  }

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

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
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
          <Button variant="outline" size="sm" className="btn-tertiary" onClick={() => setSelectedVehicle(vehicle)}>
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

  return (
    <div className="space-y-6">
      {/* 검색 폼 */}
      <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">
              연락처 <span className="text-red500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="010-0000-0000"
              className={`input ${errors.phone ? "border-red500" : ""}`}
              {...register("phone")}
            />
            {errors.phone && <p className="text-red500 text-xs">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="carNumber">
              차량번호 <span className="text-red500">*</span>
            </Label>
            <Input
              id="carNumber"
              placeholder="12가3456"
              className={`input ${errors.carNumber ? "border-red500" : ""}`}
              {...register("carNumber")}
            />
            {errors.carNumber && <p className="text-red500 text-xs">{errors.carNumber.message}</p>}
          </div>
        </div>

        <div className="flex justify-center">
          <Button type="submit" className="btn-primary w-full md:w-1/3 h-12" disabled={isSearching}>
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? "조회 중..." : "차량 조회"}
          </Button>
        </div>
      </form>

      <Separator />

      {/* 검색 결과 */}
      {searchPerformed && (
        <div className="space-y-4">
          {vehicles.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">등록된 차량 ({vehicles.length}대)</h3>
              </div>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>조회 결과 없음</AlertTitle>
              <AlertDescription>
                입력하신 정보와 일치하는 차량 등록 정보를 찾을 수 없습니다.
                <br />
                연락처와 차량번호를 다시 확인해주세요.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* 상세보기 모달 - 지연 로딩 사용 */}
      {selectedVehicle && <LazyVehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />}
    </div>
  )
}
