"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TelegramAuthForm } from "@/components/telegram-auth-form"
import { Shield, CheckCircle } from "lucide-react"

interface UserVerificationButtonProps {
  userId: number
  telegramId?: string
  isVerified?: boolean
  onVerificationComplete?: (verified: boolean) => void
}

export function UserVerificationButton({
  userId,
  telegramId = "",
  isVerified = false,
  onVerificationComplete,
}: UserVerificationButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [userVerified, setUserVerified] = useState(isVerified)

  const handleVerificationComplete = (verified: boolean) => {
    setUserVerified(verified)

    // 부모 컴포넌트에 알림
    if (onVerificationComplete) {
      onVerificationComplete(verified)
    }

    // 성공 시 다이얼로그 닫기 (3초 후)
    if (verified) {
      setTimeout(() => {
        setIsDialogOpen(false)
      }, 3000)
    }
  }

  return (
    <>
      <Button
        variant={userVerified ? "outline" : "default"}
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className={userVerified ? "text-green-600 border-green-600" : ""}
      >
        {userVerified ? (
          <>
            <CheckCircle className="h-4 w-4 mr-1" />
            인증됨
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-1" />
            인증하기
          </>
        )}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>텔레그램 인증</DialogTitle>
            <DialogDescription>사용자의 텔레그램 ID를 인증하여 계정 보안을 강화합니다.</DialogDescription>
          </DialogHeader>

          <TelegramAuthForm
            purpose="verification"
            userId={userId}
            initialTelegramId={telegramId}
            onVerificationComplete={handleVerificationComplete}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
