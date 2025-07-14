"use client"

import { useEffect } from "react"

export default function ClientProviders() {
  useEffect(() => {
    // 개발 환경 감지
    const isDevelopment =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("lite.vusercontent.net") ||
        window.location.hostname.includes("vercel.app") ||
        process.env.NODE_ENV === "development")

    // 개발 환경에서는 Service Worker 등록하지 않음
    if (isDevelopment) {
      console.log("개발 환경에서는 Service Worker를 등록하지 않습니다.")
      return
    }

    // 프로덕션 환경에서만 Service Worker 등록
    if ("serviceWorker" in navigator && !isDevelopment) {
      // Service Worker 파일 존재 확인
      fetch("/sw.js", { method: "HEAD" })
        .then((response) => {
          if (response.ok && response.headers.get("content-type")?.includes("javascript")) {
            // MIME 타입이 올바른 경우에만 등록
            return navigator.serviceWorker.register("/sw.js")
          } else {
            throw new Error("Service Worker 파일이 올바르지 않습니다.")
          }
        })
        .then((registration) => {
          console.log("Service Worker 등록 성공:", registration)
        })
        .catch((error) => {
          // 프로덕션에서도 Service Worker 등록 실패는 치명적이지 않음
          console.warn("Service Worker 등록 실패 (무시됨):", error.message)
        })
    }
  }, [])

  return null
}
