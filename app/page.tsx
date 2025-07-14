"use client"

import { useState, useEffect, Suspense } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Car,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  MapPin,
  Plus,
} from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

// 대시보드 차트 컴포넌트를 동적으로 불러옵니다
const DashboardCharts = dynamic(() => import("@/components/dashboard-charts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            지파별 현황
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[600px] flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            지역별 현황
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[600px] flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            부서별 현황
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[600px] flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    </div>
  ),
})

// 샘플 데이터 (정적 데이터로 변경)
const recentVehicles = [
  {
    id: 1,
    plateNumber: "12가3456",
    model: "소나타",
    branch: "요한",
    status: "승인대기",
    registeredAt: "2024-01-15",
  },
  {
    id: 2,
    plateNumber: "34나5678",
    model: "아반떼",
    branch: "베드로",
    status: "승인완료",
    registeredAt: "2024-01-14",
  },
  {
    id: 3,
    plateNumber: "56다7890",
    model: "그랜저",
    branch: "부산야고보",
    status: "승인대기",
    registeredAt: "2024-01-13",
  },
]

const recentActivities = [
  {
    id: 1,
    type: "차량등록",
    description: "김사용자님이 새 차량을 등록했습니다.",
    time: "10분 전",
    icon: Car,
  },
  {
    id: 2,
    type: "승인완료",
    description: "차량번호 12가3456이 승인되었습니다.",
    time: "1시간 전",
    icon: CheckCircle,
  },
  {
    id: 3,
    type: "사용자등록",
    description: "새로운 사용자가 가입했습니다.",
    time: "2시간 전",
    icon: Users,
  },
]

const getStatusBadge = (status: string) => {
  const statusConfig = {
    승인대기: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    승인완료: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    반려: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.승인대기
  const Icon = config.icon

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status}
    </Badge>
  )
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 서버와 클라이언트 렌더링이 일치하도록 마운트 후에만 렌더링
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 브레드크럼 데이터
  const breadcrumbs = [{ label: "홈", href: "/" }]

  const stats = [
    {
      title: "전체 차량",
      value: "156",
      icon: <Car className="h-4 w-4 text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "승인 대기",
      value: "12",
      icon: <Clock className="h-4 w-4 text-yellow-600" />,
      color: "text-yellow-600",
    },
    {
      title: "활성 사용자",
      value: "89",
      icon: <Users className="h-4 w-4 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "이번 달 등록",
      value: "23",
      icon: <TrendingUp className="h-4 w-4 text-purple-600" />,
      color: "text-purple-600",
    },
  ]

  return (
    <PageLayout title="대시보드" description="차량 등록 현황을 한눈에 확인하세요" breadcrumbs={breadcrumbs}>
      <div className="mb-6 flex justify-end">
        <Link href="/register">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            차량 등록
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div>차트 로딩 중...</div>}>
        <DashboardCharts />
      </Suspense>

      {/* 최근 활동 내역 */}
      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">최근 활동 내역</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-gray-200">
            {recentActivities.map((activity) => (
              <li key={activity.id} className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <activity.icon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <div className="ml-auto text-sm text-gray-500">{activity.time}</div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card> */}

      {/* 최근 등록 차량 */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg">최근 등록 차량</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    차량 번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    모델
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    지파
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    등록일
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentVehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicle.plateNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.model}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getStatusBadge(vehicle.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.registeredAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}
    </PageLayout>
  )
}
