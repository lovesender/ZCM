"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit } from "lucide-react"

const BRANCHES = ["강남", "서초", "송파", "영등포", "마포"]

export default function BranchesPage() {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedBranches(BRANCHES)
    } else {
      setSelectedBranches([])
    }
  }

  const handleSelectBranch = (branchName: string, checked: boolean) => {
    if (checked) {
      setSelectedBranches((prev) => [...prev, branchName])
    } else {
      setSelectedBranches((prev) => prev.filter((name) => name !== branchName))
    }
  }

  const handleBulkAction = async (actionId: string, value?: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (actionId === "updateRegion") {
      return {
        success: true,
        message: `${selectedBranches.length}개 지파의 지역이 ${value}(으)로 변경되었습니다.`,
      }
    }

    return { success: false, message: "알 수 없는 작업입니다." }
  }

  const bulkActions = [
    {
      id: "updateRegion",
      label: "지역 변경",
      icon: <Edit className="w-4 h-4" />,
      requiresValue: true,
      options: [
        { value: "서울", label: "서울" },
        { value: "부산", label: "부산" },
      ],
    },
  ]

  return (
    <div className="container mx-auto py-10">
      <div className="rounded-md border">
        {/* 지파 목록 카드 내부에 BulkActionBar 추가 */}
        <BulkActionBar
          selectedCount={selectedBranches.length}
          totalCount={BRANCHES.length}
          actions={bulkActions}
          onAction={handleBulkAction}
          onClearSelection={() => setSelectedBranches([])}
        />
        <Table>
          <TableCaption>A list of your recent branches.</TableCaption>
          <TableHeader>
            <TableRow>
              {/* 테이블 헤더에 전체 선택 체크박스 추가 */}
              <TableHead className="w-12">
                <Checkbox checked={selectedBranches.length === BRANCHES.length} onCheckedChange={handleSelectAll} />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {BRANCHES.map((branch) => (
              <TableRow key={branch}>
                {/* 각 지파 행에 개별 체크박스 추가 */}
                <TableCell>
                  <Checkbox
                    checked={selectedBranches.includes(branch)}
                    onCheckedChange={(checked) => handleSelectBranch(branch, checked)}
                  />
                </TableCell>
                <TableCell>{branch}</TableCell>
                <TableCell>서울</TableCell>
                <TableCell className="text-right">Active</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
