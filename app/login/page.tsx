"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { InfoIcon } from "lucide-react"
import { isAuthenticated } from "@/lib/auth-utils"

export default function LoginPage() {
  const [uniqueNumber, setUniqueNumber] = useState("")
  const [formattedNumber, setFormattedNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // 이미 로그인된 사용자는 관리자 페이지로 리디렉션
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  // 숫자 입력 시 하이픈 자동 추가 함수
  const formatUniqueNumber = (value: string) => {
    // 이미 하이픈이 포함된 입력값에서 하이픈 제거
    const inputWithoutHyphens = value.replace(/-/g, "")

    // 숫자만 추출
    const numbers = inputWithoutHyphens.replace(/[^0-9]/g, "")

    // 13자리로 제한
    const limitedNumbers = numbers.slice(0, 13)

    // 8번째 위치에 하이픈 추가 (00100314-00001 형식)
    let formatted = ""
    if (limitedNumbers.length > 0) {
      // 앞 8자리
      const firstPart = limitedNumbers.slice(0, 8)
      formatted += firstPart

      // 뒤 5자리가 있으면 하이픈 추가
      if (limitedNumbers.length > 8) {
        const secondPart = limitedNumbers.slice(8)
        formatted += "-" + secondPart
      }
    }

    return { formatted, numbers: limitedNumbers }
  }

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // 커서 위치 저장
    const cursorPosition = e.target.selectionStart || 0

    // 이전 값에서 하이픈 개수 계산
    const previousHyphens = (formattedNumber.substring(0, cursorPosition).match(/-/g) || []).length

    const { formatted, numbers } = formatUniqueNumber(inputValue)

    setFormattedNumber(formatted)
    setUniqueNumber(numbers)

    // 다음 렌더링 후 커서 위치 조정
    setTimeout(() => {
      if (e.target instanceof HTMLInputElement) {
        // 새 값에서 커서 위치까지의 하이픈 개수 계산
        const newHyphens = (formatted.substring(0, cursorPosition).match(/-/g) || []).length

        // 하이픈 차이를 고려하여 커서 위치 조정
        const newPosition = cursorPosition + (newHyphens - previousHyphens)

        e.target.setSelectionRange(newPosition, newPosition)
      }
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!uniqueNumber.trim()) {
      setError("고유번호를 입력해 주세요.")
      return
    }

    if (uniqueNumber.length < 13) {
      setError("고유번호는 13자리여야 합니다.")
      return
    }

    setLoading(true)
    setError("")

    try {
      // 실제 구현에서는 여기에 인증 API 호출이 들어갑니다
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 테스트용 고유번호 확인 (실제 구현에서는 서버에서 처리)
      // 문제 해결: 콘솔에 입력값 출력하여 디버깅
      console.log("입력된 고유번호:", uniqueNumber)
      console.log("비교 대상:", "0010031400001")
      console.log("일치 여부:", uniqueNumber === "0010031400001")

      // 수정: 여러 유효한 고유번호를 배열로 관리하여 유연성 향상
      const validUniqueNumbers = ["0010031400001", "0020031400002", "0030031400003"]

      if (validUniqueNumbers.includes(uniqueNumber)) {
        // OTP 요청 상태를 세션 스토리지에 저장
        sessionStorage.setItem("otpRequested", "true")
        sessionStorage.setItem("uniqueNumber", uniqueNumber)

        // 고유번호 확인 후 OTP 페이지로 이동
        router.push("/otp")
      } else {
        setError("유효하지 않은 고유번호입니다. 다시 확인해주세요.")
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 relative mb-4">
            <Image src="/zds-logo.png" alt="로고" fill className="object-contain" priority />
          </div>

          <h1 className="text-2xl font-bold mb-2">ZDS 샘플 관리자 로그인</h1>
          <p className="text-gray-600 text-sm text-center mb-6">접속 허가된 사람만 접속 가능합니다!</p>

          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-2 relative">
              <div className="relative">
                <input
                  type="text"
                  id="uniqueNumber"
                  value={formattedNumber}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(formattedNumber.length > 0)}
                  className="w-full h-14 px-4 pt-2 pb-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
                />
                <label
                  htmlFor="uniqueNumber"
                  className={`absolute text-sm text-gray-500 duration-300 transform transition-all ease-in-out pointer-events-none
                    ${
                      isFocused || formattedNumber
                        ? "-top-2 left-3 scale-75 text-blue-500 bg-white px-1"
                        : "top-1/2 left-4 -translate-y-1/2 scale-100"
                    } 
                    peer-focus:-top-2 peer-focus:left-3 peer-focus:scale-75 peer-focus:text-blue-500 peer-focus:bg-white peer-focus:px-1`}
                >
                  고유번호를 입력해 주세요
                </label>
              </div>
            </div>

            <div className="flex items-start mb-6 min-h-[24px]">
              {(isFocused || formattedNumber) && (
                <>
                  <InfoIcon size={16} className="text-blue-500 mt-0.5 mr-1.5 flex-shrink-0" />
                  <p className="text-xs text-gray-500">올바른 입력 형식: 숫자만 입력 가능합니다 (자동 하이픈(-)됨)</p>
                </>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium flex items-center justify-center"
            >
              {loading ? "처리 중..." : "확인"}
            </button>
          </form>

          {/* 테스트용 고유번호 안내 추가 */}
          <div className="mt-6 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm w-full">
            <p className="font-medium mb-1">테스트용 고유번호:</p>
            <ul className="list-disc pl-5 text-xs">
              <li>00100314-00001</li>
              <li>00200314-00002</li>
              <li>00300314-00003</li>
            </ul>
          </div>

          <div className="mt-6 text-gray-500 text-xs text-center">© 2025 ZDS. All rights reserved.</div>
        </div>
      </div>
    </div>
  )
} 