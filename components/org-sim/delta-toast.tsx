"use client"

import { useState, useEffect, useCallback } from "react"
import { Check } from "lucide-react"

interface ToastState {
  visible: boolean
  message: string
}

// Global state for toast
let toastCallback: ((message: string) => void) | null = null

export function showDeltaToast(message: string) {
  if (toastCallback) {
    toastCallback(message)
  }
}

export function DeltaToast() {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "" })

  const showToast = useCallback((message: string) => {
    setToast({ visible: true, message })
    setTimeout(() => {
      setToast({ visible: false, message: "" })
    }, 3000)
  }, [])

  useEffect(() => {
    toastCallback = showToast
    return () => {
      toastCallback = null
    }
  }, [showToast])

  if (!toast.visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 text-white shadow-lg">
        <Check className="h-4 w-4" />
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  )
}
