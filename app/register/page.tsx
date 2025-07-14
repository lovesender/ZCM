import { PageLayout } from "@/components/page-layout"
import { Card, CardContent } from "@/components/ui/card"
import RegisterForm from "@/components/register-form"
import { Car, FileText, Clock } from "lucide-react"

export default function RegisterPage() {
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "빠른 등록" }]

  const stats = [
    {
      title: "오늘 등록",
      value: "5",
      icon: <Car className="h-4 w-4 text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "이번 주 등록",
      value: "23",
      icon: <FileText className="h-4 w-4 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "평균 처리 시간",
      value: "2일",
      icon: <Clock className="h-4 w-4 text-purple-600" />,
      color: "text-purple-600",
    },
  ]

  return (
    <PageLayout
      title="차량 등록"
      description="새로운 차량을 등록하실 수 있습니다"
      breadcrumbs={breadcrumbs}
      stats={stats}
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
