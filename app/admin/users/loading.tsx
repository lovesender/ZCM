import { PageLayout } from "@/components/page-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function UsersLoading() {
  return (
    <PageLayout
      title="사용자 관리"
      description="시스템 사용자를 관리합니다"
      breadcrumbs={[
        { label: "홈", href: "/" },
        { label: "관리자", href: "/admin" },
        { label: "사용자 관리", href: "/admin/users" },
      ]}
    >
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-[500px] w-full" />
      </div>
    </PageLayout>
  )
}
