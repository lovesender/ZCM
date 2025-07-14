"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import type { Notification } from "@/lib/notification-manager"

export default function ToastNotification() {
  const [toasts, setToasts] = useState<Notification[]>([])

  useEffect(() => {
    const handleShowToast = (event: CustomEvent<Notification>) => {
      const notification = event.detail
      setToasts((prev) => [...prev, notification])

      // 자동 제거 (긴급하지 않은 경우)
      if (notification.priority !== "urgent") {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== notification.id))
        }, 5000)
      }
    }

    window.addEventListener("show-toast", handleShowToast as EventListener)
    return () => {
      window.removeEventListener("show-toast", handleShowToast as EventListener)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200"
      case "error":
        return "bg-red-50 border-red-200"
      case "warning":
        return "bg-yellow-50 border-yellow-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 ${getBackgroundColor(toast.type)} animate-in slide-in-from-right duration-300`}
        >
          <div className="flex items-start gap-3">
            {getIcon(toast.type)}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">{toast.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
              {toast.actionUrl && (
                <button
                  onClick={() => {
                    window.open(toast.actionUrl, "_blank")
                    removeToast(toast.id)
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-2 underline"
                >
                  자세히 보기
                </button>
              )}
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
