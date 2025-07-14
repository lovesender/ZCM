"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, RefreshCw, Send, Trash2 } from "lucide-react"

export default function TelegramBotAdmin() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [authKey, setAuthKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // 웹훅 정보 조회
  const getWebhookInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/telegram-webhook?auth=${authKey}`)
      const data = await response.json()

      if (!data.success) {
        setError(data.error || "웹훅 정보 조회에 실패했습니다.")
        return
      }

      setResult(data.webhookInfo)
      setSuccess("웹훅 정보를 성공적으로 조회했습니다.")
    } catch (error) {
      setError("웹훅 정보 조회 중 오류가 발생했습니다.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 웹훅 설정
  const setupWebhook = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      if (!webhookUrl) {
        setError("웹훅 URL을 입력해주세요.")
        return
      }

      const response = await fetch(
        `/api/telegram-webhook?setup=true&auth=${authKey}&url=${encodeURIComponent(webhookUrl)}`,
      )
      const data = await response.json()

      if (!data.success) {
        setError(data.error || "웹훅 설정에 실패했습니다.")
        return
      }

      setResult(data.result)
      setSuccess("웹훅이 성공적으로 설정되었습니다.")
    } catch (error) {
      setError("웹훅 설정 중 오류가 발생했습니다.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 웹훅 제거
  const removeWebhook = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch(`/api/telegram-webhook?remove=true&auth=${authKey}`)
      const data = await response.json()

      if (!data.success) {
        setError(data.error || "웹훅 제거에 실패했습니다.")
        return
      }

      setResult(data.result)
      setSuccess("웹훅이 성공적으로 제거되었습니다.")
    } catch (error) {
      setError("웹훅 제거 중 오류가 발생했습니다.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // 테스트 메시지 전송
  const sendTestMessage = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const telegramId = prompt("테스트 메시지를 받을 텔레그램 ID를 입력하세요 (@username 형식):")

      if (!telegramId) {
        setError("텔레그램 ID를 입력해주세요.")
        return
      }

      // 실제 구현에서는 API 엔드포인트를 통해 메시지 전송
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          telegramId,
          message: `
<b>🧪 테스트 메시지</b>

안녕하세요! 이것은 차량 관리 시스템에서 보낸 테스트 메시지입니다.
봇이 정상적으로 작동하고 있습니다.

<i>현재 시간: ${new Date().toLocaleString()}</i>
`,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || "메시지 전송에 실패했습니다.")
        return
      }

      setSuccess(`${telegramId}에게 테스트 메시지를 성공적으로 전송했습니다.`)
    } catch (error) {
      setError("메시지 전송 중 오류가 발생했습니다.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>텔레그램 봇 관리</CardTitle>
        <CardDescription>텔레그램 봇 설정 및 웹훅 관리</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info">웹훅 정보</TabsTrigger>
            <TabsTrigger value="setup">웹훅 설정</TabsTrigger>
            <TabsTrigger value="test">테스트</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="auth-key">관리자 인증 키</Label>
                <Input
                  id="auth-key"
                  type="password"
                  placeholder="관리자 인증 키를 입력하세요"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                />
              </div>

              <Button onClick={getWebhookInfo} disabled={loading} className="w-full">
                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                웹훅 정보 조회
              </Button>

              {result && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">웹훅 정보</h4>
                  <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="setup">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">웹훅 URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-domain.com/api/telegram-webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">웹훅 URL은 공개적으로 접근 가능한 HTTPS URL이어야 합니다.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-key-setup">관리자 인증 키</Label>
                <Input
                  id="auth-key-setup"
                  type="password"
                  placeholder="관리자 인증 키를 입력하세요"
                  value={authKey}
                  onChange={(e) => setAuthKey(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={setupWebhook} disabled={loading} className="flex-1">
                  {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  웹훅 설정
                </Button>
                <Button onClick={removeWebhook} disabled={loading} variant="destructive" className="flex-1">
                  {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                  웹훅 제거
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="test">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                텔레그램 봇이 정상적으로 작동하는지 테스트 메시지를 보내볼 수 있습니다.
              </p>

              <Button onClick={sendTestMessage} disabled={loading} className="w-full">
                {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                테스트 메시지 전송
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4 bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>성공</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-gray-500">
          텔레그램 봇 설정에 대한 자세한 내용은{" "}
          <a
            href="https://core.telegram.org/bots/api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            텔레그램 봇 API 문서
          </a>
          를 참조하세요.
        </p>
      </CardFooter>
    </Card>
  )
}
