"use client"

import { memo, useState, useRef, useEffect } from "react"
import { PERFORMANCE_CONFIG } from "@/app/config/performance"

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: "blur" | "empty"
  quality?: number
}

export default memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  placeholder = "blur",
  quality = 75,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver>()

  // 지연 로딩 설정
  useEffect(() => {
    if (priority) return

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observerRef.current?.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${PERFORMANCE_CONFIG.IMAGE.LAZY_LOAD_THRESHOLD}px`,
      },
    )

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [priority])

  // WebP 지원 확인
  const getOptimizedSrc = (originalSrc: string) => {
    if (!PERFORMANCE_CONFIG.IMAGE.WEBP_SUPPORT) return originalSrc

    // 이미 WebP인 경우 그대로 반환
    if (originalSrc.includes(".webp")) return originalSrc

    // placeholder 이미지인 경우 WebP로 변환
    if (originalSrc.includes("placeholder.svg")) {
      return originalSrc.replace("placeholder.svg", "placeholder.webp")
    }

    return originalSrc
  }

  // 크기별 srcSet 생성
  const generateSrcSet = (baseSrc: string) => {
    if (baseSrc.includes("placeholder.svg")) return undefined

    const sizes = Object.values(PERFORMANCE_CONFIG.IMAGE.SIZES)
    return sizes.map((size) => `${baseSrc}?w=${size}&q=${quality} ${size}w`).join(", ")
  }

  // 플레이스홀더 생성
  const getPlaceholderSrc = () => {
    if (placeholder === "empty") return undefined

    const w = width || 400
    const h = height || 300
    return `/placeholder.svg?height=${h}&width=${w}&quality=${PERFORMANCE_CONFIG.IMAGE.PLACEHOLDER_QUALITY}`
  }

  const handleLoad = () => {
    setIsLoaded(true)
    setError(false)
  }

  const handleError = () => {
    setError(true)
    setIsLoaded(false)
  }

  const optimizedSrc = getOptimizedSrc(src)
  const srcSet = generateSrcSet(optimizedSrc)
  const placeholderSrc = getPlaceholderSrc()

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* 플레이스홀더 */}
      {!isLoaded && placeholder === "blur" && placeholderSrc && (
        <img
          src={placeholderSrc || "/placeholder.svg"}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* 메인 이미지 */}
      {isInView && (
        <img
          src={error ? placeholderSrc || src : optimizedSrc}
          srcSet={!error ? srcSet : undefined}
          sizes={width ? `${width}px` : "100vw"}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? "opacity-100" : "opacity-0"}
            ${error ? "filter grayscale" : ""}
          `}
        />
      )}

      {/* 로딩 인디케이터 */}
      {!isLoaded && !error && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  )
})
