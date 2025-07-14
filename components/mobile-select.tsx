"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
}

interface MobileSelectProps {
  label?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  required?: boolean
  className?: string
}

export default function MobileSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "선택해주세요",
  error,
  required,
  className,
}: MobileSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  const selectedOption = options.find((option) => option.value === value)

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn("text-base font-medium", error ? "text-red-600" : "text-gray-700")}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full h-12 justify-between text-base font-normal",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            !selectedOption && "text-gray-500",
          )}
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen && (
          <>
            {/* 오버레이 */}
            <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />

            {/* 옵션 목록 */}
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "w-full px-4 py-3 text-left text-base hover:bg-gray-50 flex items-center justify-between",
                    "first:rounded-t-lg last:rounded-b-lg",
                    "touch-manipulation", // 모바일 터치 최적화
                    value === option.value && "bg-blue-50 text-blue-600",
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <span>{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}
