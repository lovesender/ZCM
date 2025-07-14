"use client"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Option {
  value: string
  label: string
  description?: string
}

interface MobileRadioGroupProps {
  label?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  error?: string
  required?: boolean
  className?: string
  columns?: 1 | 2 | 3
}

export default function MobileRadioGroup({
  label,
  value,
  options,
  onChange,
  error,
  required,
  className,
  columns = 2,
}: MobileRadioGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <Label className={cn("text-base font-medium", error ? "text-red-600" : "text-gray-700")}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      <div
        className={cn(
          "grid gap-3",
          columns === 1 && "grid-cols-1",
          columns === 2 && "grid-cols-1 sm:grid-cols-2",
          columns === 3 && "grid-cols-1 sm:grid-cols-3",
        )}
      >
        {options.map((option) => {
          const isSelected = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "p-4 border-2 rounded-lg text-left transition-all duration-200",
                "touch-manipulation", // 모바일 터치 최적화
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                error && !isSelected && "border-red-200",
              )}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                    isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300",
                  )}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  {option.description && <div className="text-sm text-gray-500 mt-1">{option.description}</div>}
                </div>
              </div>
            </button>
          )
        })}
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
