'use client'

import { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface SuccessToastProps {
  message: string
  onClose: () => void
  autoCloseDuration?: number
}

export function SuccessToast({
  message,
  onClose,
  autoCloseDuration = 4000,
}: SuccessToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, autoCloseDuration)
    return () => clearTimeout(timer)
  }, [onClose, autoCloseDuration])

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in">
      <div className="bg-accent text-accent-foreground rounded-lg px-4 py-3 shadow-lg flex items-center gap-3">
        <CheckCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-accent-foreground/20 rounded transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
