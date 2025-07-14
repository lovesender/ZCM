"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSettingsHistory } from "@/app/actions/settings-actions"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface SettingsHistoryItem {
  timestamp: string
  userId: string
  category: string
  changes: Record<string, { old: any; new: any }>
}

export default function SettingsHistoryPage() {
  const { toast } = useToast()
  const [history, setHistory] = useState<SettingsHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true)
        const data = await getSettingsHistory(50) // 최근 50개 항목 가져오기
        setHistory(data as any)
      } catch (error) {
        console.error("설정 이력을 불러오는 중 오류 발생:", error)
        toast({
          title: "이력 불러오기 실패",
          description: "설정 변경 이력을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [toast])

  // 카테고리 한글 이름
  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      general: "일반 설정",
      security: "보안 설정",
      database: "데이터베이스",
      mobile: "모바일 설정",
      notifications: "알림 설정",
    }
    return categories[category] || category
  }

  // 설정 키 한글 이름
  const getSettingName = (category: string, key: string) => {
    const settingNames: Record<string, Record<string, string>> = {
      general: {
        siteName: "사이트 이름",
        siteDescription: "사이트 설명",
        itemsPerPage: "페이지당 항목 수",
        defaultLanguage: "기본 언어",
        enableDarkMode: "다크 모드",
        enableOfflineMode: "오프라인 모드",
        autoLogout: "자동 로그아웃 시간",
      },
      security: {
        passwordExpiry: "비밀번호 만료 기간",
        loginAttempts: "최대 로그인 시도 횟수",
        sessionTimeout: "세션 타임아웃",
        requireTwoFactor: "2단계 인증 필수화",
        allowMultipleSessions: "다중 세션 허용",
        ipRestriction: "IP 제한",
      },
      // 다른 카테고리도 필요에 따라 추가
    }

    return settingNames[category]?.[key] || key
  }

  // 값 포맷팅
  const formatValue = (value: any) => {
    if (typeof value === "boolean") {
      return value ? "활성화" : "비활성화"
    }
    return value
  }

  // 브레드크럼 데이터
  const breadcrumbs = [
    { label: "홈", href: "/" },
    { label: "시스템 관리", href: "/admin/settings" },
    { label: "설정 변경 이력" },
  ]

  return (
    <PageLayout title="설정 변경 이력" description="시스템 설정 변경 이력을 확인합니다" breadcrumbs={breadcrumbs}>
      <Card>
        <CardHeader>
          <CardTitle>설정 변경 이력</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>이력을 불러오는 중...</p>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">설정 변경 이력이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜 및 시간</TableHead>
                    <TableHead>사용자</TableHead>
                    <TableHead>카테고리</TableHead>
                    <TableHead>변경 내용</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString("ko-KR")}
                      </TableCell>
                      <TableCell>{item.userId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryName(item.category)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {Object.entries(item.changes).map(([key, change], i) => (
                            <div key={i} className="text-sm">
                              <span className="font-medium">{getSettingName(item.category, key)}: </span>
                              <span className="line-through text-gray-500">{formatValue(change.old)}</span>
                              <span className="mx-2">→</span>
                              <span className="text-green-600">{formatValue(change.new)}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  )
}
