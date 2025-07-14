"use client"

import { useState, useMemo, useEffect } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Eye,
  Edit,
  Car,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Plus,
  Wrench,
  BookOpen,
  Calendar,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import ChurchVehicleExcelDownload from "@/components/church-vehicle-excel-download"
import ChurchVehicleExcelImport from "@/components/church-vehicle-excel-import"
import VehicleMaintenanceAlert from "@/components/vehicle-maintenance-alert"
import VehicleLogManagement from "@/components/vehicle-log-management"
import VehicleReservationSystem from "@/components/vehicle-reservation-system"
import ChurchVehicleRegistrationModal from "@/components/church-vehicle-registration-modal"
import { getChurchVehicles, getChurchVehicleStatistics } from "@/app/actions/church-vehicle-actions"
import { getMaintenanceAlerts } from "@/app/actions/vehicle-maintenance-actions"
import { getVehicleReservations } from "@/app/actions/vehicle-reservation-actions"

// 교회 지파 목록
const BRANCHES = [
  "요한",
  "베드로",
  "부산야고보",
  "안드레",
  "다대오",
  "빌립",
  "시몬",
  "바돌로매",
  "마태",
  "맛디아",
  "서울야고보",
  "도마",
]

// 차량 데이터 타입
interface Vehicle {
  id: number
  plateNumber: string
  model: string
  year: number
  branch: string
  department: string
  manager: string
  status: "운행중" | "정비중" | "대기중" | "폐차"
  lastInspection: string
  mileage: number
  fuelType: string
  registrationDate: string
  notes?: string
  insuranceExpiry?: string
  maintenanceSchedule?: string
}

