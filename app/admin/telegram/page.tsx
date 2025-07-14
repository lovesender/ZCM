import type { Metadata } from "next"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import TelegramBotAdmin from "@/components/telegram-bot-admin"
import PageLayout from "@/components/page-layout"

export const metadata: Metadata = {
  title: "텔레그램 봇 관리 - 차량 관리 시스템",
  description: "텔레그램 봇 설정 및 관리",
}

export default function TelegramBotPage() {
  const breadcrumbs = [
    { href: "/", label: "홈" },
    { href: "/admin/settings", label: "시스템 관리" },
    { href: "/admin/telegram", label: "텔레그램 봇 관리" },
  ]

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                <BreadcrumbItem>
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold mb-6">텔레그램 봇 관리</h1>

        <div className="grid gap-6">
          <TelegramBotAdmin />
        </div>
      </div>
    </PageLayout>
  )
}
