"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FileSpreadsheet, Upload, AlertTriangle, CheckCircle, Download } from "lucide-react"
import { read, utils } from "xlsx"

interface ExcelImportProps {
  onImportComplete: (data: any[]) => void
  vehicleType: "church" | "member"
}

export default function ExcelImport({ onImportComplete, vehicleType }: ExcelImportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement> | null, droppedFile?: File) => {
    setError(null)
    setSuccess(null)

    const selectedFile = droppedFile || e?.target.files?.[0] || null
    if (!selectedFile) return

    if (!/\.(xlsx|xls|csv)$/i.test(selectedFile.name)) {
      setError("Excel 또는 CSV 파일만 업로드할 수 있습니다.")
      return
    }

    setFile(selectedFile)
    setIsLoading(true)
    setProgress(30)

    try {
      // 파일 읽기
      const data = await readExcelFile(selectedFile)
      setProgress(70)

      // 데이터 검증
      if (data.length === 0) {
        setError("파일에 데이터가 없습니다.")
        setIsLoading(false)
        return
      }

      const firstRow = data[0]
      const headers = Object.keys(firstRow)

      // 필수 컬럼 확인
      const requiredColumns = vehicleType === "church" ? ["차량번호", "모델", "연식"] : ["이름", "전화번호", "차량번호"]
      const missingColumns = requiredColumns.filter((col) => !headers.includes(col))

      if (missingColumns.length > 0) {
        setError(`필수 컬럼이 누락되었습니다: ${missingColumns.join(", ")}`)
        setIsLoading(false)
        return
      }

      setColumns(headers)
      setPreviewData(data.slice(0, 5)) // 미리보기는 5개만
      setProgress(100)
      setIsLoading(false)
    } catch (err) {
      setError(`파일을 읽는 중 오류가 발생했습니다: ${err instanceof Error ? err.message : String(err)}`)
      setIsLoading(false)
    }

    // 파일 입력 필드 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = read(data, { type: "binary" })
          const firstSheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[firstSheetName]
          const jsonData = utils.sheet_to_json(worksheet)
          resolve(jsonData)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = (error) => reject(error)
      reader.readAsBinaryString(file)
    })
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(null, e.dataTransfer.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsLoading(true)
    setProgress(10)

    try {
      // 전체 데이터 읽기
      const allData = await readExcelFile(file)
      setProgress(50)

      // 빈 행 제거 및 데이터 정리
      const cleanedData = allData.filter((item) => {
        // 필수 필드 중 하나라도 값이 있는 행만 유지
        const requiredFields = vehicleType === "church" ? ["차량번호", "모델"] : ["이름", "차량번호"]
        return requiredFields.some((field) => item[field] && String(item[field]).trim())
      })

      setProgress(80)

      // 완료 처리
      onImportComplete(cleanedData)
      setSuccess(`${cleanedData.length}개의 데이터를 성공적으로 가져왔습니다.`)

      // 다이얼로그를 3초 후 닫기
      setTimeout(() => {
        setIsOpen(false)
        setFile(null)
        setPreviewData([])
        setColumns([])
        setSuccess(null)
      }, 3000)
    } catch (err) {
      setError(`데이터 가져오기 실패: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setProgress(100)
      setIsLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/download-template?type=${vehicleType}`)

      if (!response.ok) {
        throw new Error("템플릿 다운로드에 실패했습니다.")
      }

      // 블롭으로 변환
      const blob = await response.blob()

      // 파일명 추출
      const disposition = response.headers.get("Content-Disposition")
      const filenameMatch = disposition?.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      const filename = filenameMatch
        ? decodeURIComponent(filenameMatch[1].replace(/['"]/g, ""))
        : `${vehicleType === "church" ? "교회차량" : "성도차량"}_템플릿.xlsx`

      // 다운로드 실행
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(`템플릿 다운로드 실패: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setIsDownloading(false)
    }
  }

  const getRequiredColumns = () => {
    return vehicleType === "church" ? "차량번호, 모델, 연식" : "이름, 전화번호, 차량번호"
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4 mr-1" />
          엑셀 불러오기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicleType === "church" ? "교회 차량" : "성도 차량"} 엑셀 데이터 가져오기</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">성공</AlertTitle>
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {!file ? (
            <>
              <div
                className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Excel 또는 CSV 파일을 드래그하여 놓거나 클릭하여 선택하세요
                </p>
                <p className="text-sm text-gray-500 mb-4">(*.xlsx, *.xls, *.csv 파일 지원)</p>
                <p className="text-xs text-gray-400">최대 파일 크기: 10MB</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-800 mb-2">📋 데이터 입력 가이드</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>
                    • <strong>필수 컬럼:</strong> {getRequiredColumns()}
                  </li>
                  <li>• 첫 번째 행은 반드시 컬럼명이어야 합니다</li>
                  <li>• 빈 행은 자동으로 제외됩니다</li>
                  <li>• 예시 데이터가 포함된 템플릿을 다운로드하여 사용하세요</li>
                </ul>
              </div>

              <div className="flex justify-between items-center border-t pt-4">
                <Button
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  disabled={isDownloading}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isDownloading ? "다운로드 중..." : "템플릿 다운로드"}
                </Button>

                <div className="text-sm text-gray-500">템플릿을 다운로드하여 양식을 확인하세요</div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">파일 크기: {(file.size / 1024 / 1024).toFixed(2)}MB</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null)
                      setPreviewData([])
                      setColumns([])
                      setError(null)
                      setSuccess(null)
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    파일 변경
                  </Button>
                </div>

                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">파일 처리 중...</p>
                      <p className="text-sm text-gray-500">{progress}%</p>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </div>

              {previewData.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">데이터 미리보기</h3>
                    <span className="text-sm text-gray-500">상위 5개 행 표시</span>
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <div className="max-h-64 overflow-auto">
                      <Table>
                        <TableHeader className="bg-gray-50">
                          <TableRow>
                            {columns.map((column) => (
                              <TableHead
                                key={column}
                                className="text-sm font-medium text-gray-700 border-r last:border-r-0"
                              >
                                {column}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewData.map((row, rowIndex) => (
                            <TableRow key={rowIndex} className="hover:bg-gray-50">
                              {columns.map((column) => (
                                <TableCell
                                  key={`${rowIndex}-${column}`}
                                  className="text-sm py-2 border-r last:border-r-0"
                                >
                                  {row[column]?.toString() || "-"}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-700">
                      ✅ 데이터 형식이 올바릅니다. 전체 데이터를 가져오려면 '데이터 가져오기' 버튼을 클릭하세요.
                    </p>
                  </div>
                </div>
              )}

              {previewData.length > 0 && (
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                    취소
                  </Button>
                  <Button onClick={handleImport} disabled={isLoading} className="min-w-[120px]">
                    {isLoading ? "처리 중..." : "데이터 가져오기"}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
