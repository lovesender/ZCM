import Tesseract from "tesseract.js"
import { ImagePreprocessor } from "./image-preprocessing"

// 한국 차량 번호판 패턴 정규식
const KOREAN_PLATE_PATTERNS = [
  /(\d{2,3}[가-힣]\d{4})/g, // 12가3456, 123가4567
  /(\d{3}[가-힣]\d{4})/g, // 123가4567
  /([가-힣]\d{2}[가-힣]\d{4})/g, // 서12가3456
]

export interface OCRResult {
  text: string
  confidence: number
  plateNumber?: string
}

export async function extractTextFromImage(imageFile: File): Promise<OCRResult> {
  try {
    // 1. 이미지 전처리
    const preprocessor = new ImagePreprocessor()
    const processedImage = await preprocessor.preprocessImage(imageFile, {
      enhanceContrast: true,
      denoise: true,
      sharpen: true,
      detectPlateRegion: true,
      normalizeSize: true,
    })

    // 2. OCR 수행 (향상된 설정)
    const {
      data: { text, confidence },
    } = await Tesseract.recognize(
      processedImage,
      "kor+eng", // 한국어 + 영어 인식
      {
        logger: (m) => console.log(m), // 진행상황 로그
        tessedit_char_whitelist:
          "0123456789가나다라마바사아자차카타파하거너더러머버서어저처커터퍼허고노도로모보소오조초코토포호구누두루무부수우주추쿠투푸후",
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // 단일 블록으로 인식
        tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY, // LSTM 엔진 사용
        preserve_interword_spaces: "0", // 단어 간 공백 제거
      },
    )

    const plateNumber = extractPlateNumber(text)

    return {
      text: text.trim(),
      confidence,
      plateNumber,
    }
  } catch (error) {
    console.error("OCR 처리 중 오류:", error)
    throw new Error("이미지에서 텍스트를 추출할 수 없습니다.")
  }
}

function extractPlateNumber(text: string): string | undefined {
  // 공백과 특수문자 제거
  const cleanText = text.replace(/[\s\-_]/g, "")

  // 각 패턴으로 번호판 찾기
  for (const pattern of KOREAN_PLATE_PATTERNS) {
    const matches = cleanText.match(pattern)
    if (matches && matches.length > 0) {
      return formatPlateNumber(matches[0])
    }
  }

  return undefined
}

function formatPlateNumber(plateNumber: string): string {
  // 번호판 형식 정리 (예: 12가3456 -> 12가 3456)
  const cleaned = plateNumber.replace(/[\s-]/g, "")

  // 패턴별 포맷팅
  if (/^\d{2}[가-힣]\d{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 2)}${cleaned.slice(2, 3)} ${cleaned.slice(3)}`
  } else if (/^\d{3}[가-힣]\d{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)} ${cleaned.slice(4)}`
  }

  return cleaned
}

export function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // 비율 유지하면서 크기 조정
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // Blob으로 변환
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            resolve(file)
          }
        },
        "image/jpeg",
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}
