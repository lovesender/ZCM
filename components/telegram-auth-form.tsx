"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendVerificationCode, verifyTelegramCode } from "@/app/actions/telegram-auth-actions"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle2, AlertCircle, Send, ArrowRight } from "lucide-react"

interface TelegramAuthFormProps {
  onVerificationComplete?: (verified: boolean, telegramId: string) => void
  purpose?: "verification" | "login" | "password-reset"
  userId?: number
  initialTelegramId?: string
}

export function TelegramAuthForm({
  onVerificationComplete,
  purpose = "verification",
  userId,
  initialTelegramId = "",
}: TelegramAuthFormProps) {
  const [telegramId, setTelegramId] = useState(initialTelegramId)
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)

  // 인증 코드 전송
  const handleSendCode = async () => {
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const result = await sendVerificationCode(telegramId, purpose, userId)

      if (result.success) {
        setIsCodeSent(true)
        setSuccess(result.message)

        // 재전송 카운트다운 시작 (60초)
        setCountdown(60)
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("인증 코드 전송 중 오류가 발생했습니다.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // 인증 코드 확인
  const handleVerifyCode = async () => {
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const result = await verifyTelegramCode(verificationCode, telegramId)

      if (result.success && result.verified) {
        setIsVerified(true)
        setSuccess("인증이 성공적으로 완료되었습니다.")

        // 부모 컴포넌트에 인증 완료 알림
        if (onVerificationComplete) {
          onVerificationComplete(true, telegramId)
        }
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError("인증 코드 확인 중 오류가 발생했습니다.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // 텔레그램 ID 형식 검사
  const isTelegramIdValid = () => {
    if (!telegramId) return false

    const cleanId = telegramId.startsWith("@") ? telegramId.substring(1) : telegramId
    const telegramRegex = /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/
    return telegramRegex.test(cleanId)
  }

  // 인증 코드 형식 검사
  const isVerificationCodeValid = () => {
    return verificationCode.length === 6 && /^\d+$/.test(verificationCode)
  }

  // 목적에 따른 타이틀과 설명
  let title = "텔레그램 인증"
  let description = "텔레그램 ID를 입력하고 인증 코드를 받아 본인 확인을 완료하세요."

  if (purpose === "login") {
    title = "텔레그램으로 로그인"
    description = "텔레그램 ID를 입력하면 로그인 코드를 보내드립니다."
  } else if (purpose === "password-reset") {
    title = "비밀번호 재설정"
    description = "텔레그램으로 인증 후 새 비밀번호를 설정할 수 있습니다."
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isVerified ? (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-center text-lg font-medium">인증이 완료되었습니다!</p>
            <p className="text-center text-sm text-gray-500 mt-2">
              텔레그램 ID({telegramId})가 성공적으로 인증되었습니다.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label htmlFor="telegramId" className="text-sm font-medium">
                텔레그램 ID
              </label>
              <div className="flex space-x-2">
                <Input
                  id="telegramId"
                  placeholder="@username"
                  value={telegramId}
                  onChange={(e) => setTelegramId(e.target.value)}
                  disabled={isCodeSent || isLoading}
                />
                <Button onClick={handleSendCode} disabled={!isTelegramIdValid() || isLoading || countdown > 0}>
                  {isLoading && !isCodeSent ? <LoadingSpinner className="mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                  {countdown > 0 ? `${countdown}초 후 재전송` : isCodeSent ? "재전송" : "인증코드 전송"}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                텔레그램 ID는 @로 시작하며, 5-32자의 영문, 숫자, 밑줄(_)로 구성됩니다.
              </p>
            </div>

            {isCodeSent && (
              <div className="space-y-2">
                <label htmlFor="verificationCode" className="text-sm font-medium">
                  인증 코드
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="verificationCode"
                    placeholder="6자리 숫자"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    disabled={isLoading}
                  />
                  <Button onClick={handleVerifyCode} disabled={!isVerificationCodeValid() || isLoading}>
                    {isLoading && isCodeSent ? (
                      <LoadingSpinner className="mr-2" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-2" />
                    )}
                    확인
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  텔레그램으로 전송된 6자리 인증 코드를 입력하세요. 코드는 5분간 유효합니다.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-xs text-gray-500 text-center">
          텔레그램 봇(@your_bot_name)을 시작하지 않았다면, 먼저 봇을 시작해야 메시지를 받을 수 있습니다.
        </p>
      </CardFooter>
    </Card>
  )
}
