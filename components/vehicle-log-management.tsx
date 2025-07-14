"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Search, Car, Calendar, MapPin } from "lucide-react"

interface Vehicle {
  id: number
  plateNumber: string
  model: string
}

interface VehicleLog {
  id: number
  vehicleId: number
  plateNumber: string
  date: string
  driver: string
  startLocation: string
  endLocation: string
  startMileage: number
  endMileage: number
  purpose: string
  fuelCost?: number
  notes?: string
}

interface VehicleLogManagementProps {
  vehicles: Vehicle[]
}

export default function VehicleLogManagement({ vehicles }: VehicleLogManagementProps) {
  const [logs, setLogs] = useState<VehicleLog[]>([
    {
      id: 1,
      vehicleId: 1,
      plateNumber: "12가3456",
      date: "2024-01-15",
      driver: "김철수",
      startLocation: "본원",
      endLocation: "베드로지파",
      startMileage: 50000,
      endMileage: 50125,
      purpose: "출장",
      fuelCost: 50000,
      notes: "정상 운행",
    },
    {
      id: 2,
      vehicleId: 2,
      plateNumber: "34나5678",
      date: "2024-01-14",
      driver: "이영희",
      startLocation: "본원",
      endLocation: "요한지파",
      startMileage: 45000,
      endMileage: 45080,
      purpose: "행사 지원",
      fuelCost: 40000,
      notes: "",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [vehicleFilter, setVehicleFilter] = useState<string>("all")
  const [isAddLogOpen, setIsAddLogOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<VehicleLog | null>(null)

  // 새 운행일지 양식
  const [newLog, setNewLog] = useState({
    vehicleId: "",
    date: "",
    driver: "",
    startLocation: "",
    endLocation: "",
    startMileage: "",
    endMileage: "",
    purpose: "",
    fuelCost: "",
    notes: "",
  })

  // 필터링된 운행일지
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.purpose.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesVehicle = vehicleFilter === "all" || log.vehicleId.toString() === vehicleFilter

    return matchesSearch && matchesVehicle
  })

  // 운행일지 추가 함수 수정
  const handleAddLog = () => {
    const vehicle = vehicles.find((v) => v.id.toString() === newLog.vehicleId)
    if (!vehicle) {
      alert("차량을 선택해주세요.")
      return
    }

    if (!newLog.date || !newLog.driver || !newLog.startMileage || !newLog.endMileage) {
      alert("필수 항목을 모두 입력해주세요.")
      return
    }

    if (Number.parseInt(newLog.endMileage) <= Number.parseInt(newLog.startMileage)) {
      alert("도착 주행거리가 출발 주행거리보다 커야 합니다.")
      return
    }

    const log: VehicleLog = {
      id: Date.now(),
      vehicleId: Number.parseInt(newLog.vehicleId),
      plateNumber: vehicle.plateNumber,
      date: newLog.date,
      driver: newLog.driver,
      startLocation: newLog.startLocation,
      endLocation: newLog.endLocation,
      startMileage: Number.parseInt(newLog.startMileage),
      endMileage: Number.parseInt(newLog.endMileage),
      purpose: newLog.purpose,
      fuelCost: newLog.fuelCost ? Number.parseInt(newLog.fuelCost) : undefined,
      notes: newLog.notes,
    }

    setLogs((prev) => [log, ...prev])
    alert("운행일지가 성공적으로 추가되었습니다.")

    // 폼 초기화
    setNewLog({
      vehicleId: "",
      date: "",
      driver: "",
      startLocation: "",
      endLocation: "",
      startMileage: "",
      endMileage: "",
      purpose: "",
      fuelCost: "",
      notes: "",
    })
    setIsAddLogOpen(false)
  }

  // 새 운행일지 모달이 열릴 때 오늘 날짜 설정
  const handleOpenAddLog = () => {
    const today = new Date().toISOString().split("T")[0]
    setNewLog((prev) => ({ ...prev, date: today }))
    setIsAddLogOpen(true)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          운행 일지 관리
        </CardTitle>
        <Dialog open={isAddLogOpen} onOpenChange={setIsAddLogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenAddLog}>
              <Plus className="w-4 h-4 mr-2" />
              운행일지 작성
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 운행일지 작성</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">차량 선택</Label>
                <Select
                  value={newLog.vehicleId}
                  onValueChange={(value) => setNewLog((prev) => ({ ...prev, vehicleId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="차량을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.plateNumber} - {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">운행일자</Label>
                <Input
                  id="date"
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver">운전자</Label>
                <Input
                  id="driver"
                  value={newLog.driver}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, driver: e.target.value }))}
                  placeholder="운전자 이름"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">운행 목적</Label>
                <Input
                  id="purpose"
                  value={newLog.purpose}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, purpose: e.target.value }))}
                  placeholder="출장, 행사 지원 등"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startLocation">출발지</Label>
                <Input
                  id="startLocation"
                  value={newLog.startLocation}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, startLocation: e.target.value }))}
                  placeholder="출발지"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endLocation">도착지</Label>
                <Input
                  id="endLocation"
                  value={newLog.endLocation}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, endLocation: e.target.value }))}
                  placeholder="도착지"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startMileage">출발 주행거리</Label>
                <Input
                  id="startMileage"
                  type="number"
                  value={newLog.startMileage}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, startMileage: e.target.value }))}
                  placeholder="km"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endMileage">도착 주행거리</Label>
                <Input
                  id="endMileage"
                  type="number"
                  value={newLog.endMileage}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, endMileage: e.target.value }))}
                  placeholder="km"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fuelCost">연료비 (선택)</Label>
                <Input
                  id="fuelCost"
                  type="number"
                  value={newLog.fuelCost}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, fuelCost: e.target.value }))}
                  placeholder="원"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">비고</Label>
                <Textarea
                  id="notes"
                  value={newLog.notes}
                  onChange={(e) => setNewLog((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="특이사항이나 추가 메모"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddLogOpen(false)}>
                취소
              </Button>
              <Button onClick={handleAddLog}>저장</Button>
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
              placeholder="차량번호, 운전자, 목적으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="차량 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 차량</SelectItem>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                  {vehicle.plateNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 운행일지 테이블 */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>운행일자</TableHead>
                <TableHead>차량번호</TableHead>
                <TableHead>운전자</TableHead>
                <TableHead>출발지 → 도착지</TableHead>
                <TableHead>주행거리</TableHead>
                <TableHead>운행목적</TableHead>
                <TableHead>연료비</TableHead>
                <TableHead>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {log.date}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-gray-400" />
                      {log.plateNumber}
                    </div>
                  </TableCell>
                  <TableCell>{log.driver}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {log.startLocation} → {log.endLocation}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{(log.endMileage - log.startMileage).toLocaleString()}km</div>
                      <div className="text-gray-500">
                        {log.startMileage.toLocaleString()} → {log.endMileage.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{log.purpose}</TableCell>
                  <TableCell>{log.fuelCost ? `${log.fuelCost.toLocaleString()}원` : "-"}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                          상세보기
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>운행일지 상세</DialogTitle>
                        </DialogHeader>
                        {selectedLog && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-gray-500">운행일자</label>
                                <p>{selectedLog.date}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">차량번호</label>
                                <p className="font-medium">{selectedLog.plateNumber}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">운전자</label>
                                <p>{selectedLog.driver}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">운행목적</label>
                                <p>{selectedLog.purpose}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">출발지</label>
                                <p>{selectedLog.startLocation}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">도착지</label>
                                <p>{selectedLog.endLocation}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">출발 주행거리</label>
                                <p>{selectedLog.startMileage.toLocaleString()}km</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">도착 주행거리</label>
                                <p>{selectedLog.endMileage.toLocaleString()}km</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">운행거리</label>
                                <p className="font-medium text-lg">
                                  {(selectedLog.endMileage - selectedLog.startMileage).toLocaleString()}km
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-500">연료비</label>
                                <p>{selectedLog.fuelCost ? `${selectedLog.fuelCost.toLocaleString()}원` : "-"}</p>
                              </div>
                            </div>
                            {selectedLog.notes && (
                              <div>
                                <label className="text-sm font-medium text-gray-500">비고</label>
                                <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedLog.notes}</p>
                              </div>
                            )}
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline">수정</Button>
                              <Button variant="outline">인쇄</Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-gray-500">검색 조건에 맞는 운행일지가 없습니다.</div>
        )}
      </CardContent>
    </Card>
  )
}
