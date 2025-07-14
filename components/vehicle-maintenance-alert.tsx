"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, Calendar, Car, CheckCircle, Clock, Wrench, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createMaintenanceAlert } from "@/app/actions/vehicle-maintenance-actions"
import { useToast } from "@/hooks/use-toast"

interface MaintenanceAlert {
  id: number
  vehicleId: number
  plateNumber: string
  type: string
  priority: "urgent" | "high" | "medium" | "low"
  dueDate: string
  description: string
  status: "pending" | "in_progress" | "completed"
}

interface VehicleMaintenanceAlertProps {
  alerts: MaintenanceAlert[]
  vehicles?: any[] // 차량 목록 추가
  showFullInterface?: boolean
  onAddAlert?: (alert: MaintenanceAlert) => void // 새 알림 추가 콜백
}

const getPriorityBadge = (priority: MaintenanceAlert["priority"]) => {
  const config = {
    urgent: { color: "bg-red-100 text-red-800", label: "긴급" },
    high: { color: "bg-orange-100 text-orange-800", label: "높음" },
    medium: { color: "bg-yellow-100 text-yellow-800", label: "보통" },
    low: { color: "bg-green-100 text-green-800", label: "낮음" },
  }

  const { color, label } = config[priority]
  return <Badge className={color}>{label}</Badge>
}

