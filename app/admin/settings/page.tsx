"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Bell, Shield, Database, Smartphone, MessageSquare, Download, Upload } from "lucide-react"
import NotificationSettings from "@/components/notification-settings"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  getGeneralSettings,
  getSecuritySettings,
  getDatabaseSettings,
  getMobileSettings,
  saveGeneralSettings,
  saveSecuritySettings,
  saveDatabaseSettings,
  saveMobileSettings,
  exportSettings,
  importSettings,
  type GeneralSettings,
  type SecuritySettings,
  type DatabaseSettings,
  type MobileSettings,
} from "@/app/actions/settings-actions"

export default function SettingsPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 일반 설정 상태
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: "차량 관리 시스템",
    siteDescription: "교회 차량 관리를 위한 통합 시스템",
    itemsPerPage: "10",
    defaultLanguage: "ko",
    enableDarkMode: true,
    enableOfflineMode: true,
    autoLogout: "30",
  })

  // 보안 설정 상태
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    passwordExpiry: "90",
    loginAttempts: "5",
    sessionTimeout: "30",
    requireTwoFactor: false,
    allowMultipleSessions: true,
    ipRestriction: false,
  })

  // 데이터베이스 설정 상태
  const [databaseSettings, setDatabaseSettings] = useState<DatabaseSettings>({
    backupFrequency: "daily",
    retentionPeriod: "30",
    compressionEnabled: true,
    encryptBackups: true,
    autoOptimize: true,
  })

  // 모바일 설정 상태
  const [mobileSettings, setMobileSettings] = useState<MobileSettings>({
    enablePushNotifications: true,
    enableLocationServices: false,
    cacheSize: "100",
    imageQuality: "medium",
    enableOfflineEditing: true,
  })

  // 설정 불러오기
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)

        const [general, security, database, mobile] = await Promise.all([
          getGeneralSettings(),
          getSecuritySettings(),
          getDatabaseSettings(),
          getMobileSettings(),
        ])

        setGeneralSettings(general)
        setSecuritySettings(security)
        setDatabaseSettings(database)
        setMobileSettings(mobile)
      } catch (error) {
        console.error("설정을 불러오는 중 오류 발생:", error)
        toast({
          title: "설정 불러오기 실패",
          description: "설정을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  // 설정 저장 핸들러
  const handleSaveSettings = async () => {
    setIsSubmitting(true)

    try {
      let result

      switch (activeTab) {
        case "general":
          result = await saveGeneralSettings(generalSettings)
          break
        case "security":
          result = await saveSecuritySettings(securitySettings)
          break
        case "database":
          result = await saveDatabaseSettings(databaseSettings)
          break
        case "mobile":
          result = await saveMobileSettings(mobileSettings)
          break
        default:
          // 알림 설정은 해당 컴포넌트에서 처리
          return
      }

      if (result.success) {
        toast({
          title: "설정 저장 성공",
          description: result.message,
        })
      } else {
        toast({
          title: "설정 저장 실패",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("설정 저장 중 오류 발생:", error)
      toast({
        title: "설정 저장 실패",
        description: "설정을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 설정 내보내기 핸들러
  const handleExportSettings = async () => {
    try {
      const settingsJson = await exportSettings()

      // 파일 다운로드
      const blob = new Blob([settingsJson], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `vehicle-management-settings-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "설정 내보내기 성공",
        description: "설정이 성공적으로 내보내졌습니다.",
      })
    } catch (error) {
      console.error("설정 내보내기 중 오류 발생:", error)
      toast({
        title: "설정 내보내기 실패",
        description: "설정을 내보내는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 설정 가져오기 핸들러
  const handleImportSettings = async () => {
    try {
      // 파일 선택 다이얼로그 열기
      const input = document.createElement("input")
      input.type = "file"
      input.accept = "application/json"

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const settingsJson = event.target?.result as string
            const result = await importSettings(settingsJson)

            if (result.success) {
              toast({
                title: "설정 가져오기 성공",
                description: result.message,
              })

              // 설정 다시 불러오기
              window.location.reload()
            } else {
              toast({
                title: "설정 가져오기 실패",
                description: result.message,
                variant: "destructive",
              })
            }
          } catch (error) {
            console.error("설정 가져오기 중 오류 발생:", error)
            toast({
              title: "설정 가져오기 실패",
              description: "설정을 가져오는 중 오류가 발생했습니다.",
              variant: "destructive",
            })
          }
        }
        reader.readAsText(file)
      }

      input.click()
    } catch (error) {
      console.error("설정 가져오기 중 오류 발생:", error)
      toast({
        title: "설정 가져오기 실패",
        description: "설정을 가져오는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 일반 설정 변경 핸들러
  const handleGeneralChange = (key: keyof GeneralSettings, value: string | boolean) => {
    setGeneralSettings((prev) => ({ ...prev, [key]: value }))
  }

  // 보안 설정 변경 핸들러
  const handleSecurityChange = (key: keyof SecuritySettings, value: string | boolean) => {
    setSecuritySettings((prev) => ({ ...prev, [key]: value }))
  }

  // 데이터베이스 설정 변경 핸들러
  const handleDatabaseChange = (key: keyof DatabaseSettings, value: string | boolean) => {
    setDatabaseSettings((prev) => ({ ...prev, [key]: value }))
  }

  // 모바일 설정 변경 핸들러
  const handleMobileChange = (key: keyof MobileSettings, value: string | boolean) => {
    setMobileSettings((prev) => ({ ...prev, [key]: value }))
  }

  // 브레드크럼 데이터
  const breadcrumbs = [{ label: "홈", href: "/" }, { label: "시스템 관리" }]

  if (isLoading) {
    return (
      <PageLayout title="시스템 설정" description="차량 관리 시스템의 설정을 관리합니다" breadcrumbs={breadcrumbs}>
        <Card>
          <CardContent className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p>설정을 불러오는 중...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="시스템 설정" description="차량 관리 시스템의 설정을 관리합니다" breadcrumbs={breadcrumbs}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>설정 관리</CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportSettings}>
              <Download className="mr-2 h-4 w-4" />
              설정 내보내기
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportSettings}>
              <Upload className="mr-2 h-4 w-4" />
              설정 가져오기
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                일반 설정
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                알림 설정
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                보안 설정
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                데이터베이스
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                모바일 설정
              </TabsTrigger>
              <TabsTrigger value="telegram" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                텔레그램 설정
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">사이트 이름</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) => handleGeneralChange("siteName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteDescription">사이트 설명</Label>
                    <Input
                      id="siteDescription"
                      value={generalSettings.siteDescription}
                      onChange={(e) => handleGeneralChange("siteDescription", e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="itemsPerPage">페이지당 항목 수</Label>
                    <Select
                      value={generalSettings.itemsPerPage}
                      onValueChange={(value) => handleGeneralChange("itemsPerPage", value)}
                    >
                      <SelectTrigger id="itemsPerPage">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10개</SelectItem>
                        <SelectItem value="20">20개</SelectItem>
                        <SelectItem value="50">50개</SelectItem>
                        <SelectItem value="100">100개</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">기본 언어</Label>
                    <Select
                      value={generalSettings.defaultLanguage}
                      onValueChange={(value) => handleGeneralChange("defaultLanguage", value)}
                    >
                      <SelectTrigger id="defaultLanguage">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">영어</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="autoLogout">자동 로그아웃 시간 (분)</Label>
                    <Select
                      value={generalSettings.autoLogout}
                      onValueChange={(value) => handleGeneralChange("autoLogout", value)}
                    >
                      <SelectTrigger id="autoLogout">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15분</SelectItem>
                        <SelectItem value="30">30분</SelectItem>
                        <SelectItem value="60">60분</SelectItem>
                        <SelectItem value="120">120분</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableDarkMode">다크 모드 활성화</Label>
                      <p className="text-sm text-gray-500">사용자가 다크 모드를 사용할 수 있도록 합니다</p>
                    </div>
                    <Switch
                      id="enableDarkMode"
                      checked={generalSettings.enableDarkMode}
                      onCheckedChange={(checked) => handleGeneralChange("enableDarkMode", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableOfflineMode">오프라인 모드 활성화</Label>
                      <p className="text-sm text-gray-500">인터넷 연결 없이 기본 기능을 사용할 수 있습니다</p>
                    </div>
                    <Switch
                      id="enableOfflineMode"
                      checked={generalSettings.enableOfflineMode}
                      onCheckedChange={(checked) => handleGeneralChange("enableOfflineMode", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiry">비밀번호 만료 기간 (일)</Label>
                    <Select
                      value={securitySettings.passwordExpiry}
                      onValueChange={(value) => handleSecurityChange("passwordExpiry", value)}
                    >
                      <SelectTrigger id="passwordExpiry">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30일</SelectItem>
                        <SelectItem value="60">60일</SelectItem>
                        <SelectItem value="90">90일</SelectItem>
                        <SelectItem value="180">180일</SelectItem>
                        <SelectItem value="365">365일</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">최대 로그인 시도 횟수</Label>
                    <Select
                      value={securitySettings.loginAttempts}
                      onValueChange={(value) => handleSecurityChange("loginAttempts", value)}
                    >
                      <SelectTrigger id="loginAttempts">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3회</SelectItem>
                        <SelectItem value="5">5회</SelectItem>
                        <SelectItem value="10">10회</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">세션 타임아웃 (분)</Label>
                    <Select
                      value={securitySettings.sessionTimeout}
                      onValueChange={(value) => handleSecurityChange("sessionTimeout", value)}
                    >
                      <SelectTrigger id="sessionTimeout">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15분</SelectItem>
                        <SelectItem value="30">30분</SelectItem>
                        <SelectItem value="60">60분</SelectItem>
                        <SelectItem value="120">120분</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="requireTwoFactor">2단계 인증 필수화</Label>
                      <p className="text-sm text-gray-500">모든 사용자에게 2단계 인증을 요구합니다</p>
                    </div>
                    <Switch
                      id="requireTwoFactor"
                      checked={securitySettings.requireTwoFactor}
                      onCheckedChange={(checked) => handleSecurityChange("requireTwoFactor", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="allowMultipleSessions">다중 세션 허용</Label>
                      <p className="text-sm text-gray-500">여러 기기에서 동시 로그인을 허용합니다</p>
                    </div>
                    <Switch
                      id="allowMultipleSessions"
                      checked={securitySettings.allowMultipleSessions}
                      onCheckedChange={(checked) => handleSecurityChange("allowMultipleSessions", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ipRestriction">IP 제한 활성화</Label>
                      <p className="text-sm text-gray-500">특정 IP 주소에서만 접근을 허용합니다</p>
                    </div>
                    <Switch
                      id="ipRestriction"
                      checked={securitySettings.ipRestriction}
                      onCheckedChange={(checked) => handleSecurityChange("ipRestriction", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="database">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">백업 주기</Label>
                    <Select
                      value={databaseSettings.backupFrequency}
                      onValueChange={(value) => handleDatabaseChange("backupFrequency", value)}
                    >
                      <SelectTrigger id="backupFrequency">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">매시간</SelectItem>
                        <SelectItem value="daily">매일</SelectItem>
                        <SelectItem value="weekly">매주</SelectItem>
                        <SelectItem value="monthly">매월</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retentionPeriod">보관 기간 (일)</Label>
                    <Select
                      value={databaseSettings.retentionPeriod}
                      onValueChange={(value) => handleDatabaseChange("retentionPeriod", value)}
                    >
                      <SelectTrigger id="retentionPeriod">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7일</SelectItem>
                        <SelectItem value="30">30일</SelectItem>
                        <SelectItem value="90">90일</SelectItem>
                        <SelectItem value="365">365일</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="compressionEnabled">백업 압축 활성화</Label>
                      <p className="text-sm text-gray-500">백업 파일을 압축하여 저장 공간을 절약합니다</p>
                    </div>
                    <Switch
                      id="compressionEnabled"
                      checked={databaseSettings.compressionEnabled}
                      onCheckedChange={(checked) => handleDatabaseChange("compressionEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="encryptBackups">백업 암호화</Label>
                      <p className="text-sm text-gray-500">백업 파일을 암호화하여 보안을 강화합니다</p>
                    </div>
                    <Switch
                      id="encryptBackups"
                      checked={databaseSettings.encryptBackups}
                      onCheckedChange={(checked) => handleDatabaseChange("encryptBackups", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoOptimize">자동 최적화</Label>
                      <p className="text-sm text-gray-500">정기적으로 데이터베이스를 최적화합니다</p>
                    </div>
                    <Switch
                      id="autoOptimize"
                      checked={databaseSettings.autoOptimize}
                      onCheckedChange={(checked) => handleDatabaseChange("autoOptimize", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mobile">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cacheSize">캐시 크기 (MB)</Label>
                    <Select
                      value={mobileSettings.cacheSize}
                      onValueChange={(value) => handleMobileChange("cacheSize", value)}
                    >
                      <SelectTrigger id="cacheSize">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="50">50 MB</SelectItem>
                        <SelectItem value="100">100 MB</SelectItem>
                        <SelectItem value="200">200 MB</SelectItem>
                        <SelectItem value="500">500 MB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageQuality">이미지 품질</Label>
                    <Select
                      value={mobileSettings.imageQuality}
                      onValueChange={(value) => handleMobileChange("imageQuality", value)}
                    >
                      <SelectTrigger id="imageQuality">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">낮음 (빠른 로딩)</SelectItem>
                        <SelectItem value="medium">중간</SelectItem>
                        <SelectItem value="high">높음 (고품질)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enablePushNotifications">푸시 알림 활성화</Label>
                      <p className="text-sm text-gray-500">모바일 기기에 푸시 알림을 전송합니다</p>
                    </div>
                    <Switch
                      id="enablePushNotifications"
                      checked={mobileSettings.enablePushNotifications}
                      onCheckedChange={(checked) => handleMobileChange("enablePushNotifications", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableLocationServices">위치 서비스 활성화</Label>
                      <p className="text-sm text-gray-500">사용자 위치 기반 기능을 활성화합니다</p>
                    </div>
                    <Switch
                      id="enableLocationServices"
                      checked={mobileSettings.enableLocationServices}
                      onCheckedChange={(checked) => handleMobileChange("enableLocationServices", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableOfflineEditing">오프라인 편집 활성화</Label>
                      <p className="text-sm text-gray-500">인터넷 연결 없이 데이터 편집을 허용합니다</p>
                    </div>
                    <Switch
                      id="enableOfflineEditing"
                      checked={mobileSettings.enableOfflineEditing}
                      onCheckedChange={(checked) => handleMobileChange("enableOfflineEditing", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="telegram">
              <div className="space-y-6">
                <div className="flex flex-col space-y-4">
                  <h3 className="text-lg font-medium">텔레그램 봇 설정</h3>
                  <p className="text-sm text-gray-500">
                    텔레그램 봇을 통해 알림을 받고 시스템과 상호작용할 수 있습니다.
                  </p>

                  <div className="mt-4">
                    <Link href="/admin/telegram">
                      <Button className="w-full sm:w-auto">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        텔레그램 봇 관리
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {activeTab !== "notifications" && activeTab !== "telegram" && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveSettings} disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : "설정 저장"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  )
}