const getStatusBadge = (status: Vehicle["status"]) => {
  const statusConfig = {
    운행중: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    정비중: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
    대기중: { color: "bg-blue-100 text-blue-800", icon: Clock },
    폐차: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  )
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<any[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedVehicles, setSelectedVehicles] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("vehicles")
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [vehicleData, statsData, alertsData, reservationsData] = await Promise.all([
          getChurchVehicles(),
          getChurchVehicleStatistics(),
          getMaintenanceAlerts(),
          getVehicleReservations(),
        ])
        setVehicles(vehicleData)
        setStatistics(statsData)
        setMaintenanceAlerts(alertsData)
        setReservations(reservationsData)
      } catch (error) {
        console.error("데이터 로드 오류:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // 필터링된 차량 목록
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        vehicle.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.manager.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
      const matchesBranch = branchFilter === "all" || vehicle.branch === branchFilter

      return matchesSearch && matchesStatus && matchesBranch
    })
  }, [vehicles, searchTerm, statusFilter, branchFilter])

  // 통계 계산
  const stats = useMemo(() => {
    if (!statistics) return []

    const urgentAlerts = maintenanceAlerts.filter((alert) => alert.priority === "urgent").length
    const todayReservations = reservations.filter(
      (res) => new Date(res.startDate).toDateString() === new Date().toDateString(),
    ).length

    return [
      {
        title: "전체 차량",
        value: statistics.total,
        icon: <Car className="h-4 w-4 text-muted-foreground" />,
      },
      {
        title: "운행중",
        value: statistics.running,
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        color: "text-green-600",
      },
      {
        title: "긴급 정비",
        value: urgentAlerts,
        icon: <AlertTriangle className="h-4 w-4 text-red-600" />,
        color: "text-red-600",
      },
      {
        title: "오늘 예약",
        value: todayReservations,
        icon: <Calendar className="h-4 w-4 text-blue-600" />,
        color: "text-blue-600",
      },
    ]
  }, [statistics, maintenanceAlerts, reservations])

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVehicles(filteredVehicles.map((v) => v.id))
    } else {
      setSelectedVehicles([])
    }
  }

  // 개별 선택/해제
  const handleSelectVehicle = (vehicleId: number, checked: boolean) => {
    if (checked) {
      setSelectedVehicles((prev) => [...prev, vehicleId])
    } else {
      setSelectedVehicles((prev) => prev.filter((id) => id !== vehicleId))
    }
  }

  // 일괄 작업 처리
  const handleBulkAction = async (actionId: string, value?: string) => {
    console.log("일괄 작업:", actionId, "값:", value, "선택된 차량:", selectedVehicles)

    // 실제 구현에서는 서버 API 호출
    await new Promise((resolve) => setTimeout(resolve, 2000)) // 시뮬레이션

    if (actionId === "delete") {
      return {
        success: true,
        message: `${selectedVehicles.length}개 차량이 삭제되었습니다.`,
      }
    } else if (actionId === "changeStatus") {
      return {
        success: true,
        message: `${selectedVehicles.length}개 차량의 상태가 ${value}(으)로 변경되었습니다.`,
      }
    }

    return { success: false, message: "알 수 없는 작업입니다." }
  }

  // 엑셀 불러오기 완료 처리
  const handleImportComplete = (importedData: any[]) => {
    console.log("불러온 교회 차량 데이터:", importedData)
    window.location.reload()
  }

  // 교회 차량 등록 완료 처리
  const handleRegistrationComplete = (newVehicle: any) => {
    setVehicles((prev) => [newVehicle, ...prev])
    setShowRegistrationModal(false)
    console.log("새 교회 차량이 등록되었습니다:", newVehicle)
  }

  // 일괄 작업 정의
  const bulkActions = [
    {
      id: "changeStatus",
      label: "상태 변경",
      icon: <Edit className="w-4 h-4" />,
      requiresValue: true,
      options: [
        { value: "운행중", label: "운행중" },
        { value: "정비중", label: "정비중" },
        { value: "대기중", label: "대기중" },
        { value: "폐차", label: "폐차" },
      ],
    },
    {
      id: "delete",
      label: "삭제",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
    },
  ]

  // 브레드크럼 데이터
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "교회 차량" }]

  const actions = (
    <div className="flex gap-2">
      <ChurchVehicleExcelImport onImportComplete={handleImportComplete} />
      <ChurchVehicleExcelDownload
        className="flex items-center gap-2"
        variant="outline"
        filteredData={filteredVehicles.map((v) => ({
          ID: v.id,
          차량번호: v.plateNumber,
          모델: v.model,
          연식: v.year,
          지파: v.branch,
          부서: v.department,
          담당자: v.manager,
          상태: v.status,
          최근점검일: v.lastInspection,
          주행거리: v.mileage,
          연료타입: v.fuelType,
          등록일: v.registrationDate,
          보험만료일: v.insuranceExpiry || "",
          정비예정일: v.maintenanceSchedule || "",
          비고: v.notes || "",
        }))}
      >
        엑셀로 내보내기
      </ChurchVehicleExcelDownload>
      <Button onClick={() => setShowRegistrationModal(true)} className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        교회 차량 등록
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <PageLayout
        title="교회 차량"
        description="등록된 교회 차량의 현황을 관리합니다"
        breadcrumbs={breadcrumbs}
        stats={[]}
        actions={<div>로딩 중...</div>}
      >
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">데이터를 불러오는 중...</div>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="교회 차량"
      description="등록된 교회 차량의 현황을 관리합니다"
      breadcrumbs={breadcrumbs}
      stats={stats}
      actions={actions}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            차량 목록
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            정비 관리
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            운행 일지
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            차량 예약
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-6">
          {/* 정비 알림 */}
          {maintenanceAlerts.length > 0 && <VehicleMaintenanceAlert alerts={maintenanceAlerts} />}

          {/* 필터 및 검색 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="차량번호, 모델명, 담당자로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="상태 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="운행중">운행중</SelectItem>
                    <SelectItem value="정비중">정비중</SelectItem>
                    <SelectItem value="대기중">대기중</SelectItem>
                    <SelectItem value="폐차">폐차</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={branchFilter} onValueChange={setBranchFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="지파 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 지파</SelectItem>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <BulkActionBar
                selectedCount={selectedVehicles.length}
                totalCount={filteredVehicles.length}
                actions={bulkActions}
                onAction={handleBulkAction}
                onClearSelection={() => setSelectedVehicles([])}
              />

              {/* 차량 테이블 */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedVehicles.length === filteredVehicles.length && filteredVehicles.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>차량번호</TableHead>
                      <TableHead>모델/연식</TableHead>
                      <TableHead>지파/부서</TableHead>
                      <TableHead>담당자</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>주행거리</TableHead>
                      <TableHead>최근점검</TableHead>
                      <TableHead>보험만료</TableHead>
                      <TableHead>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedVehicles.includes(vehicle.id)}
                            onCheckedChange={(checked) => handleSelectVehicle(vehicle.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vehicle.model}</div>
                            <div className="text-sm text-gray-500">{vehicle.year}년</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vehicle.branch}</div>
                            <div className="text-sm text-gray-500">{vehicle.department}</div>
                          </div>
                        </TableCell>
                        <TableCell>{vehicle.manager}</TableCell>
                        <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                        <TableCell>{vehicle.mileage.toLocaleString()}km</TableCell>
                        <TableCell>{vehicle.lastInspection}</TableCell>
                        <TableCell>
                          <span
                            className={`text-sm ${
                              vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) < new Date()
                                ? "text-red-600 font-medium"
                                : "text-gray-600"
                            }`}
                          >
                            {vehicle.insuranceExpiry || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedVehicle(vehicle)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>교회 차량 상세 정보</DialogTitle>
                                </DialogHeader>
                                {selectedVehicle && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">차량번호</label>
                                        <p className="text-lg font-semibold">{selectedVehicle.plateNumber}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">모델/연식</label>
                                        <p>
                                          {selectedVehicle.model} ({selectedVehicle.year}년)
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">연료타입</label>
                                        <p>{selectedVehicle.fuelType}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">등록일</label>
                                        <p>{selectedVehicle.registrationDate}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">보험만료일</label>
                                        <p
                                          className={
                                            selectedVehicle.insuranceExpiry &&
                                            new Date(selectedVehicle.insuranceExpiry) < new Date()
                                              ? "text-red-600 font-medium"
                                              : ""
                                          }
                                        >
                                          {selectedVehicle.insuranceExpiry || "-"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-3">
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">지파/부서</label>
                                        <p>
                                          {selectedVehicle.branch} / {selectedVehicle.department}
                                        </p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">담당자</label>
                                        <p>{selectedVehicle.manager}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">상태</label>
                                        <div className="mt-1">{getStatusBadge(selectedVehicle.status)}</div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">주행거리</label>
                                        <p>{selectedVehicle.mileage.toLocaleString()}km</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-gray-500">정비예정일</label>
                                        <p>{selectedVehicle.maintenanceSchedule || "-"}</p>
                                      </div>
                                    </div>
                                    {selectedVehicle.notes && (
                                      <div className="col-span-2">
                                        <label className="text-sm font-medium text-gray-500">비고</label>
                                        <p className="mt-1 text-sm bg-gray-50 p-2 rounded">{selectedVehicle.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredVehicles.length === 0 && (
                <div className="text-center py-8 text-gray-500">검색 조건에 맞는 교회 차량이 없습니다.</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <VehicleMaintenanceAlert
            alerts={maintenanceAlerts}
            vehicles={vehicles}
            showFullInterface={true}
            onAddAlert={(alert) => {
              // 새 알림을 목록 맨 앞에 추가
              setMaintenanceAlerts((prev) => [alert, ...prev])

              // 통계도 업데이트 (긴급 알림인 경우)
              if (alert.priority === "urgent") {
                setStatistics((prev) =>
                  prev
                    ? {
                        ...prev,
                        urgentAlerts: (prev.urgentAlerts || 0) + 1,
                      }
                    : prev,
                )
              }

              console.log("새 정비 알림이 목록에 추가되었습니다:", alert)
            }}
          />
        </TabsContent>

        <TabsContent value="logs">
          <VehicleLogManagement vehicles={vehicles} />
        </TabsContent>

        <TabsContent value="reservations">
          <VehicleReservationSystem vehicles={vehicles} reservations={reservations} />
        </TabsContent>
      </Tabs>

      {/* 교회 차량 등록 모달 */}
      <ChurchVehicleRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSuccess={handleRegistrationComplete}
      />
    </PageLayout>
  )
}
