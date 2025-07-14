"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, PieChart, MapPin } from "lucide-react"

// 정적 데이터 (추가 정보 포함) - 지파명 수정 및 색상 코드 업데이트
const branchData = [
  { name: "요한", value: 45, color: "#009651", details: "전월 대비 +12%", members: 120, growth: "+5명" },
  { name: "베드로", value: 32, color: "#00a0e9", details: "전월 대비 +8%", members: 95, growth: "+3명" },
  { name: "부산야고보", value: 28, color: "#1d2088", details: "전월 대비 -2%", members: 88, growth: "-1명" },
  { name: "안드레", value: 25, color: "#59c3e1", details: "전월 대비 +15%", members: 75, growth: "+8명" },
  { name: "다대오", value: 20, color: "#eb6120", details: "전월 대비 +5%", members: 65, growth: "+2명" },
  { name: "빌립", value: 18, color: "#d7005b", details: "전월 대비 +3%", members: 60, growth: "+1명" },
  { name: "시몬", value: 16, color: "#fdd000", details: "전월 대비 -1%", members: 55, growth: "-1명" },
  { name: "바돌로매", value: 15, color: "#86cab6", details: "전월 대비 +7%", members: 50, growth: "+3명" },
  { name: "마태", value: 14, color: "#e39300", details: "전월 대비 +2%", members: 48, growth: "+1명" },
  { name: "맛디아", value: 12, color: "#6FBA2C", details: "전월 대비 +4%", members: 45, growth: "+2명" },
  { name: "서울야고보", value: 10, color: "#005dac", details: "전월 대비 +10%", members: 40, growth: "+4명" },
  { name: "도마", value: 8, color: "#7f1084", details: "전월 대비 +6%", members: 35, growth: "+2명" },
]

const departmentData = [
  { name: "총무부", value: 35, color: "#3b82f6", details: "행정 업무 담당", activeProjects: 8, budget: "2,500만원" },
  { name: "청년회", value: 28, color: "#10b981", details: "20-35세 청년층", activeProjects: 12, budget: "1,800만원" },
  { name: "부녀회", value: 22, color: "#f59e0b", details: "여성 신도 모임", activeProjects: 6, budget: "1,200만원" },
  { name: "장년회", value: 18, color: "#ef4444", details: "50세 이상 신도", activeProjects: 4, budget: "800만원" },
  { name: "기타", value: 47, color: "#8b5cf6", details: "기타 부서 통합", activeProjects: 15, budget: "3,200만원" },
]

const regionData = [
  { name: "본부", value: 42, color: "#3b82f6", details: "중앙 본부", population: 15000, area: "광주 동구" },
  { name: "광산", value: 35, color: "#10b981", details: "광산구 지역", population: 12000, area: "광주 광산구" },
  { name: "북구", value: 28, color: "#f59e0b", details: "북구 지역", population: 9500, area: "광주 북구" },
  { name: "담양", value: 25, color: "#ef4444", details: "담양군 지역", population: 8200, area: "전남 담양군" },
  { name: "장성", value: 20, color: "#8b5cf6", details: "장성군 지역", population: 6800, area: "전남 장성군" },
]

// 툴팁 컴포넌트
function Tooltip({
  show,
  x,
  y,
  content,
}: {
  show: boolean
  x: number
  y: number
  content: React.ReactNode
}) {
  if (!show) return null

  return (
    <div
      className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg pointer-events-none transition-opacity duration-200"
      style={{
        left: x + 10,
        top: y - 10,
        transform: "translateY(-100%)",
      }}
    >
      {content}
    </div>
  )
}

