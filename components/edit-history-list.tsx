"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronUp, Clock, Edit } from "lucide-react"

interface HistoryItem {
  id: number
  vehicleId: number
  changedFields: Record<string, { before: any; after: any }>
  reason: string
  editedAt: string
  editedBy: string
  editedByRole: string
}

interface EditHistoryListProps {
  history: HistoryItem[]
}

export default function EditHistoryList({ history }: EditHistoryListProps) {
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

  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-contentSub">수정 이력이 없습니다.</p>
        </div>
      ) : (
        history.map((item) => {
          const { formattedDate, timeAgo } = formatDate(item.editedAt)
          const isExpanded = expandedItems[item.id] || false
          const changedFieldsCount = Object.keys(item.changedFields).length

          return (
            <Card key={item.id} className="overflow-hidden">
              <div className="p-4 cursor-pointer hover:bg-bgSecondary" onClick={() => toggleItem(item.id)}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue50 p-2 rounded-lg">
                      <Edit className="h-5 w-5 text-blue500" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {changedFieldsCount}개 항목 수정됨
                        <Badge className="ml-2 bg-blue100 text-blue700">{item.editedByRole}</Badge>
                      </h3>
                      <div className="flex items-center text-sm text-contentSub mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span title={formattedDate}>{timeAgo}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleItem(item.id)
                    }}
                  >
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <CardContent className="pt-0">
                  <Separator className="my-4" />
                  <div className="space-y-4">
                    {/* 수정 사유 */}
                    {item.reason && (
                      <div className="bg-grey50 p-3 rounded-lg">
                        <p className="text-sm">
                          <span className="font-medium">수정 사유:</span> {item.reason}
                        </p>
                      </div>
                    )}

                    {/* 변경 내용 */}
                    <div>
                      <h4 className="font-medium mb-3">변경 내용</h4>
                      <div className="space-y-3">
                        {Object.entries(item.changedFields).map(([field, { before, after }]) => (
                          <div key={field} className="grid grid-cols-3 gap-4 text-sm">
                            <div className="font-medium">{getFieldLabel(field)}</div>
                            <div className="text-red500 line-through">{before}</div>
                            <div className="text-green600">{after}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 수정 정보 */}
                    <div className="text-sm text-contentSub mt-4">
                      <p>
                        {formattedDate}에 {item.editedBy}님이 수정함
                      </p>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })
      )}
    </div>
  )
}
