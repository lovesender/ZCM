"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronUp, Clock, Eye } from "lucide-react"

interface HistoryItem {
  id: number
  vehicleId: number
  vehicleNumber: string
  changedFields: Record<string, { before: any; after: any }>
  reason: string
  editedAt: string
  editedBy: string
  editedByRole: string
}

interface AdminEditHistoryListProps {
  history: HistoryItem[]
}

export default function AdminEditHistoryList({ history }: AdminEditHistoryListProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // 필드명을 한글로 변환
  const getFieldLabel = (field: string) => {
    const fieldMap: Record<string, string> = {
      name: "성명",
      phone: "연락처",
      carNumber: "차량번호",
      carModel: "차종",
      carType: "차량 유형",
      branch: "지파",
      church: "교회/지역",
      department: "부서",
      status: "상태",
    }
    return fieldMap[field] || field
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const formattedDate = date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      const timeAgo = formatDistanceToNow(date, { addSuffix: true, locale: ko })
      return { formattedDate, timeAgo }
    } catch (error) {
      return { formattedDate: "날짜 오류", timeAgo: "" }
    }
  }

  // 수정자 역할에 따른 배지 색상
  const getRoleBadgeClass = (role: string) => {
    switch (role.toLowerCase()) {
      case "관리자":
        return "bg-purple100 text-purple700"
      case "차주":
        return "bg-blue100 text-blue700"
      default:
        return "bg-grey100 text-grey700"
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>차량번호</TableHead>
          <TableHead>수정 내용</TableHead>
          <TableHead>수정자</TableHead>
          <TableHead>수정일시</TableHead>
          <TableHead>작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((item) => {
          const { formattedDate, timeAgo } = formatDate(item.editedAt)
          const isExpanded = expandedItems[item.id] || false
          const changedFieldsCount = Object.keys(item.changedFields).length
          const changedFieldNames = Object.keys(item.changedFields).map(getFieldLabel).slice(0, 2).join(", ")
          const hasMoreFields = changedFieldsCount > 2

          return (
            <>
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.vehicleNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span>
                      {changedFieldNames}
                      {hasMoreFields ? ` 외 ${changedFieldsCount - 2}개` : ""} 수정
                    </span>
                    <Button variant="ghost" size="sm" className="ml-2 p-1 h-6 w-6" onClick={() => toggleItem(item.id)}>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeClass(item.editedByRole)}>
                    {item.editedBy} ({item.editedByRole})
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center text-sm">
                    <Clock className="h-3 w-3 mr-1" />
                    <span title={formattedDate}>{timeAgo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/admin/vehicles/${item.vehicleId}`}>
                      <Button className="btn-tertiary h-8 px-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
              {isExpanded && (
                <TableRow>
                  <TableCell colSpan={5} className="bg-bgSecondary">
                    <div className="p-4 space-y-4">
                      {/* 수정 사유 */}
                      {item.reason && (
                        <div className="bg-white p-3 rounded-lg border border-borderOutline">
                          <p className="text-sm">
                            <span className="font-medium">수정 사유:</span> {item.reason}
                          </p>
                        </div>
                      )}

                      {/* 변경 내용 */}
                      <div>
                        <h4 className="font-medium mb-3">변경 내용</h4>
                        <div className="bg-white rounded-lg border border-borderOutline overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>항목</TableHead>
                                <TableHead>변경 전</TableHead>
                                <TableHead>변경 후</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(item.changedFields).map(([field, { before, after }]) => (
                                <TableRow key={field}>
                                  <TableCell className="font-medium">{getFieldLabel(field)}</TableCell>
                                  <TableCell className="text-red500">{before}</TableCell>
                                  <TableCell className="text-green600">{after}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* 수정 정보 */}
                      <div className="text-sm text-contentSub mt-4">
                        <p>
                          {formattedDate}에 {item.editedBy}님이 수정함
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          )
        })}
      </TableBody>
    </Table>
  )
}
