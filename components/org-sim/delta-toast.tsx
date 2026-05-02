"use client"

import { useState, useEffect, useCallback } from "react"

interface ToastState {
  visible: boolean
  message: string
  icon: string
}

// Global state for toast
let toastCallback: ((message: string, icon?: string) => void) | null = null

export function showDeltaToast(message: string, icon: string = "🧠") {
  if (toastCallback) {
    toastCallback(message, icon)
  }
}

export function DeltaToast() {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: "", icon: "🧠" })

  const showToast = useCallback((message: string, icon: string = "🧠") => {
    setToast({ visible: true, message, icon })
    setTimeout(() => {
      setToast({ visible: false, message: "", icon: "🧠" })
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
        <span className="text-base">{toast.icon}</span>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  )
}
