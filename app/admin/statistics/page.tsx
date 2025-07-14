"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { Download, Search, TrendingUp, TrendingDown, Users, Car, BarChart3, PieChartIcon, Activity } from "lucide-react"

// 지파별 상세 데이터
const detailedBranchData = [
  {
    name: "요한",
    vehicles: 45,
    users: 12,
    pending: 3,
    approved: 42,
    rejected: 0,
    growth: 12.5,
    lastMonthVehicles: 40,
    departments: ["총무부", "교육부", "청년회", "장년회"],
  },
  {
    name: "베드로",
    vehicles: 38,
    users: 10,
    pending: 2,
    approved: 36,
    rejected: 0,
    growth: 8.6,
    lastMonthVehicles: 35,
    departments: ["행정서무부", "전도부", "부녀회"],
  },
  {
    name: "부산야고보",
    vehicles: 52,
    users: 15,
    pending: 4,
    approved: 47,
    rejected: 1,
    growth: 18.2,
    lastMonthVehicles: 44,
    departments: ["기획부", "문화부", "학생회", "찬양부"],
  },
  {
    name: "안드레",
    vehicles: 29,
    users: 8,
    pending: 1,
    approved: 28,
    rejected: 0,
    growth: 3.6,
    lastMonthVehicles: 28,
    departments: ["재정부", "홍보부"],
  },
  {
    name: "다대오",
    vehicles: 41,
    users: 11,
    pending: 2,
    approved: 38,
    rejected: 1,
    growth: 13.9,
    lastMonthVehicles: 36,
    departments: ["내무부", "체육부", "봉사교통부"],
  },
  {
    name: "빌립",
    vehicles: 33,
    users: 9,
    pending: 1,
    approved: 32,
    rejected: 0,
    growth: 6.5,
    lastMonthVehicles: 31,
    departments: ["전도부", "해외선교부"],
  },
  {
    name: "시몬",
    vehicles: 27,
    users: 7,
    pending: 0,
    approved: 27,
    rejected: 0,
    growth: -3.6,
    lastMonthVehicles: 28,
    departments: ["법무부", "감사부"],
  },
  {
    name: "바돌로매",
    vehicles: 35,
    users: 9,
    pending: 2,
    approved: 33,
    rejected: 0,
    growth: 16.7,
    lastMonthVehicles: 30,
    departments: ["건설부", "사업부"],
  },
  {
    name: "마태",
    vehicles: 42,
    users: 12,
    pending: 3,
    approved: 39,
    rejected: 0,
    growth: 10.5,
    lastMonthVehicles: 38,
    departments: ["정보통신부", "출판부", "유년회"],
  },
  {
    name: "맛디아",
    vehicles: 31,
    users: 8,
    pending: 1,
    approved: 30,
    rejected: 0,
    growth: 7.0,
    lastMonthVehicles: 29,
    departments: ["섭외부", "국내선교부"],
  },
  {
    name: "서울야고보",
    vehicles: 48,
    users: 13,
    pending: 3,
    approved: 44,
    rejected: 1,
    growth: 20.0,
    lastMonthVehicles: 40,
    departments: ["보건후생복지부", "외교정책부", "자문회"],
  },
  {
    name: "도마",
    vehicles: 39,
    users: 10,
    pending: 2,
    approved: 37,
    rejected: 0,
    growth: 8.3,
    lastMonthVehicles: 36,
    departments: ["신학부", "교육부"],
  },
]

// 부서별 상세 데이터
const detailedDepartmentData = [
  { name: "총무부", vehicles: 42, users: 8, branches: ["요한", "베드로"], growth: 15.2, color: "#8884d8" },
  { name: "행정서무부", vehicles: 38, users: 7, branches: ["베드로", "안드레"], growth: 12.8, color: "#83a6ed" },
  { name: "장년회", vehicles: 34, users: 12, branches: ["요한", "마태", "도마"], growth: 8.9, color: "#8dd1e1" },
  { name: "청년회", vehicles: 30, users: 15, branches: ["요한", "부산야고보"], growth: 22.4, color: "#82ca9d" },
  { name: "학생회", vehicles: 28, users: 18, branches: ["부산야고보", "서울야고보"], growth: 25.0, color: "#a4de6c" },
  { name: "기획부", vehicles: 25, users: 6, branches: ["부산야고보", "다대오"], growth: 4.2, color: "#d0ed57" },
  { name: "재정부", vehicles: 22, users: 5, branches: ["안드레", "맛디아"], growth: 10.0, color: "#ffc658" },
  { name: "교육부", vehicles: 20, users: 9, branches: ["요한", "도마"], growth: 11.1, color: "#ff8042" },
  { name: "전도부", vehicles: 18, users: 7, branches: ["베드로", "빌립"], growth: 5.9, color: "#0088fe" },
  { name: "문화부", vehicles: 16, users: 8, branches: ["부산야고보", "마태"], growth: 14.3, color: "#00c49f" },
  { name: "찬양부", vehicles: 15, users: 10, branches: ["부산야고보", "서울야고보"], growth: 7.1, color: "#ffbb28" },
  { name: "홍보부", vehicles: 14, users: 4, branches: ["안드레", "바돌로매"], growth: 16.7, color: "#ff8042" },
  { name: "체육부", vehicles: 12, users: 6, branches: ["다대오", "시몬"], growth: 9.1, color: "#8884d8" },
  { name: "봉사교통부", vehicles: 10, users: 5, branches: ["다대오", "서울야고보"], growth: 25.0, color: "#83a6ed" },
  { name: "내무부", vehicles: 9, users: 3, branches: ["다대오"], growth: -10.0, color: "#8dd1e1" },
]