// 간단한 바 차트 컴포넌트 수정 - 스크롤 가능한 바 차트로 변경
function SimpleBarChart({ data, title, icon: Icon }: { data: any[]; title: string; icon: any }) {
  const [animate, setAnimate] = useState(false)
  const [tooltip, setTooltip] = useState<{
    show: boolean
    x: number
    y: number
    content: React.ReactNode
  }>({
    show: false,
    x: 0,
    y: 0,
    content: null,
  })
  const maxValue = Math.max(...data.map((item) => item.value))

  useEffect(() => {
    // 클라이언트 사이드에서만 애니메이션 활성화
    const timer = setTimeout(() => {
      setAnimate(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const handleMouseEnter = (event: React.MouseEvent, item: any) => {
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      content: (
        <div className="text-sm">
          <div className="font-semibold text-lg">{item.name}</div>
          <div className="text-blue-200">차량 수: {item.value}대</div>
        </div>
      ),
    })
  }

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: null })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip.show) {
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX,
        y: event.clientY,
      }))
    }
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <div className="h-full overflow-y-auto pr-2 space-y-4">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
              >
                <span className="text-sm font-medium text-gray-700 min-w-[80px]">{item.name}</span>
                <div className="flex items-center gap-3 flex-1 ml-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-6 rounded-full transition-all duration-1000 ease-out hover:brightness-110"
                      style={{
                        width: animate ? `${(item.value / maxValue) * 100}%` : "0%",
                        backgroundColor: item.color,
                        transitionDelay: `${index * 100}ms`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 min-w-[2rem]">{animate ? item.value : "0"}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Tooltip {...tooltip} />
    </>
  )
}

