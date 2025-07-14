import { PageLayout } from "@/components/page-layout"
import { Card, CardContent } from "@/components/ui/card"

export default function ApplicationsLoading() {
  const breadcrumbs = [{ label: "대시보드", href: "/" }, { label: "접수 관리" }]

  const stats = [
    {
      title: "대기 중",
      value: "...",
      icon: <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />,
      color: "text-yellow-600",
    },
    {
      title: "접수 완료",
      value: "...",
      icon: <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />,
      color: "text-blue-600",
    },
    {
      title: "승인 완료",
      value: "...",
      icon: <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />,
      color: "text-green-600",
    },
    {
      title: "반려",
      value: "...",
      icon: <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />,
      color: "text-red-600",
    },
  ]

  return (
    <PageLayout
      title="접수 관리"
      description="차량 등록 신청서를 검토하고 승인 처리하세요"
      breadcrumbs={breadcrumbs}
      stats={stats}
    >
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded"></div>
              <div className="w-40 h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
