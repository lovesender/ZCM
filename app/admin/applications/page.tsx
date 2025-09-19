"use client"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Eye, CheckCircle, Clock, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import ExcelDownload from "@/components/excel-download"

// 차량 신청 데이터 타입
interface VehicleApplication {
  id: number
  plateNumber: string
  model: string
  year: number
  owner: string
  branch: string
  department: string
  departmentDistrict?: string // Add this new field
  status: "승인대기" | "승인완료" | "반려"
  submittedAt: string
  phone: string
  email: string
  reason?: string
}

// 샘플 차량 신청 데이터
const sampleApplications: VehicleApplication[] = [
  {
    id: 1,
    plateNumber: "12가3456",
    model: "소나타",
    year: 2022,
    owner: "김신청자",
    branch: "요한",
    department: "총무부",
    departmentDistrict: "하늘부 12구역",
    status: "승인대기",
    submittedAt: "2024-01-15 14:30",
    phone: "010-1234-5678",
    email: "kim@example.com",
  },
  {
    id: 2,
    plateNumber: "34나5678",
    model: "아반떼",
    year: 2021,
    owner: "이등록자",
    branch: "베드로",
    department: "행정서무부",
    departmentDistrict: "땅부 5구역",
    status: "승인완료",
    submittedAt: "2024-01-14 10:15",
    phone: "010-2345-6789",
    email: "lee@example.com",
  },
  {
    id: 3,
    plateNumber: "56다7890",
    model: "그랜저",
    year: 2023,
    owner: "박사용자",
    branch: "부산야고보",
    department: "기획부",
    departmentDistrict: "바다부 8구역",
    status: "승인대기",
    submittedAt: "2024-01-13 16:45",
    phone: "010-3456-7890",
    email: "park@example.com",
  },
  {
    id: 4,
    plateNumber: "78라9012",
    model: "카니발",
    year: 2020,
    owner: "최신청",
    branch: "안드레",
    department: "교육부",
    departmentDistrict: "별부 3구역",
    status: "반려",
    submittedAt: "2024-01-12 09:20",
    phone: "010-4567-8901",
    email: "choi@example.com",
    reason: "차량 정보 불일치",
  },
  {
    id: 5,
    plateNumber: "90마3456",
    model: "스타렉스",
    year: 2019,
    owner: "정등록",
    branch: "다대오",
    department: "봉사교통부",
    departmentDistrict: "구름부 15구역",
    status: "승인대기",
    submittedAt: "2024-01-11 13:10",
    phone: "010-5678-9012",
    email: "jung@example.com",
  },
]

