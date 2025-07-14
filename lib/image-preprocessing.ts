export interface PreprocessingOptions {
  enhanceContrast?: boolean
  denoise?: boolean
  sharpen?: boolean
  detectPlateRegion?: boolean
  normalizeSize?: boolean
}

export class ImagePreprocessor {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")!
  }

  async preprocessImage(
    imageFile: File,
    options: PreprocessingOptions = {
      enhanceContrast: true,
      denoise: true,
      sharpen: true,
      detectPlateRegion: true,
      normalizeSize: true,
    },
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = async () => {
        try {
          // 1. 기본 설정
          this.canvas.width = img.width
          this.canvas.height = img.height
          this.ctx.drawImage(img, 0, 0)

          let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)

          // 2. 그레이스케일 변환
          imageData = this.convertToGrayscale(imageData)

          // 3. 노이즈 제거
          if (options.denoise) {
            imageData = this.gaussianBlur(imageData, 1)
          }

          // 4. 대비 향상
          if (options.enhanceContrast) {
            imageData = this.enhanceContrast(imageData)
          }

          // 5. 선명화
          if (options.sharpen) {
            imageData = this.applySharpen(imageData)
          }

          // 6. 번호판 영역 검출 및 추출
          if (options.detectPlateRegion) {
            const plateRegion = await this.detectLicensePlateRegion(imageData)
            if (plateRegion) {
              imageData = plateRegion
            }
          }

          // 7. 크기 정규화
          if (options.normalizeSize) {
            imageData = this.normalizeSize(imageData, 400, 120) // 번호판 비율에 맞춤
          }

          // 8. 최종 이미지 생성
          this.canvas.width = imageData.width
          this.canvas.height = imageData.height
          this.ctx.putImageData(imageData, 0, 0)

          // 9. 파일로 변환
          this.canvas.toBlob(
            (blob) => {
              if (blob) {
                const processedFile = new File([blob], `processed_${imageFile.name}`, {
                  type: "image/png",
                  lastModified: Date.now(),
                })
                resolve(processedFile)
              } else {
                reject(new Error("이미지 전처리 실패"))
              }
            },
            "image/png",
            1.0,
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("이미지 로드 실패"))
      img.src = URL.createObjectURL(imageFile)
    })
  }

  private convertToGrayscale(imageData: ImageData): ImageData {
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
      data[i] = gray // R
      data[i + 1] = gray // G
      data[i + 2] = gray // B
      // Alpha는 그대로 유지
    }
    return imageData
  }

  private enhanceContrast(imageData: ImageData, factor = 1.5): ImageData {
    const data = imageData.data
    const factor255 = (259 * (factor * 255 + 255)) / (255 * (259 - factor * 255))

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, factor255 * (data[i] - 128) + 128))
      data[i + 1] = Math.min(255, Math.max(0, factor255 * (data[i + 1] - 128) + 128))
      data[i + 2] = Math.min(255, Math.max(0, factor255 * (data[i + 2] - 128) + 128))
    }
    return imageData
  }

  private gaussianBlur(imageData: ImageData, radius: number): ImageData {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const newData = new Uint8ClampedArray(data)

    const kernel = this.generateGaussianKernel(radius)
    const kernelSize = kernel.length
    const half = Math.floor(kernelSize / 2)

    for (let y = half; y < height - half; y++) {
      for (let x = half; x < width - half; x++) {
        let r = 0,
          g = 0,
          b = 0

        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const pixelY = y + ky - half
            const pixelX = x + kx - half
            const pixelIndex = (pixelY * width + pixelX) * 4
            const kernelValue = kernel[ky][kx]

            r += data[pixelIndex] * kernelValue
            g += data[pixelIndex + 1] * kernelValue
            b += data[pixelIndex + 2] * kernelValue
          }
        }

        const index = (y * width + x) * 4
        newData[index] = Math.round(r)
        newData[index + 1] = Math.round(g)
        newData[index + 2] = Math.round(b)
      }
    }

    return new ImageData(newData, width, height)
  }

  private applySharpen(imageData: ImageData): ImageData {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const newData = new Uint8ClampedArray(data)

    // 샤프닝 커널
    const kernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0,
          g = 0,
          b = 0

        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const pixelY = y + ky - 1
            const pixelX = x + kx - 1
            const pixelIndex = (pixelY * width + pixelX) * 4
            const kernelValue = kernel[ky][kx]

            r += data[pixelIndex] * kernelValue
            g += data[pixelIndex + 1] * kernelValue
            b += data[pixelIndex + 2] * kernelValue
          }
        }

        const index = (y * width + x) * 4
        newData[index] = Math.min(255, Math.max(0, Math.round(r)))
        newData[index + 1] = Math.min(255, Math.max(0, Math.round(g)))
        newData[index + 2] = Math.min(255, Math.max(0, Math.round(b)))
      }
    }

    return new ImageData(newData, width, height)
  }

  private async detectLicensePlateRegion(imageData: ImageData): Promise<ImageData | null> {
    try {
      // 엣지 검출
      const edges = this.sobelEdgeDetection(imageData)

      // 형태학적 연산으로 번호판 후보 영역 찾기
      const candidates = this.findRectangularRegions(edges)

      // 번호판 비율에 맞는 영역 선택 (가로:세로 = 약 3.3:1)
      const bestCandidate = this.selectBestPlateCandidate(candidates)

      if (bestCandidate) {
        return this.extractRegion(imageData, bestCandidate)
      }

      return null
    } catch (error) {
      console.warn("번호판 영역 검출 실패:", error)
      return null
    }
  }

  private sobelEdgeDetection(imageData: ImageData): ImageData {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const newData = new Uint8ClampedArray(data.length)

    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ]

    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1],
    ]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0,
          gy = 0

        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const pixelY = y + ky - 1
            const pixelX = x + kx - 1
            const pixelIndex = (pixelY * width + pixelX) * 4
            const gray = data[pixelIndex] // 이미 그레이스케일이므로 R 값 사용

            gx += gray * sobelX[ky][kx]
            gy += gray * sobelY[ky][kx]
          }
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy)
        const index = (y * width + x) * 4
        const value = Math.min(255, magnitude)

        newData[index] = value
        newData[index + 1] = value
        newData[index + 2] = value
        newData[index + 3] = 255
      }
    }

    return new ImageData(newData, width, height)
  }

  private findRectangularRegions(imageData: ImageData): Array<{ x: number; y: number; width: number; height: number }> {
    // 간단한 연결 성분 분석으로 사각형 영역 찾기
    const width = imageData.width
    const height = imageData.height
    const data = imageData.data
    const visited = new Array(width * height).fill(false)
    const regions: Array<{ x: number; y: number; width: number; height: number }> = []

    // 임계값 설정 (엣지 강도)
    const threshold = 50

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x
        const pixelIndex = index * 4

        if (!visited[index] && data[pixelIndex] > threshold) {
          const region = this.floodFill(imageData, x, y, visited, threshold)
          if (this.isValidPlateRegion(region)) {
            regions.push(region)
          }
        }
      }
    }

    return regions
  }

  private floodFill(
    imageData: ImageData,
    startX: number,
    startY: number,
    visited: boolean[],
    threshold: number,
  ): { x: number; y: number; width: number; height: number } {
    const width = imageData.width
    const height = imageData.height
    const data = imageData.data
    const stack = [{ x: startX, y: startY }]

    let minX = startX,
      maxX = startX,
      minY = startY,
      maxY = startY

    while (stack.length > 0) {
      const { x, y } = stack.pop()!
      const index = y * width + x

      if (x < 0 || x >= width || y < 0 || y >= height || visited[index]) {
        continue
      }

      const pixelIndex = index * 4
      if (data[pixelIndex] <= threshold) {
        continue
      }

      visited[index] = true
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)

      // 4방향 탐색
      stack.push({ x: x + 1, y })
      stack.push({ x: x - 1, y })
      stack.push({ x, y: y + 1 })
      stack.push({ x, y: y - 1 })
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    }
  }

  private isValidPlateRegion(region: { x: number; y: number; width: number; height: number }): boolean {
    const aspectRatio = region.width / region.height
    const minArea = 1000 // 최소 면적
    const area = region.width * region.height

    // 한국 번호판 비율: 약 3.3:1, 허용 범위: 2.5:1 ~ 4.5:1
    return aspectRatio >= 2.5 && aspectRatio <= 4.5 && area >= minArea
  }

  private selectBestPlateCandidate(
    candidates: Array<{ x: number; y: number; width: number; height: number }>,
  ): { x: number; y: number; width: number; height: number } | null {
    if (candidates.length === 0) return null

    // 면적과 비율을 고려한 점수 계산
    let bestCandidate = candidates[0]
    let bestScore = 0

    for (const candidate of candidates) {
      const aspectRatio = candidate.width / candidate.height
      const area = candidate.width * candidate.height

      // 이상적인 번호판 비율: 3.3:1
      const ratioScore = 1 - Math.abs(aspectRatio - 3.3) / 3.3
      const areaScore = Math.min(area / 10000, 1) // 면적이 클수록 좋음

      const totalScore = ratioScore * 0.7 + areaScore * 0.3

      if (totalScore > bestScore) {
        bestScore = totalScore
        bestCandidate = candidate
      }
    }

    return bestScore > 0.3 ? bestCandidate : null
  }

  private extractRegion(
    imageData: ImageData,
    region: { x: number; y: number; width: number; height: number },
  ): ImageData {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    canvas.width = region.width
    canvas.height = region.height

    // 원본 이미지를 임시 캔버스에 그리기
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")!
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    tempCtx.putImageData(imageData, 0, 0)

    // 지정된 영역만 추출
    ctx.drawImage(tempCanvas, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height)

    return ctx.getImageData(0, 0, region.width, region.height)
  }

  private normalizeSize(imageData: ImageData, targetWidth: number, targetHeight: number): ImageData {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!

    // 원본 이미지를 임시 캔버스에 그리기
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")!
    tempCanvas.width = imageData.width
    tempCanvas.height = imageData.height
    tempCtx.putImageData(imageData, 0, 0)

    // 목표 크기로 리사이즈
    canvas.width = targetWidth
    canvas.height = targetHeight
    ctx.imageSmoothingEnabled = false // 픽셀 보간 비활성화 (텍스트에 더 좋음)
    ctx.drawImage(tempCanvas, 0, 0, imageData.width, imageData.height, 0, 0, targetWidth, targetHeight)

    return ctx.getImageData(0, 0, targetWidth, targetHeight)
  }

  private generateGaussianKernel(radius: number): number[][] {
    const size = 2 * radius + 1
    const kernel: number[][] = []
    const sigma = radius / 3
    let sum = 0

    for (let y = 0; y < size; y++) {
      kernel[y] = []
      for (let x = 0; x < size; x++) {
        const distance = Math.sqrt((x - radius) ** 2 + (y - radius) ** 2)
        const value = Math.exp(-(distance ** 2) / (2 * sigma ** 2))
        kernel[y][x] = value
        sum += value
      }
    }

    // 정규화
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        kernel[y][x] /= sum
      }
    }

    return kernel
  }
}
