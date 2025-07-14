// 실제 환경에서는 Tesseract.js를 사용하지만,
// 데모용으로 간단한 시뮬레이션 함수를 제공합니다.

export interface OCRResult {
  text: string
  confidence: number
  plateNumber?: string
}

// 한국 차량 번호판 패턴
const KOREAN_PLATE_PATTERNS = [/(\d{2,3}[가-힣]\d{4})/g, /([가-힣]\d{2}[가-힣]\d{4})/g]

export async function extractPlateFromImage(imageFile: File): Promise<string | null> {
  // 실제 구현에서는 여기서 Tesseract.js를 사용
  // 현재는 시뮬레이션을 위한 코드

  return new Promise((resolve) => {
    // 파일명이나 크기를 기반으로 시뮬레이션
    const fileName = imageFile.name.toLowerCase()
    const mockPlates = ["12가 3456", "34나 5678", "56다 7890", "78라 1234", "90마 5678", "123바 4567"]

    setTimeout(
      () => {
        if (fileName.includes("car") || fileName.includes("vehicle") || fileName.includes("plate")) {
          const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)]
          resolve(randomPlate)
        } else {
          // 50% 확률로 번호판 인식 성공
          const success = Math.random() > 0.5
          if (success) {
            const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)]
            resolve(randomPlate)
          } else {
            resolve(null)
          }
        }
      },
      2000 + Math.random() * 3000,
    ) // 2-5초 랜덤 지연
  })
}

export function formatPlateNumber(plateNumber: string): string {
  // 번호판 형식 정리
  const cleaned = plateNumber.replace(/[\s-]/g, "")

  if (/^\d{2}[가-힣]\d{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 2)}${cleaned.slice(2, 3)} ${cleaned.slice(3)}`
  } else if (/^\d{3}[가-힣]\d{4}$/.test(cleaned)) {
    return `${cleaned.slice(0, 3)}${cleaned.slice(3, 4)} ${cleaned.slice(4)}`
  }

  return cleaned
}
