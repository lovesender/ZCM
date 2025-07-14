"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Camera, Upload, X, Eye, Loader2, CheckCircle, AlertCircle, ImageIcon } from "lucide-react"

interface PhotoUploadProps {
  onPlateNumberDetected: (plateNumber: string) => void
  onPhotoChange: (files: File[]) => void
  maxFiles?: number
  isMobile?: boolean
}

interface PhotoItem {
  file: File
  preview: string
  plateNumber?: string
  isProcessing: boolean
  error?: string
}

export default function PhotoUpload({
  onPlateNumberDetected,
  onPhotoChange,
  maxFiles = 3,
  isMobile = false,
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // 간단한 OCR 시뮬레이션 함수 (실제 환경에서는 Tesseract.js 사용)
  const simulateOCR = async (file: File): Promise<string | null> => {
    // 실제 구현에서는 여기서 Tesseract.js를 사용
    return new Promise((resolve) => {
      setTimeout(
        () => {
          // 시뮬레이션: 파일명에 따라 다른 번호판 반환
          const fileName = file.name.toLowerCase()
          if (fileName.includes("car") || fileName.includes("vehicle")) {
            const mockPlates = ["12가 3456", "34나 5678", "56다 7890", "78라 1234"]
            const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)]
            resolve(randomPlate)
          } else {
            resolve(null)
          }
        },
        2000 + Math.random() * 3000,
      ) // 2-5초 랜덤 지연
    })
  }

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return

      const fileArray = Array.from(files)
      const validFiles = fileArray.filter((file) => {
        const isValidType = file.type.startsWith("image/")
        const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
        return isValidType && isValidSize
      })

      if (validFiles.length === 0) {
        setError("유효한 이미지 파일을 선택해주세요. (최대 10MB)")
        return
      }

      if (photos.length + validFiles.length > maxFiles) {
        setError(`최대 ${maxFiles}개의 사진만 업로드할 수 있습니다.`)
        return
      }

      setError(null)
      setIsProcessing(true)
      setProcessingProgress(0)

      try {
        const newPhotos: PhotoItem[] = []

        // 파일들을 PhotoItem으로 변환
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i]
          const preview = URL.createObjectURL(file)

          newPhotos.push({
            file,
            preview,
            isProcessing: true,
          })
        }

        // 상태 업데이트
        const updatedPhotos = [...photos, ...newPhotos]
        setPhotos(updatedPhotos)
        onPhotoChange(updatedPhotos.map((p) => p.file))

        // OCR 처리
        for (let i = 0; i < newPhotos.length; i++) {
          const photoIndex = photos.length + i
          setProcessingProgress(((i + 1) / newPhotos.length) * 100)

          try {
            const plateNumber = await simulateOCR(newPhotos[i].file)

            setPhotos((prev) =>
              prev.map((photo, index) => {
                if (index === photoIndex) {
                  return {
                    ...photo,
                    plateNumber: plateNumber || undefined,
                    isProcessing: false,
                  }
                }
                return photo
              }),
            )

            // 번호판이 인식되면 자동 입력
            if (plateNumber) {
              onPlateNumberDetected(plateNumber)
            }
          } catch (ocrError) {
            console.error("OCR 처리 실패:", ocrError)
            setPhotos((prev) =>
              prev.map((photo, index) => {
                if (index === photoIndex) {
                  return {
                    ...photo,
                    isProcessing: false,
                    error: "번호판 인식 실패",
                  }
                }
                return photo
              }),
            )
          }
        }

        setProcessingProgress(100)
      } catch (error) {
        console.error("파일 처리 중 오류:", error)
        setError("파일 처리 중 오류가 발생했습니다.")
      } finally {
        setTimeout(() => {
          setIsProcessing(false)
          setProcessingProgress(0)
        }, 1000)
      }
    },
    [photos, maxFiles, onPlateNumberDetected, onPhotoChange],
  )

  const removePhoto = (index: number) => {
    const photoToRemove = photos[index]

    // 메모리 정리
    URL.revokeObjectURL(photoToRemove.preview)

    const updatedPhotos = photos.filter((_, i) => i !== index)
    setPhotos(updatedPhotos)
    onPhotoChange(updatedPhotos.map((p) => p.file))
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openCamera = () => {
    cameraInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-base font-medium">차량 사진</Label>
        <p className="text-sm text-gray-600">
          차량 번호판이 선명하게 보이는 사진을 업로드하면 자동으로 차량 번호를 인식합니다.
        </p>
      </div>

      {/* 업로드 버튼 */}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={openFileDialog}
          disabled={isProcessing || photos.length >= maxFiles}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>파일 선택</span>
        </Button>

        {isMobile && (
          <Button
            type="button"
            variant="outline"
            onClick={openCamera}
            disabled={isProcessing || photos.length >= maxFiles}
            className="flex items-center space-x-2"
          >
            <Camera className="w-4 h-4" />
            <span>사진 촬영</span>
          </Button>
        )}

        <span className="text-sm text-gray-500 self-center">
          {photos.length}/{maxFiles}개 업로드됨
        </span>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* 숨겨진 카메라 입력 */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* 처리 진행률 */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">이미지 처리 및 번호판 인식 중...</span>
          </div>
          <Progress value={processingProgress} className="h-2" />
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 사진 미리보기 */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">업로드된 사진</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                  <img
                    src={photo.preview || "/placeholder.svg"}
                    alt={`차량 사진 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* 처리 중 오버레이 */}
                  {photo.isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <span className="text-sm">번호판 인식 중...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 삭제 버튼 */}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </Button>

                {/* OCR 결과 표시 */}
                {!photo.isProcessing && (
                  <div className="absolute bottom-2 left-2 right-2">
                    {photo.plateNumber ? (
                      <div className="bg-green-600/90 text-white text-xs p-2 rounded">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>인식됨: {photo.plateNumber}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-600/90 text-white text-xs p-2 rounded">
                        <div className="flex items-center space-x-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>{photo.error || "번호판 인식 실패"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 사용 팁 */}
      <Alert>
        <Eye className="h-4 w-4" />
        <AlertDescription>
          <strong>번호판 인식 팁:</strong>
          <ul className="mt-1 text-sm space-y-1">
            <li>• 번호판이 선명하고 전체가 보이도록 촬영해주세요</li>
            <li>• 조명이 충분한 곳에서 촬영하면 인식률이 높아집니다</li>
            <li>• 번호판에 그림자나 반사가 없도록 주의해주세요</li>
            <li>• 정면에서 촬영하면 더 정확하게 인식됩니다</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* 빈 상태 표시 */}
      {photos.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">아직 업로드된 사진이 없습니다</p>
          <div className="flex justify-center space-x-2">
            <Button type="button" variant="outline" onClick={openFileDialog} className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>사진 선택</span>
            </Button>
            {isMobile && (
              <Button type="button" variant="outline" onClick={openCamera} className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>촬영하기</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
