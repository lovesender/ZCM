"use client"

import { useState } from "react"
import Image from "next/image"
import LoadingSpinner from "./ui/loading-spinner"

interface OptimizedVehicleImageProps {
  carModel: string
  className?: string
  width?: number
  height?: number
}

export default function OptimizedVehicleImage({
  carModel,
  className = "",
  width = 200,
  height = 120,
}: OptimizedVehicleImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate a placeholder image based on car model
  const placeholderUrl = `/placeholder.svg?height=${height}&width=${width}&query=car ${carModel}`

  // For real implementation, you would use actual car model images
  // This is just a placeholder that uses the car model name in the query
  const imageUrl = placeholderUrl

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <LoadingSpinner size="small" />
        </div>
      )}
      {hasError ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center p-2">
          이미지를 불러올 수 없습니다
        </div>
      ) : (
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={`${carModel} 이미지`}
          width={width}
          height={height}
          onLoadingComplete={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setHasError(true)
          }}
          className={`object-cover w-full h-full ${isLoading ? "opacity-0" : "opacity-100"}`}
          loading="lazy"
          priority={false}
        />
      )}
    </div>
  )
}
