import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsHistoryLoading() {
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
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-24" />
                <Skeleton className="h-12 w-28" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