const getStatusBadge = (status: VehicleApplication["status"]) => {
  const statusConfig = {
    승인대기: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    승인완료: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    반려: { color: "bg-red-100 text-red-800", icon: X },
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

export default function ApplicationsPage() {
  const [applications] = useState<VehicleApplication[]>(sampleApplications)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedApplication, setSelectedApplication] = useState<VehicleApplication | null>(null)
  const [selectedApplications, setSelectedApplications] = useState<number[]>([])

  // 필터링된 신청 목록
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.owner.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // 통계 계산
  const stats = [
    {
      title: "전체 신청",
      value: applications.length.toString(),
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
      color: "",
    },
    {
      title: "승인 대기",
      value: applications.filter((app) => app.status === "승인대기").length.toString(),
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
      color: "text-yellow-600",
    },
    {
      title: "승인 완료",
      value: applications.filter((app) => app.status === "승인완료").length.toString(),
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "반려",
      value: applications.filter((app) => app.status === "반려").length.toString(),
      icon: <X className="h-4 w-4 text-red-600" />,
      color: "text-red-600",
    },
  ]

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedApplications(filteredApplications.map((app) => app.id))
    } else {
      setSelectedApplications([])
    }
  }

  // 개별 선택/해제
  const handleSelectApplication = (appId: number, checked: boolean) => {
    if (checked) {
      setSelectedApplications((prev) => [...prev, appId])
    } else {
      setSelectedApplications((prev) => prev.filter((id) => id !== appId))
    }
  }

  // 일괄 작업 처리
  const handleBulkAction = async (actionId: string) => {
    console.log("일괄 작업:", actionId, "선택된 신청:", selectedApplications)

    // 실제 구현에서는 서버 API 호출
    await new Promise((resolve) => setTimeout(resolve, 2000)) // 시뮬레이션

    if (actionId === "approve") {
      return {
        success: true,
        message: `${selectedApplications.length}개 신청이 승인되었습니다.`,
      }
    } else if (actionId === "reject") {
      return {
        success: true,
        message: `${selectedApplications.length}개 신청이 반려되었습니다.`,
      }
    }

    return { success: false, message: "알 수 없는 작업입니다." }
  }

  // 일괄 작업 정의
  const bulkActions = [
    {
      id: "approve",
      label: "일괄 승인",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      id: "reject",
      label: "일괄 반려",
      icon: <X className="w-4 h-4" />,
      variant: "destructive" as const,
    },
  ]

  // 브레드크럼 데이터 수정
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "접수 관리" }]

  const actions = (
    <div className="flex gap-2">
      <ExcelDownload className="flex items-center gap-2" variant="outline">
        엑셀로 보내기
      </ExcelDownload>
    </div>
  )

  return (
    <PageLayout
      title="차량 접수 관리"
      description="차량 등록 신청을 관리하고 승인합니다"
      breadcrumbs={breadcrumbs}
      stats={stats}
      actions={actions}
    >
      {/* 필터 및 검색 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="차량번호, 모델명, 신청자로 검색..."
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
                <SelectItem value="승인대기">승인대기</SelectItem>
                <SelectItem value="승인완료">승인완료</SelectItem>
                <SelectItem value="반려">반려</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <BulkActionBar
            selectedCount={selectedApplications.length}
            totalCount={filteredApplications.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedApplications([])}
          />

          {/* 신청 테이블 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedApplications.length === filteredApplications.length && filteredApplications.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>차량번호</TableHead>
                  <TableHead>모델/연식</TableHead>
                  <TableHead>신청자</TableHead>
                  <TableHead>지파/부서/구역</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청일시</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedApplications.includes(app.id)}
                        onCheckedChange={(checked) => handleSelectApplication(app.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{app.plateNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.model}</div>
                        <div className="text-sm text-gray-500">{app.year}년</div>
                      </div>
                    </TableCell>
                    <TableCell>{app.owner}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.branch}</div>
                        <div className="text-sm text-gray-500">{app.department}</div>
                        {app.departmentDistrict && (
                          <div className="text-sm text-gray-600 mt-1">{app.departmentDistrict}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell>{app.submittedAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedApplication(app)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>신청 상세 정보</DialogTitle>
                            </DialogHeader>
                            {selectedApplication && (
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">차량번호</label>
                                    <p className="text-lg font-semibold">{selectedApplication.plateNumber}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">모델</label>
                                    <p>
                                      {selectedApplication.model} ({selectedApplication.year}년)
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">신청자</label>
                                    <p>{selectedApplication.owner}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">연락처</label>
                                    <p>{selectedApplication.phone}</p>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">지파/부서</label>
                                    <p>
                                      {selectedApplication.branch} / {selectedApplication.department}
                                    </p>
                                    {selectedApplication.departmentDistrict && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {selectedApplication.departmentDistrict}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">이메일</label>
                                    <p>{selectedApplication.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">상태</label>
                                    <div className="mt-1">{getStatusBadge(selectedApplication.status)}</div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-500">신청일시</label>
                                    <p>{selectedApplication.submittedAt}</p>
                                  </div>
                                </div>
                                {selectedApplication.reason && (
                                  <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-500">반려 사유</label>
                                    <p className="mt-1 p-2 bg-red-50 text-red-800 rounded-md">
                                      {selectedApplication.reason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {app.status === "승인대기" && (
                          <>
                            <Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-red-50 text-red-700 border-red-200">
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-8 text-gray-500">검색 조건에 맞는 신청이 없습니다.</div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  )
}
