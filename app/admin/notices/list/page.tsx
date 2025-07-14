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
import { Search, Eye, Edit, FileText, AlertTriangle, CheckCircle, Clock, Trash2, Plus } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import Link from "next/link"

// 공지사항 데이터 타입
interface Notice {
  id: number
  title: string
  category: string
  author: string
  status: "게시중" | "예약됨" | "만료됨" | "초안"
  priority: "일반" | "중요" | "긴급"
  views: number
  createdAt: string
  publishedAt: string | null
  expiresAt: string | null
  content: string
}

// 샘플 공지사항 데이터
const sampleNotices: Notice[] = [
  {
    id: 1,
    title: "차량 등록 시스템 업데이트 안내",
    category: "시스템",
    author: "관리자",
    status: "게시중",
    priority: "중요",
    views: 245,
    createdAt: "2024-01-15",
    publishedAt: "2024-01-15",
    expiresAt: "2024-02-15",
    content:
      "차량 등록 시스템이 새롭게 업데이트되었습니다. 주요 변경사항은 다음과 같습니다.\n\n1. 사용자 인터페이스 개선\n2. 차량 등록 절차 간소화\n3. 모바일 지원 강화\n\n자세한 내용은 공지사항을 참고해주세요.",
  },
  {
    id: 2,
    title: "2024년 차량 정기 점검 일정 안내",
    category: "일정",
    author: "차량관리팀",
    status: "게시중",
    priority: "일반",
    views: 189,
    createdAt: "2024-01-10",
    publishedAt: "2024-01-10",
    expiresAt: "2024-03-31",
    content:
      "2024년 차량 정기 점검 일정을 안내드립니다.\n\n- 1분기: 1월 15일 ~ 1월 31일\n- 2분기: 4월 15일 ~ 4월 30일\n- 3분기: 7월 15일 ~ 7월 31일\n- 4분기: 10월 15일 ~ 10월 31일\n\n해당 기간 내에 차량 점검을 완료해주시기 바랍니다.",
  },
  {
    id: 3,
    title: "차량 운행 안전 수칙 안내",
    category: "안전",
    author: "안전관리팀",
    status: "게시중",
    priority: "긴급",
    views: 312,
    createdAt: "2024-01-05",
    publishedAt: "2024-01-05",
    expiresAt: null,
    content:
      "최근 교통사고가 증가함에 따라 차량 운행 안전 수칙을 안내드립니다.\n\n1. 안전벨트 착용 필수\n2. 제한 속도 준수\n3. 음주운전 절대 금지\n4. 졸음운전 주의\n5. 차량 출발 전 안전 점검\n\n안전한 운행 문화 정착에 동참해주시기 바랍니다.",
  },
  {
    id: 4,
    title: "여름철 차량 관리 요령",
    category: "관리",
    author: "차량관리팀",
    status: "예약됨",
    priority: "일반",
    views: 0,
    createdAt: "2024-01-20",
    publishedAt: "2024-05-01",
    expiresAt: "2024-08-31",
    content:
      "여름철 차량 관리 요령을 안내드립니다.\n\n1. 냉각수 점검 및 교체\n2. 에어컨 필터 청소\n3. 타이어 공기압 확인\n4. 배터리 상태 점검\n5. 와이퍼 블레이드 교체\n\n무더운 여름, 차량 관리에 만전을 기해주시기 바랍니다.",
  },
  {
    id: 5,
    title: "차량 등록 시스템 임시 점검 안내",
    category: "시스템",
    author: "시스템관리자",
    status: "만료됨",
    priority: "중요",
    views: 278,
    createdAt: "2023-12-20",
    publishedAt: "2023-12-20",
    expiresAt: "2023-12-25",
    content:
      "차량 등록 시스템 안정화를 위한 임시 점검을 실시합니다.\n\n- 점검 일시: 2023년 12월 23일 오전 2시 ~ 오전 5시\n- 점검 내용: 서버 업그레이드 및 보안 패치 적용\n\n점검 시간 동안에는 시스템 이용이 제한되오니 양해 부탁드립니다.",
  },
  {
    id: 6,
    title: "신규 차량 등록 절차 변경 안내",
    category: "절차",
    author: "관리자",
    status: "초안",
    priority: "일반",
    views: 0,
    createdAt: "2024-01-22",
    publishedAt: null,
    expiresAt: null,
    content:
      "신규 차량 등록 절차가 다음과 같이 변경됩니다.\n\n1. 차량 정보 입력\n2. 차량 사진 등록 (필수)\n3. 보험증서 사본 업로드 (필수)\n4. 차량 검사증 사본 업로드 (필수)\n\n변경된 절차는 2024년 2월 1일부터 적용됩니다.",
  },
]

