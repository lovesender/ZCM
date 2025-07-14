"use client"

import { useState } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, HelpCircle, Book, Video, FileText } from "lucide-react"

// FAQ 데이터
const faqData = [
  {
    question: "차량 등록은 어떻게 하나요?",
    answer:
      "차량 등록은 메인 화면의 '차량 등록' 버튼을 클릭하여 시작할 수 있습니다. 차량 정보와 소유자 정보를 입력한 후 제출하면 관리자의 승인 후 등록이 완료됩니다.",
  },
  {
    question: "등록된 차량 정보를 수정하려면 어떻게 해야 하나요?",
    answer:
      "등록된 차량 정보는 '성도 차량' 메뉴에서 해당 차량을 찾아 수정할 수 있습니다. 차량 목록에서 수정하고자 하는 차량의 '편집' 버튼을 클릭하여 정보를 수정할 수 있습니다.",
  },
  {
    question: "차량 등록 승인은 얼마나 걸리나요?",
    answer:
      "차량 등록 승인은 일반적으로 1-2일 이내에 처리됩니다. 승인 상태는 '성도 차량' 메뉴에서 확인할 수 있으며, 승인이 완료되면 등록된 연락처로 알림이 발송됩니다.",
  },
  {
    question: "차량 정보를 삭제하려면 어떻게 해야 하나요?",
    answer:
      "차량 정보 삭제는 '성도 차량' 메뉴에서 해당 차량을 선택한 후 '삭제' 버튼을 클릭하여 진행할 수 있습니다. 삭제 후에는 복구가 불가능하니 신중하게 진행해 주세요.",
  },
  {
    question: "여러 대의 차량을 한 번에 등록할 수 있나요?",
    answer:
      "현재는 한 번에 한 대의 차량만 등록 가능합니다. 다만 관리자는 '일괄 관리' 기능을 통해 여러 차량을 한 번에 관리할 수 있습니다.",
  },
  {
    question: "차량 등록 시 어떤 정보가 필요한가요?",
    answer:
      "차량 등록 시 차량번호, 제조사, 모델명, 연식, 소유자 정보(이름, 연락처, 소속 지파/부서) 등의 정보가 필요합니다. 정확한 정보 입력이 중요합니다.",
  },
  {
    question: "시스템 접속 권한은 어떻게 얻을 수 있나요?",
    answer:
      "시스템 접속 권한은 관리자에게 요청하여 얻을 수 있습니다. 관리자는 사용자의 역할에 따라 적절한 권한을 부여합니다.",
  },
  {
    question: "비밀번호를 잊어버렸을 때는 어떻게 해야 하나요?",
    answer:
      "로그인 화면에서 '비밀번호 찾기' 링크를 클릭하여 등록된 이메일로 비밀번호 재설정 링크를 받을 수 있습니다. 이메일 접근이 불가능한 경우 관리자에게 문의하세요.",
  },
]

// 매뉴얼 데이터
const manualData = [
  {
    title: "사용자 가이드",
    description: "차량 관리 시스템의 기본 사용법을 안내합니다.",
    icon: Book,
    link: "#",
  },
  {
    title: "관리자 매뉴얼",
    description: "관리자를 위한 시스템 관리 방법을 설명합니다.",
    icon: FileText,
    link: "#",
  },
  {
    title: "차량 등록 가이드",
    description: "차량 등록 절차와 필요 정보를 안내합니다.",
    icon: FileText,
    link: "#",
  },
  {
    title: "통계 활용 가이드",
    description: "통계 데이터 활용 방법을 설명합니다.",
    icon: FileText,
    link: "#",
  },
]

// 비디오 튜토리얼 데이터
const videoData = [
  {
    title: "차량 등록 방법",
    description: "차량 등록 과정을 단계별로 안내합니다.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "3:45",
    link: "#",
  },
  {
    title: "관리자 대시보드 활용하기",
    description: "관리자 대시보드의 주요 기능을 소개합니다.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "5:20",
    link: "#",
  },
  {
    title: "통계 데이터 분석하기",
    description: "통계 데이터를 효과적으로 분석하는 방법을 안내합니다.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "4:15",
    link: "#",
  },
  {
    title: "일괄 관리 기능 사용하기",
    description: "여러 차량을 효율적으로 관리하는 방법을 설명합니다.",
    thumbnail: "/placeholder.svg?height=180&width=320",
    duration: "3:50",
    link: "#",
  },
]

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("faq")

  // FAQ 검색 필터링
  const filteredFaq = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // 브레드크럼 데이터
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "도움말" }]

  return (
    <PageLayout
      title="도움말 센터"
      description="차량 관리 시스템 사용에 관한 도움말과 가이드를 제공합니다"
      breadcrumbs={breadcrumbs}
    >
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="질문이나 키워드를 입력하세요..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="faq" className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            자주 묻는 질문
          </TabsTrigger>
          <TabsTrigger value="manuals" className="flex items-center gap-2">
            <Book className="w-4 h-4" />
            사용자 매뉴얼
          </TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            비디오 튜토리얼
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq">
          <Card>
            <CardHeader>
              <CardTitle>자주 묻는 질문 (FAQ)</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFaq.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaq.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-600">{faq.answer}</p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">검색 결과가 없습니다</h3>
                  <p className="mt-1 text-gray-500">다른 키워드로 검색해 보세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manuals">
          <Card>
            <CardHeader>
              <CardTitle>사용자 매뉴얼</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {manualData.map((manual, index) => {
                  const Icon = manual.icon
                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-medium">{manual.title}</h3>
                            <p className="text-gray-500 mt-1">{manual.description}</p>
                            <Button variant="link" className="p-0 h-auto mt-2">
                              매뉴얼 보기
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos">
          <Card>
            <CardHeader>
              <CardTitle>비디오 튜토리얼</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videoData.map((video, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs rounded">
                        {video.duration}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white bg-opacity-80 rounded-full p-3">
                          <Video className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-medium">{video.title}</h3>
                      <p className="text-gray-500 mt-1 text-sm">{video.description}</p>
                      <Button variant="link" className="p-0 h-auto mt-2">
                        비디오 보기
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
