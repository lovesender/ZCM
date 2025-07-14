"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Plus, Search, Car, Clock, CheckCircle, AlertTriangle, User } from "lucide-react"

interface Vehicle {
  id: number
  plateNumber: string
  model: string
  status: string
}

interface VehicleReservation {
  id: number
  vehicleId: number
  plateNumber: string
  requester: string
  purpose: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  status: "pending" | "approved" | "rejected" | "completed"
  approver?: string
  notes?: string
}

interface VehicleReservationSystemProps {
  vehicles: Vehicle[]
  reservations: any[]
}

const getStatusBadge = (status: VehicleReservation["status"]) => {
  const config = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "승인대기" },
    approved: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "승인완료" },
    rejected: { color: "bg-red-100 text-red-800", icon: AlertTriangle, label: "반려" },
    completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "완료" },
  }

  const { color, icon: Icon, label } = config[status]
  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}

export default function VehicleReservationSystem({
  vehicles,
  reservations: initialReservations,
}: VehicleReservationSystemProps) {
  const [reservations, setReservations] = useState<VehicleReservation[]>([
    {
      id: 1,
      vehicleId: 1,
      plateNumber: "12가3456",
      requester: "김철수",
      purpose: "출장",
      startDate: "2024-01-15",
      endDate: "2024-01-16",
      startTime: "09:00",
      endTime: "18:00",
      status: "approved",
      approver: "관리자",
      notes: "",
    },
    {
      id: 2,
      vehicleId: 2,
      plateNumber: "34나5678",
      requester: "이영희",
      purpose: "행사 지원",
      startDate: "2024-01-15",
      endDate: "2024-01-15",
      startTime: "08:00",
      endTime: "17:00",
      status: "pending",
      notes: "음향 장비 운반 필요",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<VehicleReservation | null>(null)

  // 새 예약 양식
  const [newReservation, setNewReservation] = useState({
    vehicleId: "",
    requester: "",
    purpose: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    notes: "",
  })

  // 필터링된 예약 목록
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      reservation.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.requester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.purpose.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || reservation.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // 예약 추가 함수 수정
  const handleAddReservation = () => {
    const vehicle = availableVehicles.find((v) => v.id.toString() === newReservation.vehicleId)
    if (!vehicle) {
      alert("차량을 선택해주세요.")
      return
    }

    if (!newReservation.requester || !newReservation.purpose || !newReservation.startDate || !newReservation.endDate) {
      alert("필수 항목을 모두 입력해주세요.")
      return
    }

    if (new Date(newReservation.endDate) < new Date(newReservation.startDate)) {
      alert("종료일이 시작일보다 빨을 수 없습니다.")
      return
    }

    const reservation: VehicleReservation = {
      id: Date.now(),
      vehicleId: Number.parseInt(newReservation.vehicleId),
      plateNumber: vehicle.plateNumber,
      requester: newReservation.requester,
      purpose: newReservation.purpose,
      startDate: newReservation.startDate,
      endDate: newReservation.endDate,
      startTime: newReservation.startTime || "09:00",
      endTime: newReservation.endTime || "18:00",
      status: "pending",
      notes: newReservation.notes,
    }

    setReservations((prev) => [reservation, ...prev])
    alert("차량 예약이 성공적으로 신청되었습니다.")

    // 폼 초기화
    setNewReservation({
      vehicleId: "",
      requester: "",
      purpose: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      notes: "",
    })
    setIsAddReservationOpen(false)
  }

  // 예약 승인/반려 함수 수정
  const handleApproveReservation = (id: number, approved: boolean) => {
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? {
              ...reservation,
              status: approved ? "approved" : "rejected",
              approver: "관리자",
            }
          : reservation,
      ),
    )

    const action = approved ? "승인" : "반려"
    alert(`예약이 ${action}되었습니다.`)
  }

  // 사용 가능한 차량 목록 (운행중이 아닌 차량)
  const availableVehicles = vehicles.filter((vehicle) => vehicle.status !== "정비중" && vehicle.status !== "폐차")

  // 새 예약 모달이 열릴 때 오늘 날짜 설정
  const handleOpenAddReservation = () => {
    const today = new Date().toISOString().split("T")[0]
    setNewReservation((prev) => ({
      ...prev,
      startDate: today,
      endDate: today,
      startTime: "09:00",
      endTime: "18:00",
    }))
    setIsAddReservationOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          차량 예약 시스템
        </CardTitle>
        <Dialog open={isAddReservationOpen} onOpenChange={setIsAddReservationOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddReservation}>
              <Plus className="w-4 h-4 mr-2" />새 예약 신청
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>차량 예약 신청</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">차량 선택</Label>
                <Select
                  value={newReservation.vehicleId}
                  onValueChange={(value) => setNewReservation((prev) => ({ ...prev, vehicleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="차량을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.plateNumber} - {vehicle.model} ({vehicle.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requester">신청자</Label>
                <Input
                  id="requester"
                  value={newReservation.requester}
                  onChange={(e) => setNewReservation((prev) => ({ ...prev, requester: e.target.value }))}
                  placeholder="신청자 이름"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">사용 목적</Label>
                <Input
                  id="purpose"
                  value={newReservation.purpose}
                  onChange={(e) => setNewReservation((prev) => ({ ...prev, purpose: e.target.value }))}
                  placeholder="출장, 행사 지원 등"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">시작일</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newReservation.startDate}
                  onChange={(e) => setNewReservation((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">종료일</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newReservation.endDate}
                  onChange={(e) => setNewReservation((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">시작시간</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newReservation.startTime}
                  onChange={(e) => setNewReservation((prev) => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">종료시간</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newReservation.endTime}
                  onChange={(e) => setNewReservation((prev) => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">특이사항</Label>
                <Textarea
                  id="notes"
                  value={newReservation.notes}
                  onChange={(e) => setNewReservation((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="추가 요청사항이나 특이사항"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddReservationOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddReservation}>신청</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* 검색 및 필터 */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="차량번호, 신청자, 목적으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="pending">승인대기</SelectItem>
              <SelectItem value="approved">승인완료</SelectItem>
              <SelectItem value="rejected">반려</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 예약 테이블 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>차량번호</TableHead>
                <TableHead>신청자</TableHead>
                <TableHead>사용목적</TableHead>
                <TableHead>예약기간</TableHead>
                <TableHead>시간</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>승인자</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-gray-400" />
                      {reservation.plateNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {reservation.requester}
                    </div>
                  </TableCell>
                  <TableCell>{reservation.purpose}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {reservation.startDate}
                      {reservation.startDate !== reservation.endDate && (
                        <>
                          <br />~ {reservation.endDate}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {reservation.startTime} ~ {reservation.endTime}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell>{reservation.approver || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedReservation(reservation)}>
                            상세보기
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>예약 상세</DialogTitle>
                          </DialogHeader>
                          {selectedReservation && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-500">차량번호</label>
                                  <p className="font-medium">{selectedReservation.plateNumber}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">신청자</label>
                                  <p>{selectedReservation.requester}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">사용목적</label>
                                  <p>{selectedReservation.purpose}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">상태</label>
                                  <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">시작일시</label>
                                  <p>
                                    {selectedReservation.startDate} {selectedReservation.startTime}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">종료일시</label>
                                  <p>
                                    {selectedReservation.endDate} {selectedReservation.endTime}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">승인자</label>
                                  <p>{selectedReservation.approver || "-"}</p>
                                </div>
                              </div>
                              {selectedReservation.notes && (
                                <div>
                                  <label className="text-sm font-medium text-gray-500">특이사항</label>
                                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedReservation.notes}</p>
                                </div>
                              )}
                              {selectedReservation.status === "pending" && (
                                <div className="flex justify-end gap-2 pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleApproveReservation(selectedReservation.id, false)}
                                  >
                                    반려
                                  </Button>
                                  <Button onClick={() => handleApproveReservation(selectedReservation.id, true)}>
                                    승인
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredReservations.length === 0 && (
          <div className="text-center py-8 text-gray-500">검색 조건에 맞는 예약이 없습니다.</div>
        )}
      </CardContent>
    </Card>
  )
}
