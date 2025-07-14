import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AddNoticeLoading() {
  return (
    <PageLayout
      title="공지사항 추가"
      description="새로운 공지사항을 작성하고 등록합니다"
      breadcrumbs={[
        { label: "홈", href: "/" },
        { label: "관리자", href: "/admin" },
        { label: "공지 관리", href: "/admin/notices" },
        { label: "공지 추가", href: "/admin/notices/add" },
      ]}
    >
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Skeleton className="h-[200px] w-full" />

            <div className="flex justify-end space-x-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