const getStatusBadge = (status: Notice["status"]) => {
  const statusConfig = {
    게시중: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    예약됨: { color: "bg-blue-100 text-blue-800", icon: Clock },
    만료됨: { color: "bg-gray-100 text-gray-800", icon: AlertTriangle },
    초안: { color: "bg-yellow-100 text-yellow-800", icon: FileText },
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

const getPriorityBadge = (priority: Notice["priority"]) => {
  const priorityConfig = {
    일반: "bg-blue-100 text-blue-800",
    중요: "bg-yellow-100 text-yellow-800",
    긴급: "bg-red-100 text-red-800",
  }

  return <Badge className={priorityConfig[priority]}>{priority}</Badge>
}

export default function NoticesPage() {
  const [notices] = useState<Notice[]>(sampleNotices)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [selectedNotices, setSelectedNotices] = useState<number[]>([])

  // 공지사항 카테고리 목록
  const categories = Array.from(new Set(notices.map((notice) => notice.category)))

  // 필터링된 공지사항 목록
  const filteredNotices = notices.filter((notice) => {
    const matchesSearch =
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.author.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || notice.status === statusFilter
    const matchesCategory = categoryFilter === "all" || notice.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  // 통계 계산
  const stats = [
    {
      title: "전체 공지",
      value: notices.length.toString(),
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "게시중",
      value: notices.filter((n) => n.status === "게시중").length.toString(),
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "예약됨",
      value: notices.filter((n) => n.status === "예약됨").length.toString(),
      icon: <Clock className="h-4 w-4 text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "초안",
      value: notices.filter((n) => n.status === "초안").length.toString(),
      icon: <FileText className="h-4 w-4 text-yellow-600" />,
      color: "text-yellow-600",
    },
  ]

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotices(filteredNotices.map((n) => n.id))
    } else {
      setSelectedNotices([])
    }
  }

  // 개별 선택/해제
  const handleSelectNotice = (noticeId: number, checked: boolean) => {
    if (checked) {
      setSelectedNotices((prev) => [...prev, noticeId])
    } else {
      setSelectedNotices((prev) => prev.filter((id) => id !== noticeId))
    }
  }

  // 일괄 작업 처리
  const handleBulkAction = async (actionId: string) => {
    console.log("일괄 작업:", actionId, "선택된 공지:", selectedNotices)

    // 실제 구현에서는 서버 API 호출
    await new Promise((resolve) => setTimeout(resolve, 2000)) // 시뮬레이션

    if (actionId === "delete") {
      return {
        success: true,
        message: `${selectedNotices.length}개 공지가 삭제되었습니다.`,
      }
    }

    return { success: false, message: "알 수 없는 작업입니다." }
  }

  // 일괄 작업 정의
  const bulkActions = [
    {
      id: "delete",
      label: "삭제",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive" as const,
    },
  ]

  // 브레드크럼 데이터 수정
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "공지 관리" }]

  const actions = (
    <Link href="/admin/notices/add">
      <Button className="flex items-center gap-2">
        <Plus className="w-4 h-4" />
        공지 추가
      </Button>
    </Link>
  )

  return (
    <PageLayout
      title="공지 관리"
      description="시스템 공지사항을 관리합니다"
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
                placeholder="제목, 내용, 작성자로 검색..."
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
                <SelectItem value="게시중">게시중</SelectItem>
                <SelectItem value="예약됨">예약됨</SelectItem>
                <SelectItem value="만료됨">만료됨</SelectItem>
                <SelectItem value="초안">초안</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 카테고리</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <BulkActionBar
            selectedCount={selectedNotices.length}
            totalCount={filteredNotices.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedNotices([])}
          />

          {/* 공지사항 테이블 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedNotices.length === filteredNotices.length && filteredNotices.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead>카테고리</TableHead>
                  <TableHead>우선순위</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>작성자</TableHead>
                  <TableHead>조회수</TableHead>
                  <TableHead>작성일</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNotices.map((notice) => (
                  <TableRow key={notice.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedNotices.includes(notice.id)}
                        onCheckedChange={(checked) => handleSelectNotice(notice.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{notice.title}</TableCell>
                    <TableCell>{notice.category}</TableCell>
                    <TableCell>{getPriorityBadge(notice.priority)}</TableCell>
                    <TableCell>{getStatusBadge(notice.status)}</TableCell>
                    <TableCell>{notice.author}</TableCell>
                    <TableCell>{notice.views}</TableCell>
                    <TableCell>{notice.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedNotice(notice)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>공지사항 상세 정보</DialogTitle>
                            </DialogHeader>
                            {selectedNotice && (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-xl font-bold">{selectedNotice.title}</h3>
                                  <div className="flex items-center gap-2">
                                    {getPriorityBadge(selectedNotice.priority)}
                                    {getStatusBadge(selectedNotice.status)}
                                  </div>
                                </div>

                                <div className="flex justify-between text-sm text-gray-500">
                                  <div>
                                    작성자: {selectedNotice.author} | 카테고리: {selectedNotice.category} | 조회수:{" "}
                                    {selectedNotice.views}
                                  </div>
                                  <div>작성일: {selectedNotice.createdAt}</div>
                                </div>

                                {(selectedNotice.publishedAt || selectedNotice.expiresAt) && (
                                  <div className="flex gap-4 text-sm">
                                    {selectedNotice.publishedAt && (
                                      <div>
                                        <span className="font-medium">게시일:</span> {selectedNotice.publishedAt}
                                      </div>
                                    )}
                                    {selectedNotice.expiresAt && (
                                      <div>
                                        <span className="font-medium">만료일:</span> {selectedNotice.expiresAt}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="border-t pt-4 whitespace-pre-line">{selectedNotice.content}</div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="bg-red-50 text-red-700 border-red-200">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredNotices.length === 0 && (
            <div className="text-center py-8 text-gray-500">검색 조건에 맞는 공지사항이 없습니다.</div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  )
}
