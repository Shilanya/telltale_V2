"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

type NotificationType = "success" | "error" | "info"

interface NotificationProps {
  type: NotificationType
  message: string
  duration?: number
  onClose?: () => void
}

export function Notification({ type, message, duration = 5000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-500 text-green-800"
      : type === "error"
        ? "bg-red-100 border-red-500 text-red-800"
        : "bg-blue-100 border-blue-500 text-blue-800"

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md border-l-4 shadow-md ${bgColor} max-w-md z-50`}>
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button
          onClick={() => {
            setIsVisible(false)
            if (onClose) onClose()
          }}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function useNotification() {
  const [notification, setNotification] = useState<{
    type: NotificationType
    message: string
    id: number
  } | null>(null)

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({ type, message, id: Date.now() })
  }

  const hideNotification = () => {
    setNotification(null)
  }

  return {
    notification,
    showSuccess: (message: string) => showNotification("success", message),
    showError: (message: string) => showNotification("error", message),
    showInfo: (message: string) => showNotification("info", message),
    hideNotification,
  }
}
