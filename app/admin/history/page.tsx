import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileText, Download } from "lucide-react"
import { getAllEditHistory } from "@/app/actions/history-actions"
import AdminEditHistoryList from "@/components/admin-edit-history-list"
import Pagination from "@/components/pagination"

interface PageProps {
  searchParams: {
    page?: string
    limit?: string
  }
}

export default async function AdminHistoryPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1
  const limit = Number(searchParams.limit) || 10

  // 전체 수정 이력을 가져옵니다
  const { history, total, totalPages } = await getAllEditHistory(page, limit)

  return (
    <div className="min-h-screen bg-bgSecondary p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="mb-2">차량 정보 수정 이력</h2>
            <p className="text-contentSub">모든 차량의 정보 수정 이력을 확인할 수 있습니다.</p>
          </div>
          <Button className="btn-tertiary h-10">
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </Button>
        </div>

        <Card className="card mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-contentCaption" />
                <Input placeholder="차량번호, 성명으로 검색..." className="input pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="select w-[150px]">
                  <SelectValue placeholder="수정자 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="owner">차주</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="select w-[150px]">
                  <SelectValue placeholder="기간 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 기간</SelectItem>
                  <SelectItem value="today">오늘</SelectItem>
                  <SelectItem value="week">최근 7일</SelectItem>
                  <SelectItem value="month">최근 30일</SelectItem>
                </SelectContent>
              </Select>
              <Button className="btn-primary w-[100px]">검색</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardHeader>
            <CardTitle className="text-lg">수정 이력 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <>
                <AdminEditHistoryList history={history} />
                <div className="mt-6">
                  <Pagination currentPage={page} totalPages={totalPages} />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="bg-grey100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-grey500" />
                </div>
                <h3 className="text-lg font-medium mb-2">수정 이력이 없습니다</h3>
                <p className="text-contentSub">검색 조건에 맞는 수정 이력이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
