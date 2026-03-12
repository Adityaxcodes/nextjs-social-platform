'use client'

import { useState, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const MAX_CHARACTERS = 1000

interface CaptionFieldProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function CaptionField({ value, onChange, error }: CaptionFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [displayValue, setDisplayValue] = useState(value)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [displayValue])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (newValue.length <= MAX_CHARACTERS) {
      setDisplayValue(newValue)
      onChange(newValue)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="caption" className="text-foreground font-semibold">
          Caption <span className="text-destructive">*</span>
        </Label>
        <span className={`text-sm ${
          displayValue.length > MAX_CHARACTERS * 0.9
            ? 'text-destructive'
            : 'text-muted-foreground'
        }`}>
          {displayValue.length} / {MAX_CHARACTERS}
        </span>
      </div>
      <Textarea
        id="caption"
        ref={textareaRef}
        value={displayValue}
        onChange={handleChange}
        placeholder="What's happening in your startup?"
        className="resize-none min-h-24 bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent"
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
