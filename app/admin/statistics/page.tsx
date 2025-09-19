"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts"
import {
  CalendarIcon,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  Users,
  Car,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
} from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { BRANCHES } from "@/app/config/branches"

// 통계 데이터 타입 정의
interface VehicleStats {
  totalVehicles: number
  activeVehicles: number
  pendingApproval: number
  maintenanceRequired: number
  byBranch: { branch: string; count: number; percentage: number }[]
  byType: { type: string; count: number; percentage: number }[]
  byStatus: { status: string; count: number; percentage: number }[]
  monthlyRegistrations: { month: string; count: number }[]
  dailyActivity: { date: string; registrations: number; updates: number }[]
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  adminUsers: number
  byBranch: { branch: string; count: number }[]
  byRole: { role: string; count: number }[]
  loginActivity: { date: string; logins: number }[]
}

interface SystemStats {
  totalRequests: number
  successRate: number
  averageResponseTime: number
  errorRate: number
  uptime: number
  storageUsed: number
  storageTotal: number
}

// 색상 팔레트
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  })
  const [selectedBranch, setSelectedBranch] = useState<string>("전체")
  const [isLoading, setIsLoading] = useState(false)
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // 모의 데이터 생성
  const generateMockData = () => {
    const mockVehicleStats: VehicleStats = {
      totalVehicles: 1247,
      activeVehicles: 1156,
      pendingApproval: 45,
      maintenanceRequired: 46,
      byBranch: BRANCHES.map((branch, index) => ({
        branch,
        count: Math.floor(Math.random() * 200) + 50,
        percentage: Math.floor(Math.random() * 20) + 5,
      })),
      byType: [
        { type: "승용차", count: 687, percentage: 55.1 },
        { type: "SUV", count: 312, percentage: 25.0 },
        { type: "승합차", count: 156, percentage: 12.5 },
        { type: "화물차", count: 67, percentage: 5.4 },
        { type: "기타", count: 25, percentage: 2.0 },
      ],
      byStatus: [
        { status: "활성", count: 1156, percentage: 92.7 },
        { status: "대기", count: 45, percentage: 3.6 },
        { status: "정비중", count: 46, percentage: 3.7 },
      ],
      monthlyRegistrations: Array.from({ length: 12 }, (_, i) => ({
        month: `${i + 1}월`,
        count: Math.floor(Math.random() * 100) + 20,
      })),
      dailyActivity: Array.from({ length: 30 }, (_, i) => ({
        date: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), "MM/dd"),
        registrations: Math.floor(Math.random() * 20) + 1,
        updates: Math.floor(Math.random() * 50) + 5,
      })).reverse(),
    }

    const mockUserStats: UserStats = {
      totalUsers: 342,
      activeUsers: 298,
      pendingUsers: 23,
      adminUsers: 21,
      byBranch: BRANCHES.map((branch) => ({
        branch,
        count: Math.floor(Math.random() * 50) + 10,
      })),
      byRole: [
        { role: "관리자", count: 21 },
        { role: "사용자", count: 298 },
        { role: "뷰어", count: 23 },
      ],
      loginActivity: Array.from({ length: 7 }, (_, i) => ({
        date: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), "MM/dd"),
        logins: Math.floor(Math.random() * 100) + 20,
      })).reverse(),
    }

    const mockSystemStats: SystemStats = {
      totalRequests: 45678,
      successRate: 99.2,
      averageResponseTime: 245,
      errorRate: 0.8,
      uptime: 99.9,
      storageUsed: 2.4,
      storageTotal: 10.0,
    }

    setVehicleStats(mockVehicleStats)
    setUserStats(mockUserStats)
    setSystemStats(mockSystemStats)
  }

  // 데이터 로드
  const loadStatistics = async () => {
    setIsLoading(true)
    try {
      // 실제 API 호출 대신 모의 데이터 사용
      await new Promise((resolve) => setTimeout(resolve, 1000))
      generateMockData()
    } catch (error) {
      console.error("통계 데이터 로드 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
  }, [dateRange, selectedBranch])

  // 데이터 내보내기
  const exportData = (format: "csv" | "excel") => {
    console.log(`${format} 형식으로 데이터 내보내기`)
    // 실제 구현에서는 데이터를 해당 형식으로 변환하여 다운로드
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>통계 데이터를 불러오는 중...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">통계 대시보드</h1>
          <p className="text-gray-600 mt-1">차량 관리 시스템 통계 및 분석</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadStatistics()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
          <Button variant="outline" onClick={() => exportData("csv")}>
            <Download className="h-4 w-4 mr-2" />
            CSV 내보내기
          </Button>
          <Button variant="outline" onClick={() => exportData("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Excel 내보내기
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            필터 설정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>기간 선택</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from && dateRange.to
                      ? `${format(dateRange.from, "yyyy-MM-dd", { locale: ko })} ~ ${format(dateRange.to, "yyyy-MM-dd", { locale: ko })}`
                      : "기간을 선택하세요"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange.from, to: dateRange.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to })
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>지파 선택</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="지파를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="전체">전체</SelectItem>
                  {BRANCHES.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>통계 유형</Label>
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">전체 개요</SelectItem>
                  <SelectItem value="vehicles">차량 통계</SelectItem>
                  <SelectItem value="users">사용자 통계</SelectItem>
                  <SelectItem value="system">시스템 통계</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            전체 개요
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center">
            <Car className="h-4 w-4 mr-2" />
            차량 통계
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            사용자 통계
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            시스템 통계
          </TabsTrigger>
        </TabsList>

        {/* 전체 개요 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 차량 수</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicleStats?.totalVehicles.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% 전월 대비
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 차량</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicleStats?.activeVehicles.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% 전월 대비
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 사용자 수</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +5% 전월 대비
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">시스템 가동률</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.uptime}%</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    정상 운영 중
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 주요 차트 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>월별 차량 등록 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehicleStats?.monthlyRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0088FE" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>지파별 차량 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vehicleStats?.byBranch.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ branch, percentage }) => `${branch} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {vehicleStats?.byBranch.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 차량 통계 */}
        <TabsContent value="vehicles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 차량</CardTitle>
                <Car className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicleStats?.totalVehicles}</div>
                <Progress value={100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 차량</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicleStats?.activeVehicles}</div>
                <Progress
                  value={vehicleStats ? (vehicleStats.activeVehicles / vehicleStats.totalVehicles) * 100 : 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicleStats?.pendingApproval}</div>
                <Progress
                  value={vehicleStats ? (vehicleStats.pendingApproval / vehicleStats.totalVehicles) * 100 : 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">정비 필요</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicleStats?.maintenanceRequired}</div>
                <Progress
                  value={vehicleStats ? (vehicleStats.maintenanceRequired / vehicleStats.totalVehicles) * 100 : 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>차량 유형별 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vehicleStats?.byType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {vehicleStats?.byType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>일별 활동 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={vehicleStats?.dailyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="registrations" stroke="#0088FE" name="신규 등록" />
                    <Line type="monotone" dataKey="updates" stroke="#00C49F" name="정보 수정" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 사용자 통계 */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.totalUsers}</div>
                <Progress value={100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.activeUsers}</div>
                <Progress
                  value={userStats ? (userStats.activeUsers / userStats.totalUsers) * 100 : 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.pendingUsers}</div>
                <Progress
                  value={userStats ? (userStats.pendingUsers / userStats.totalUsers) * 100 : 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">관리자</CardTitle>
                <Badge variant="secondary">{userStats?.adminUsers}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.adminUsers}</div>
                <Progress
                  value={userStats ? (userStats.adminUsers / userStats.totalUsers) * 100 : 0}
                  className="mt-2"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>역할별 사용자 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userStats?.byRole}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>일별 로그인 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userStats?.loginActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="logins" stroke="#FFBB28" fill="#FFBB28" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 시스템 통계 */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 요청 수</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.totalRequests.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">지난 30일</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">성공률</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.successRate}%</div>
                <Progress value={systemStats?.successRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 응답시간</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.averageResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">목표: 300ms 이하</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">오류율</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemStats?.errorRate}%</div>
                <Progress value={systemStats?.errorRate} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>시스템 상태</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">시스템 가동률</span>
                  <Badge variant="secondary">{systemStats?.uptime}%</Badge>
                </div>
                <Progress value={systemStats?.uptime} />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">성공률</span>
                  <Badge variant="secondary">{systemStats?.successRate}%</Badge>
                </div>
                <Progress value={systemStats?.successRate} />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">응답 시간</span>
                  <Badge variant="secondary">{systemStats?.averageResponseTime}ms</Badge>
                </div>
                <Progress value={systemStats ? Math.max(0, 100 - systemStats.averageResponseTime / 10) : 0} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>저장소 사용량</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">사용량</span>
                  <span className="text-sm text-muted-foreground">
                    {systemStats?.storageUsed}GB / {systemStats?.storageTotal}GB
                  </span>
                </div>
                <Progress value={systemStats ? (systemStats.storageUsed / systemStats.storageTotal) * 100 : 0} />

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    저장소 사용량이{" "}
                    {systemStats ? Math.round((systemStats.storageUsed / systemStats.storageTotal) * 100) : 0}%입니다.
                    80% 초과 시 정리가 필요합니다.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
