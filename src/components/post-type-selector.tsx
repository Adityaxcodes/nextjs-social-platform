'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const POST_TYPES = [
  { value: 'update', label: 'Update' },
  { value: 'launch', label: 'Launch' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'funding', label: 'Funding' },
  { value: 'idea', label: 'Idea' },
  { value: 'discussion', label: 'Discussion' },
]

interface PostTypeSelectorProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

export function PostTypeSelector({ value, onChange, error }: PostTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <Label htmlFor="post-type" className="text-foreground font-semibold">
        Post Type <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-input border-border text-foreground focus:ring-2 focus:ring-accent">
          <SelectValue placeholder="Select a post type" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border">
          {POST_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value} className="focus:bg-accent focus:text-accent-foreground">
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
