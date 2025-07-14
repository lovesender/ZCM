import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemComponent,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface Stat {
  title: string
  value: string
  icon: ReactNode
  color?: string // color를 optional로 변경
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageLayoutProps {
  title: string
  description?: string
  children: ReactNode
  stats?: Stat[]
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode // actions prop 추가
}

export function PageLayout({ title, description, children, stats, breadcrumbs, actions }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 ml-64">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브레드크럼 */}
        {breadcrumbs && (
          <div className="mb-6">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItemComponent>
                      {item.href ? (
                        <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItemComponent>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        )}

        {/* 헤더 */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {description && <p className="mt-2 text-gray-600">{description}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>

        {/* 통계 카드 */}
        {stats && (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(stats.length, 4)} gap-6 mb-8 ${title === "차량 등록" ? "justify-center max-w-3xl mx-auto" : ""}`}
          >
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 메인 콘텐츠 */}
        {children}
      </div>
    </div>
  )
}

// 기존 named export는 유지하면서 default export 추가
export default PageLayout
