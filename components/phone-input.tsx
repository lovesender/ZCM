"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { formatPhoneNumber, validatePhoneNumber } from "@/lib/phone-formatter"

interface PhoneInputProps {
  id: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onValidityChange?: (isValid: boolean) => void
  placeholder?: string
  className?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  maxLength?: number
}

export default function PhoneInput({
  id,
  name,
  value,
  onChange,
  onValidityChange,
  placeholder = "010-0000-0000",
  className = "",
  required = false,
  disabled = false,
  autoComplete = "tel",
  maxLength = 13,
}: PhoneInputProps) {
  const [isValid, setIsValid] = useState(true)

  // 값이 변경될 때마다 유효성 검사
  useEffect(() => {
    const valid = value === "" || validatePhoneNumber(value)
    setIsValid(valid)
    if (onValidityChange) {
      onValidityChange(valid)
    }
  }, [value, onValidityChange])

  // 입력 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target
    const formattedValue = formatPhoneNumber(input.value)

    // 원래 이벤트 객체를 복제하여 수정
    const syntheticEvent = {
      ...e,
      target: {
        ...input,
        value: formattedValue,
      },
    }

    onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <Input
      id={id}
      name={name}
      type="tel"
      value={value}
      onChange={handleInputChange}
      placeholder={placeholder}
      className={`${className} ${!isValid && value ? "border-red-500" : ""}`}
      required={required}
      disabled={disabled}
      autoComplete={autoComplete}
      maxLength={maxLength}
      inputMode="numeric"
    />
  )
}
