"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"
// 필드 이름 타입 업데이트를 위한 import 수정
import { validateField, type UserFormData, type ValidationResult } from "@/lib/user-validation"

interface FormFieldProps {
  label: string
  name: keyof UserFormData
  value: string
  onChange: (value: string) => void
  type?: "text" | "email" | "select"
  options?: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  context?: {
    existingEmails?: string[]
    validBranches?: string[]
    validDepartments?: string[]
    currentEmail?: string
  }
  disabled?: boolean
}

export function FormFieldWithValidation({
  label,
  name,
  value,
  onChange,
  type = "text",
  options = [],
  placeholder,
  required = false,
  context = {},
  disabled = false,
}: FormFieldProps) {
  const [validation, setValidation] = useState<ValidationResult>({ isValid: true, errors: [] })
  const [touched, setTouched] = useState(false)

  // 실시간 검증
  useEffect(() => {
    if (touched || value) {
      const result = validateField(name, value, context)
      setValidation(result)
    }
  }, [value, name, context, touched])

  const handleChange = (newValue: string) => {
    onChange(newValue)
    setTouched(true)
  }

  const handleBlur = () => {
    setTouched(true)
  }

  const hasError = touched && !validation.isValid
  const hasSuccess = touched && validation.isValid && value.trim() !== ""

  if (type === "select") {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <Select value={value} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger
              className={`${
                hasError
                  ? "border-red-500 focus:border-red-500"
                  : hasSuccess
                    ? "border-green-500 focus:border-green-500"
                    : ""
              }`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {hasError && (
            <AlertCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
          {hasSuccess && (
            <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
          )}
        </div>
        {hasError && (
          <div className="space-y-1">
            {validation.errors.map((error, index) => (
              <p key={index} className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
              </p>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`pr-8 ${
            hasError
              ? "border-red-500 focus:border-red-500"
              : hasSuccess
                ? "border-green-500 focus:border-green-500"
                : ""
          }`}
        />
        {hasError && (
          <AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
        )}
        {hasSuccess && (
          <CheckCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
        )}
      </div>
      {hasError && (
        <div className="space-y-1">
          {validation.errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
