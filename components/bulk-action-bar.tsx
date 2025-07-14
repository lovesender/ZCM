"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, AlertTriangle } from "lucide-react"

interface BulkAction {
  id: string
  label: string
  icon: React.ReactNode
  variant?: "default" | "destructive" | "outline"
  requiresValue?: boolean
  options?: { value: string; label: string }[]
}

interface BulkActionBarProps {
  selectedCount: number
  totalCount: number
  actions: BulkAction[]
  onAction: (actionId: string, value?: string) => Promise<{ success: boolean; message: string }>
  onClearSelection: () => void
}

export function BulkActionBar({ selectedCount, totalCount, actions, onAction, onClearSelection }: BulkActionBarProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null)
  const [actionValue, setActionValue] = useState("")
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleAction = async (action: BulkAction, value?: string) => {
    setIsProcessing(true)
    setProgress(0)
    setResult(null)

    try {
      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      const result = await onAction(action.id, value)

      clearInterval(progressInterval)
      setProgress(100)
      setResult(result)

      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
        if (result.success) {
          onClearSelection()
        }
      }, 1500)
    } catch (error) {
      setIsProcessing(false)
      setProgress(0)
      setResult({
        success: false,
        message: "작업 중 오류가 발생했습니다.",
      })
    }
  }

  if (selectedCount === 0) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedCount}개 선택됨 (전체 {totalCount}개)
          </Badge>
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <div key={action.id}>
                {action.requiresValue ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant={action.variant || "outline"}
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setSelectedAction(action)}
                      >
                        {action.icon}
                        {action.label}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{action.label}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          선택된 {selectedCount}개 항목에 대해 {action.label}을(를) 수행합니다.
                        </p>
                        {action.options && (
                          <Select value={actionValue} onValueChange={setActionValue}>
                            <SelectTrigger>
                              <SelectValue placeholder="옵션을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              {action.options.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedAction(null)
                              setActionValue("")
                            }}
                          >
                            취소
                          </Button>
                          <Button
                            onClick={() => handleAction(action, actionValue)}
                            disabled={action.options && !actionValue}
                          >
                            확인
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant={action.variant || "outline"} size="sm" className="flex items-center gap-2">
                        {action.icon}
                        {action.label}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>작업 확인</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                          선택된 {selectedCount}개 항목에 대해 {action.label}을(를) 수행하시겠습니까?
                        </p>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline">취소</Button>
                          <Button variant={action.variant || "default"} onClick={() => handleAction(action)}>
                            확인
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearSelection}>
          <X className="w-4 h-4" />
          선택 해제
        </Button>
      </div>

      {/* 진행 상황 표시 */}
      {isProcessing && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>작업 진행 중...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* 결과 표시 */}
      {result && (
        <div
          className={`mt-4 p-3 rounded-md flex items-center gap-2 ${
            result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
          }`}
        >
          {result.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span className="text-sm">{result.message}</span>
        </div>
      )}
    </div>
  )
}
