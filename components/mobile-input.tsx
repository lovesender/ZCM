"use client"

import type React from "react"

import { useState, forwardRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  showPasswordToggle?: boolean
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, error, helperText, showPasswordToggle, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const inputType = showPasswordToggle && showPassword ? "text" : type

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={props.id}
            className={cn(
              "text-base font-medium transition-colors",
              error ? "text-red-600" : isFocused ? "text-blue-600" : "text-gray-700",
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        <div className="relative">
          <Input
            ref={ref}
            type={inputType}
            className={cn(
              "h-12 text-base transition-all duration-200",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "touch-manipulation", // 모바일 터치 최적화
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className,
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {showPasswordToggle && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 flex items-center space-x-1">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        )}

        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    )
  },
)

MobileInput.displayName = "MobileInput"

export default MobileInput
