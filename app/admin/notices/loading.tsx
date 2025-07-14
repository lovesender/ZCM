import { PageLayout } from "@/components/page-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function NoticesLoading() {
  return (
    <PageLayout
      title="공지 관리"
      description="공지사항을 관리합니다"
      breadcrumbs={[
        { label: "홈", href: "/" },
        { label: "관리자", href: "/admin" },
        { label: "공지 관리", href: "/admin/notices" },
      ]}
    >
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </PageLayout>
  )
}
