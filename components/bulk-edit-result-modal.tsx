"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, AlertCircle, Download, X } from "lucide-react"

interface BulkEditResult {
  success: boolean
  totalCount: number
  successCount: number
  failedCount: number
  results: Array<{
    vehicleId: number
    vehicleNumber: string
    success: boolean
    error?: string
  }>
  message: string
}

interface BulkEditResultModalProps {
  result: BulkEditResult
  onClose: () => void
}

export default function BulkEditResultModal({ result, onClose }: BulkEditResultModalProps) {
  const handleDownloadReport = () => {
    // CSV 형태로 결과 다운로드
    const csvContent = [
      ["차량번호", "결과", "오류 메시지"],
      ...result.results.map((item) => [item.vehicleNumber, item.success ? "성공" : "실패", item.error || ""]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `bulk_edit_result_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="card w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">일괄 수정 결과</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 전체 결과 요약 */}
          <Alert className={result.success ? "bg-green50 border-green200" : "bg-orange50 border-orange200"}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange500" />
            )}
            <AlertTitle className={result.success ? "text-green800" : "text-orange800"}>
              {result.success ? "일괄 수정 완료" : "일괄 수정 부분 완료"}
            </AlertTitle>
            <AlertDescription className={result.success ? "text-green700" : "text-orange700"}>
              {result.message}
            </AlertDescription>
          </Alert>

          {/* 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue50 p-4 rounded-lg border border-blue200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue700">{result.totalCount}</div>
                <div className="text-sm text-blue600">총 대상</div>
              </div>
            </div>
            <div className="bg-green50 p-4 rounded-lg border border-green200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green700">{result.successCount}</div>
                <div className="text-sm text-green600">성공</div>
              </div>
            </div>
            <div className="bg-red50 p-4 rounded-lg border border-red200">
              <div className="text-center">
                <div className="text-2xl font-bold text-red700">{result.failedCount}</div>
                <div className="text-sm text-red600">실패</div>
              </div>
            </div>
          </div>

          {/* 상세 결과 */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">상세 결과</h3>
              <Button variant="outline" size="sm" onClick={handleDownloadReport} className="btn-tertiary">
                <Download className="h-4 w-4 mr-2" />
                결과 다운로드
              </Button>
            </div>

            <div className="border border-borderOutline rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>차량번호</TableHead>
                    <TableHead>결과</TableHead>
                    <TableHead>오류 메시지</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.results.map((item) => (
                    <TableRow key={item.vehicleId}>
                      <TableCell className="font-medium">{item.vehicleNumber}</TableCell>
                      <TableCell>
                        {item.success ? (
                          <Badge className="bg-green500 text-white">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            성공
                          </Badge>
                        ) : (
                          <Badge className="bg-red500 text-white">
                            <XCircle className="h-3 w-3 mr-1" />
                            실패
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-red600">{item.error || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button className="btn-primary" onClick={onClose}>
              확인
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
