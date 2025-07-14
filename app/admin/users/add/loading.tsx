import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { UserPlus } from "lucide-react"

export default function AddUserLoading() {
  return (
    <PageLayout
      title="사용자 추가"
      description="새로운 사용자를 시스템에 추가합니다"
      breadcrumbs={[
        { label: "홈", href: "/" },
        { label: "관리자", href: "/admin" },
        { label: "사용자 관리", href: "/admin/users" },
        { label: "사용자 추가", href: "/admin/users/add" },
      ]}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />새 사용자 정보 입력
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
              <div className="md:col-span-2 space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  )
}