// 월별 추이 데이터
const monthlyTrendData = [
  { month: "1월", 요한: 35, 베드로: 30, 부산야고보: 40, 안드레: 25, 다대오: 32, 빌립: 28 },
  { month: "2월", 요한: 38, 베드로: 32, 부산야고보: 42, 안드레: 26, 다대오: 34, 빌립: 29 },
  { month: "3월", 요한: 40, 베드로: 35, 부산야고보: 44, 안드레: 28, 다대오: 36, 빌립: 31 },
  { month: "4월", 요한: 42, 베드로: 36, 부산야고보: 47, 안드레: 28, 다대오: 38, 빌립: 32 },
  { month: "5월", 요한: 44, 베드로: 37, 부산야고보: 50, 안드레: 29, 다대오: 40, 빌립: 33 },
  { month: "6월", 요한: 45, 베드로: 38, 부산야고보: 52, 안드레: 29, 다대오: 41, 빌립: 33 },
]

export default function StatisticsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("vehicles")
  const [filterBy, setFilterBy] = useState("all")
  const [activeTab, setActiveTab] = useState("branches")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 필터링 및 정렬 로직
  const filteredBranchData = detailedBranchData
    .filter(
      (branch) =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterBy === "all" ||
          (filterBy === "high-growth" && branch.growth > 10) ||
          (filterBy === "low-growth" && branch.growth <= 10)),
    )
    .sort((a, b) => {
      if (sortBy === "vehicles") return b.vehicles - a.vehicles
      if (sortBy === "users") return b.users - a.users
      if (sortBy === "growth") return b.growth - a.growth
      return a.name.localeCompare(b.name)
    })

  const filteredDepartmentData = detailedDepartmentData
    .filter(
      (dept) =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterBy === "all" ||
          (filterBy === "high-growth" && dept.growth > 10) ||
          (filterBy === "low-growth" && dept.growth <= 10)),
    )
    .sort((a, b) => {
      if (sortBy === "vehicles") return b.vehicles - a.vehicles
      if (sortBy === "users") return b.users - a.users
      if (sortBy === "growth") return b.growth - a.growth
      return a.name.localeCompare(b.name)
    })

  const stats = [
    {
      title: "총 지파 수",
      value: "12",
      icon: <BarChart3 className="h-4 w-4 text-blue-600" />,
      color: "text-blue-600",
    },
    {
      title: "총 부서 수",
      value: "30",
      icon: <PieChartIcon className="h-4 w-4 text-purple-600" />,
      color: "text-purple-600",
    },
    {
      title: "평균 성장률",
      value: "11.2%",
      icon: <TrendingUp className="h-4 w-4 text-green-600" />,
      color: "text-green-600",
    },
    {
      title: "활성 조직",
      value: "42",
      icon: <Activity className="h-4 w-4 text-orange-600" />,
      color: "text-orange-600",
    },
  ]

  const actions = (
    <div className="flex gap-2">
      <Button variant="outline" className="flex items-center gap-2 bg-transparent">
        <Download className="w-4 h-4" />
        Excel 다운로드
      </Button>
      <Button variant="outline" className="flex items-center gap-2 bg-transparent">
        <Download className="w-4 h-4" />
        PDF 다운로드
      </Button>
    </div>
  )

  // 브레드크럼 데이터
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "통계" }]

  return (
    <PageLayout
      title="통계 대시보드"
      description="차량 등록 현황 및 통계를 확인합니다"
      breadcrumbs={breadcrumbs}
      stats={stats}
      actions={actions}
    >
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>월별 차량 등록 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyTrendData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="요한" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="베드로" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="부산야고보" stackId="1" stroke="#ffc658" fill="#ffc658" />
                <Area type="monotone" dataKey="안드레" stackId="1" stroke="#ff8042" fill="#ff8042" />
                <Area type="monotone" dataKey="다대오" stackId="1" stroke="#0088fe" fill="#0088fe" />
                <Area type="monotone" dataKey="빌립" stackId="1" stroke="#00c49f" fill="#00c49f" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 보기</SelectItem>
              <SelectItem value="high-growth">높은 성장률 (>10%)</SelectItem>
              <SelectItem value="low-growth">낮은 성장률 (≤10%)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vehicles">차량 수</SelectItem>
              <SelectItem value="users">사용자 수</SelectItem>
              <SelectItem value="growth">성장률</SelectItem>
              <SelectItem value="name">이름</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="branches" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            지파별 통계
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            부서별 통계
          </TabsTrigger>
        </TabsList>

        <TabsContent value="branches">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>지파별 차량 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={filteredBranchData.slice(0, 6)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 60]} />
                      <Radar name="차량 수" dataKey="vehicles" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="사용자 수" dataKey="users" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>지파별 상세 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          지파
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          차량 수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자 수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          성장률
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBranchData.map((branch) => (
                        <tr key={branch.name}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {branch.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-gray-400" />
                              {branch.vehicles}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              {branch.users}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge
                              className={`flex items-center gap-1 ${
                                branch.growth > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {branch.growth > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {branch.growth > 0 ? "+" : ""}
                              {branch.growth}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>부서별 차량 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={filteredDepartmentData.slice(0, 6)}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <PolarRadiusAxis angle={30} domain={[0, 50]} />
                      <Radar name="차량 수" dataKey="vehicles" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Radar name="사용자 수" dataKey="users" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>부서별 상세 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          부서
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          차량 수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          사용자 수
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          성장률
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredDepartmentData.map((dept) => (
                        <tr key={dept.name}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-gray-400" />
                              {dept.vehicles}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-400" />
                              {dept.users}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Badge
                              className={`flex items-center gap-1 ${
                                dept.growth > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {dept.growth > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {dept.growth > 0 ? "+" : ""}
                              {dept.growth}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
