"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  getNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings as NotificationSettingsType,
} from "@/app/actions/settings-actions"
import { useToast } from "@/hooks/use-toast"

export default function NotificationSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [settings, setSettings] = useState<NotificationSettingsType>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    telegramNotifications: true,
    notifyOnLogin: true,
    notifyOnVehicleChanges: true,
    notifyOnApproval: true,
    notifyOnSystemUpdates: true,
    dailyDigest: false,
    weeklyReport: true,
  })

  // 설정 불러오기
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getNotificationSettings()
        setSettings(data)
      } catch (error) {
        console.error("알림 설정을 불러오는 중 오류 발생:", error)
        toast({
          title: "설정 불러오기 실패",
          description: "알림 설정을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  // 설정 변경 핸들러
  const handleChange = (key: keyof NotificationSettingsType, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // 설정 저장 핸들러
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await saveNotificationSettings(settings)

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
      console.error("알림 설정 저장 중 오류 발생:", error)
      toast({
        title: "설정 저장 실패",
        description: "알림 설정을 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-4">설정을 불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">알림 채널</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">이메일 알림</Label>
              <p className="text-sm text-gray-500">중요 알림을 이메일로 받습니다</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smsNotifications">SMS 알림</Label>
              <p className="text-sm text-gray-500">긴급 알림을 SMS로 받습니다</p>
            </div>
            <Switch
              id="smsNotifications"
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => handleChange("smsNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pushNotifications">푸시 알림</Label>
              <p className="text-sm text-gray-500">브라우저 및 모바일 푸시 알림을 받습니다</p>
            </div>
            <Switch
              id="pushNotifications"
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => handleChange("pushNotifications", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="telegramNotifications">텔레그램 알림</Label>
              <p className="text-sm text-gray-500">텔레그램 봇을 통해 알림을 받습니다</p>
            </div>
            <Switch
              id="telegramNotifications"
              checked={settings.telegramNotifications}
              onCheckedChange={(checked) => handleChange("telegramNotifications", checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">알림 유형</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifyOnLogin">로그인 알림</Label>
              <p className="text-sm text-gray-500">새로운 기기에서 로그인 시 알림을 받습니다</p>
            </div>
            <Switch
              id="notifyOnLogin"
              checked={settings.notifyOnLogin}
              onCheckedChange={(checked) => handleChange("notifyOnLogin", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifyOnVehicleChanges">차량 변경 알림</Label>
              <p className="text-sm text-gray-500">차량 정보 변경 시 알림을 받습니다</p>
            </div>
            <Switch
              id="notifyOnVehicleChanges"
              checked={settings.notifyOnVehicleChanges}
              onCheckedChange={(checked) => handleChange("notifyOnVehicleChanges", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifyOnApproval">승인 알림</Label>
              <p className="text-sm text-gray-500">승인 요청 및 결과에 대한 알림을 받습니다</p>
            </div>
            <Switch
              id="notifyOnApproval"
              checked={settings.notifyOnApproval}
              onCheckedChange={(checked) => handleChange("notifyOnApproval", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifyOnSystemUpdates">시스템 업데이트 알림</Label>
              <p className="text-sm text-gray-500">시스템 업데이트 및 유지보수 알림을 받습니다</p>
            </div>
            <Switch
              id="notifyOnSystemUpdates"
              checked={settings.notifyOnSystemUpdates}
              onCheckedChange={(checked) => handleChange("notifyOnSystemUpdates", checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">정기 보고서</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dailyDigest">일일 요약</Label>
              <p className="text-sm text-gray-500">매일 활동 요약을 이메일로 받습니다</p>
            </div>
            <Switch
              id="dailyDigest"
              checked={settings.dailyDigest}
              onCheckedChange={(checked) => handleChange("dailyDigest", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyReport">주간 보고서</Label>
              <p className="text-sm text-gray-500">매주 통계 및 활동 보고서를 받습니다</p>
            </div>
            <Switch
              id="weeklyReport"
              checked={settings.weeklyReport}
              onCheckedChange={(checked) => handleChange("weeklyReport", checked)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "저장 중..." : "알림 설정 저장"}
        </Button>
      </div>
    </div>
  )
}