// 반응형 파이 차트 컴포넌트
function ResponsivePieChart({ data, title, icon: Icon }: { data: any[]; title: string; icon: any }) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const [animationProgress, setAnimationProgress] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltip, setTooltip] = useState<{
    show: boolean
    x: number
    y: number
    content: React.ReactNode
  }>({
    show: false,
    x: 0,
    y: 0,
    content: null,
  })
  const [chartSize, setChartSize] = useState({ width: 300, height: 300 }) // 기본값 설정
  const containerRef = useRef<HTMLDivElement>(null)

  // 화면 크기에 따라 차트 크기 조정 - 클라이언트 사이드에서만 실행
  useEffect(() => {
    const updateChartSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        // 컨테이너 너비에 따라 차트 크기 결정 (최소 250px, 최대 350px) - 크기 축소
        const size = Math.min(Math.max(containerWidth * 0.8, 250), 350)
        setChartSize({ width: size, height: size })
      }
    }

    // 초기 로드 시 크기 설정
    updateChartSize()

    // 화면 크기 변경 시 차트 크기 업데이트
    window.addEventListener("resize", updateChartSize)
    return () => window.removeEventListener("resize", updateChartSize)
  }, [])

  useEffect(() => {
    let start: number | null = null
    const duration = 1500

    const animate = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setAnimationProgress(progress)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    // 클라이언트 사이드에서만 애니메이션 실행
    if (typeof window !== "undefined") {
      const animationId = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationId)
    }
    return undefined
  }, [])

  const handleLegendMouseEnter = (event: React.MouseEvent, item: any, index: number) => {
    setHoveredIndex(index)
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      content: (
        <div className="text-sm">
          <div className="font-semibold text-lg">{item.name}</div>
          <div className="text-blue-200">차량 수: {item.value}대</div>
        </div>
      ),
    })
  }

  const handleLegendMouseLeave = () => {
    setHoveredIndex(null)
    setTooltip({ show: false, x: 0, y: 0, content: null })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip.show) {
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX,
        y: event.clientY,
      }))
    }
  }

  // 화면 크기에 따른 텍스트 크기 계산 - 더 큰 텍스트로 조정
  const getTitleSize = () => {
    if (chartSize.width < 300) return "text-2xl"
    return "text-3xl"
  }

  const getSubtitleSize = () => {
    if (chartSize.width < 300) return "text-xs"
    return "text-sm"
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className="h-5 w-5 text-purple-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent ref={containerRef} className="h-[600px] flex flex-col">
          <div className="flex-shrink-0 flex items-center justify-center pt-4">
            <div
              className="relative"
              style={{
                width: `${chartSize.width}px`,
                height: `${chartSize.height}px`,
                maxWidth: "100%",
              }}
            >
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {data.map((item, index) => {
                  const percentage = (item.value / total) * 100
                  const previousPercentages = data
                    .slice(0, index)
                    .reduce((sum, prev) => sum + (prev.value / total) * 100, 0)
                  const strokeDasharray = `${percentage * animationProgress} ${100 - percentage * animationProgress}`
                  const strokeDashoffset = -previousPercentages * animationProgress

                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="15.915"
                      fill="transparent"
                      stroke={item.color}
                      strokeWidth={hoveredIndex === index ? "10" : "8"}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-300 cursor-pointer"
                      style={{
                        filter: hoveredIndex === index ? "brightness(1.2)" : "brightness(1)",
                      }}
                    />
                  )
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className={`font-bold text-gray-700 ${getTitleSize()}`}>
                    {Math.round(total * animationProgress)}
                  </span>
                  <div className={`text-gray-500 ${getSubtitleSize()}`}>총 인원</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 mt-6 space-y-2">
            {data.map((item, index) => {
              const animatedValue = Math.round(item.value * animationProgress)
              const animatedPercentage = Math.round((item.value / total) * 100 * animationProgress)

              return (
                <div
                  key={index}
                  className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-50 transition-colors duration-200"
                  onMouseEnter={(e) => handleLegendMouseEnter(e, item, index)}
                  onMouseLeave={handleLegendMouseLeave}
                  onMouseMove={handleMouseMove}
                  style={{
                    backgroundColor: hoveredIndex === index ? `${item.color}10` : "transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: item.color,
                        transform: animationProgress > 0.1 ? "scale(1)" : "scale(0)",
                        transitionDelay: `${index * 100}ms`,
                        boxShadow: hoveredIndex === index ? `0 0 8px ${item.color}50` : "none",
                      }}
                    />
                    <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {animatedValue} ({animatedPercentage}%)
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      <Tooltip {...tooltip} />
    </>
  )
}

// 지역 차트에 특별한 애니메이션 효과 추가
function AnimatedRegionChart({ data, title, icon: Icon }: { data: any[]; title: string; icon: any }) {
  const maxValue = Math.max(...data.map((item) => item.value))
  const [animate, setAnimate] = useState(false)
  const [tooltip, setTooltip] = useState<{
    show: boolean
    x: number
    y: number
    content: React.ReactNode
  }>({
    show: false,
    x: 0,
    y: 0,
    content: null,
  })

  useEffect(() => {
    // 클라이언트 사이드에서만 애니메이션 활성화
    const timer = setTimeout(() => {
      setAnimate(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const handleMouseEnter = (event: React.MouseEvent, item: any) => {
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      content: (
        <div className="text-sm">
          <div className="font-semibold text-lg">{item.name}</div>
          <div className="text-blue-200">차량 수: {item.value}대</div>
        </div>
      ),
    })
  }

  const handleMouseLeave = () => {
    setTooltip({ show: false, x: 0, y: 0, content: null })
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip.show) {
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX,
        y: event.clientY,
      }))
    }
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className="h-5 w-5 text-green-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <div className="h-full overflow-y-auto pr-2 space-y-8">
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between cursor-pointer"
                onMouseEnter={(e) => handleMouseEnter(e, item)}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
              >
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <div className="flex items-center gap-3 flex-1 ml-4">
                  <div className="flex-1 bg-gray-200 rounded-lg h-10 overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-1000 ease-out flex items-center justify-end pr-2 hover:brightness-110 hover:shadow-lg"
                      style={{
                        width: animate ? `${(item.value / maxValue) * 100}%` : "0%",
                        backgroundColor: item.color,
                        transitionDelay: `${index * 100}ms`,
                      }}
                    >
                      {animate && <span className="text-sm font-medium text-white drop-shadow">{item.value}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Tooltip {...tooltip} />
    </>
  )
}

export default function DashboardCharts() {
  // 서버와 클라이언트 렌더링 불일치 해결을 위해 useEffect 내에서 상태 변경 대신
  // 컴포넌트 자체를 바로 반환
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-1">
        <SimpleBarChart data={branchData} title="지파별 현황" icon={BarChart3} />
      </div>
      <div className="lg:col-span-1">
        <AnimatedRegionChart data={regionData} title="지역별 현황" icon={MapPin} />
      </div>
      <div className="lg:col-span-1">
        <ResponsivePieChart data={departmentData} title="부서별 현황" icon={PieChart} />
      </div>
    </div>
  )
}