const getStatusBadge = (status: MaintenanceAlert["status"]) => {
  const config = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "대기중" },
    in_progress: { color: "bg-blue-100 text-blue-800", icon: Wrench, label: "진행중" },
    completed: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "완료" },
  }

  const { color, icon: Icon, label } = config[status]
  return (
    <Badge className={`${color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {label}
    </Badge>
  )
}

export default function VehicleMaintenanceAlert({
  alerts,
  vehicles,
  showFullInterface = false,
  onAddAlert,
}: VehicleMaintenanceAlertProps) {
  const [selectedAlert, setSelectedAlert] = useState<MaintenanceAlert | null>(null)
  const { toast } = useToast()

  // 새 알림 상태 추가
  const [isAddAlertOpen, setIsAddAlertOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newAlert, setNewAlert] = useState({
    vehicleId: "",
    type: "",
    priority: "medium" as MaintenanceAlert["priority"],
    dueDate: "",
    description: "",
  })

  // 새 알림 추가 함수
  const handleAddAlert = async () => {
    // 유효성 검사
    if (!newAlert.vehicleId || !newAlert.type || !newAlert.dueDate || !newAlert.description.trim()) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    // 날짜 유효성 검사
    const selectedDate = new Date(newAlert.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      toast({
        title: "날짜 오류",
        description: "마감일은 오늘 이후로 설정해주세요.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const vehicle = vehicles?.find((v: any) => v.id.toString() === newAlert.vehicleId)
      if (!vehicle) {
        throw new Error("차량 정보를 찾을 수 없습니다.")
      }

      const result = await createMaintenanceAlert({
        vehicleId: Number.parseInt(newAlert.vehicleId),
        type: newAlert.type,
        priority: newAlert.priority,
        dueDate: newAlert.dueDate,
        description: newAlert.description.trim(),
      })

      if (result.success && result.data) {
        // 차량 번호 추가
        const alertWithPlateNumber = {
          ...result.data,
          plateNumber: vehicle.plateNumber,
        }

        // 부모 컴포넌트에 새 알림 전달
        if (onAddAlert) {
          onAddAlert(alertWithPlateNumber)
        }

        // 폼 초기화
        setNewAlert({
          vehicleId: "",
          type: "",
          priority: "medium",
          dueDate: "",
          description: "",
        })

        setIsAddAlertOpen(false)

        toast({
          title: "알림 추가 완료",
          description: result.message,
        })
      } else {
        throw new Error(result.message || "알림 추가에 실패했습니다.")
      }
    } catch (error) {
      console.error("알림 추가 오류:", error)
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "정비 알림 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 긴급 알림만 필터링 (간단한 알림 표시용)
  const urgentAlerts = alerts.filter((alert) => alert.priority === "urgent")

  if (!showFullInterface && urgentAlerts.length === 0) {
    return null
  }

  // 간단한 알림 표시
  if (!showFullInterface) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="font-medium mb-2">긴급 정비 알림 {urgentAlerts.length}건</div>
          <div className="space-y-1">
            {urgentAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="text-sm">
                • {alert.plateNumber} - {alert.description} (마감: {alert.dueDate})
              </div>
            ))}
            {urgentAlerts.length > 3 && <div className="text-sm font-medium">외 {urgentAlerts.length - 3}건 더...</div>}
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  // 전체 인터페이스
  return (
    <div className="space-y-6">
      {urgentAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-medium">긴급 처리가 필요한 정비 알림이 {urgentAlerts.length}건 있습니다.</div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            정비 알림 관리
          </CardTitle>
          <Dialog open={isAddAlertOpen} onOpenChange={setIsAddAlertOpen}>
            <DialogTrigger asChild>
              <Button>
                <Calendar className="w-4 h-4 mr-2" />새 알림 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>새 정비 알림 추가</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle">차량 선택</Label>
                  <Select
                    value={newAlert.vehicleId}
                    onValueChange={(value) => setNewAlert((prev) => ({ ...prev, vehicleId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="차량을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles?.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                          {vehicle.plateNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">정비 유형</Label>
                  <Select
                    value={newAlert.type}
                    onValueChange={(value) => setNewAlert((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="정비 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="정기점검">정기점검</SelectItem>
                      <SelectItem value="엔진오일교환">엔진오일교환</SelectItem>
                      <SelectItem value="타이어교체">타이어교체</SelectItem>
                      <SelectItem value="브레이크패드">브레이크패드</SelectItem>
                      <SelectItem value="배터리교체">배터리교체</SelectItem>
                      <SelectItem value="기타">기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">우선순위</Label>
                  <Select
                    value={newAlert.priority}
                    onValueChange={(value) =>
                      setNewAlert((prev) => ({ ...prev, priority: value as MaintenanceAlert["priority"] }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="우선순위 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">긴급</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="low">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">마감일</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newAlert.dueDate}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, dueDate: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]} // 오늘 이후만 선택 가능
                    required
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Textarea
                    id="description"
                    value={newAlert.description}
                    onChange={(e) => setNewAlert((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="정비 내용이나 특이사항을 입력하세요"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddAlertOpen(false)} disabled={isSubmitting}>
                  취소
                </Button>
                <Button onClick={handleAddAlert} disabled={isSubmitting}>
                  {isSubmitting ? "저장 중..." : "저장"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>차량번호</TableHead>
                  <TableHead>유형</TableHead>
                  <TableHead>우선순위</TableHead>
                  <TableHead>마감일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>설명</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-400" />
                        {alert.plateNumber}
                      </div>
                    </TableCell>
                    <TableCell>{alert.type}</TableCell>
                    <TableCell>{getPriorityBadge(alert.priority)}</TableCell>
                    <TableCell>
                      <span className={`${new Date(alert.dueDate) < new Date() ? "text-red-600 font-medium" : ""}`}>
                        {alert.dueDate}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(alert.status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{alert.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedAlert(alert)}>
                              상세보기
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>정비 알림 상세</DialogTitle>
                            </DialogHeader>
                            {selectedAlert && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">차량번호</label>
                                    <p className="text-lg font-semibold">{selectedAlert.plateNumber}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">유형</label>
                                    <p>{selectedAlert.type}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">우선순위</label>
                                    <div className="mt-1">{getPriorityBadge(selectedAlert.priority)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">상태</label>
                                    <div className="mt-1">{getStatusBadge(selectedAlert.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">마감일</label>
                                    <p
                                      className={`${
                                        new Date(selectedAlert.dueDate) < new Date() ? "text-red-600 font-medium" : ""
                                      }`}
                                    >
                                      {selectedAlert.dueDate}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-500">설명</label>
                                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded">{selectedAlert.description}</p>
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                  <Button variant="outline">수정</Button>
                                  <Button>완료 처리</Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {alerts.length === 0 && <div className="text-center py-8 text-gray-500">등록된 정비 알림이 없습니다.</div>}
        </CardContent>
      </Card>
    </div>
  )
}
