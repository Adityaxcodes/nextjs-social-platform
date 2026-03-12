'use client'

import { useState, useRef } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

const MAX_TAGS = 5
const MAX_TAG_LENGTH = 20

interface TagsInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  error?: string
}

export function TagsInput({ tags, onChange, error }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    setLocalError(null)
  }

  const addTag = (tagText: string) => {
    const trimmedTag = tagText.trim()

    // Validation
    if (!trimmedTag) {
      setLocalError('Tag cannot be empty')
      return
    }

    if (trimmedTag.length > MAX_TAG_LENGTH) {
      setLocalError(`Tag must be ${MAX_TAG_LENGTH} characters or less`)
      return
    }

    if (tags.includes(trimmedTag)) {
      setLocalError('This tag already exists')
      return
    }

    if (tags.length >= MAX_TAGS) {
      setLocalError(`Maximum ${MAX_TAGS} tags allowed`)
      return
    }

    // Add tag
    onChange([...tags, trimmedTag])
    setInputValue('')
    setLocalError(null)
    inputRef.current?.focus()
  }

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index))
    setLocalError(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-foreground font-semibold">Tags (Optional)</Label>
        <span className="text-xs text-muted-foreground">
          {tags.length} / {MAX_TAGS}
        </span>
      </div>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <div
              key={index}
              className="bg-accent/10 border border-accent/30 text-accent text-sm rounded-full px-3 py-1 flex items-center gap-2 group"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeTag(index)}
                className="text-accent/60 hover:text-accent transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Add a tag and press Enter"
          maxLength={MAX_TAG_LENGTH}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-accent flex-1"
          disabled={tags.length >= MAX_TAGS}
        />
      </div>

      {(error || localError) && (
        <div className="flex gap-2 items-start">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error || localError}</p>
        </div>
      )}
    </div>
  )
}
