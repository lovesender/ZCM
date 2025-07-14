"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { TelegramAuthForm } from "@/components/telegram-auth-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function VerifyUserPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get("userId")
  const telegramId = searchParams.get("telegramId")
  const returnUrl = searchParams.get("returnUrl") || "/admin/users"

  const [isVerified, setIsVerified] = useState(false)

  // 인증 완료 처리
  const handleVerificationComplete = (verified: boolean, telegramId: string) => {
    setIsVerified(verified)

    // 3초 후 리디렉션
    if (verified) {
      setTimeout(() => {
        router.push(returnUrl)
      }, 3000)
    }
  }

  // 브레드크럼 설정
  const breadcrumbs = [
    { label: "홈", href: "/" },
    { label: "사용자 관리", href: "/admin/users" },
    { label: "텔레그램 인증" },
  ]

  return (
    <PageLayout
      title="텔레그램 인증"
      description="텔레그램 ID를 인증하여 계정 보안을 강화합니다"
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-md mx-auto">
        <Button variant="ghost" className="mb-4" onClick={() => router.push(returnUrl)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>

        <TelegramAuthForm
          onVerificationComplete={handleVerificationComplete}
          purpose="verification"
          userId={userId ? Number.parseInt(userId) : undefined}
          initialTelegramId={telegramId || ""}
        />

        {isVerified && (
          <div className="mt-4 text-center text-sm text-gray-500">
            인증이 완료되었습니다. 잠시 후 이전 페이지로 이동합니다...
          </div>
        )}
      </div>
    </PageLayout>
  )
}
