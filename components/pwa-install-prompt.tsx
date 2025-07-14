"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Download, Smartphone } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // iOS 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(isIOSDevice)

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // 이미 설치되어 있거나 사용자가 거부한 경우 체크
      const hasBeenInstalled = localStorage.getItem("pwa-installed")
      const hasBeenDismissed = localStorage.getItem("pwa-dismissed")

      if (!hasBeenInstalled && !hasBeenDismissed) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // PWA가 설치되었는지 확인
    window.addEventListener("appinstalled", () => {
      localStorage.setItem("pwa-installed", "true")
      setShowPrompt(false)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        localStorage.setItem("pwa-installed", "true")
      } else {
        localStorage.setItem("pwa-dismissed", "true")
      }

      setShowPrompt(false)
      setDeferredPrompt(null)
    } catch (error) {
      console.error("PWA 설치 중 오류:", error)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem("pwa-dismissed", "true")
    setShowPrompt(false)
  }

  const handleIOSInstall = () => {
    setShowPrompt(false)
    // iOS 사용자에게 수동 설치 방법 안내
    alert('Safari에서 공유 버튼을 누른 후 "홈 화면에 추가"를 선택해주세요.')
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <Card className="shadow-lg border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <div className="flex flex-col">
                <CardTitle className="text-lg font-bold leading-tight">ZCM</CardTitle>
                <CardDescription className="text-xs text-gray-600 leading-tight">차량 관리 시스템</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0 hover:bg-white/50">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 mb-4">ZCM을 홈 화면에 추가하여 더 빠르게 이용하세요!</p>
          <div className="flex space-x-2">
            {isIOS ? (
              <Button onClick={handleIOSInstall} className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                <Smartphone className="w-4 h-4 mr-2" />
                설치 방법
              </Button>
            ) : (
              <Button onClick={handleInstall} className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                <Download className="w-4 h-4 mr-2" />
                설치하기
              </Button>
            )}
            <Button variant="outline" onClick={handleDismiss} size="sm" className="flex-1 border-gray-300">
              나중에
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
