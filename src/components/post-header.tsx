'use client'

import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PostHeaderProps {
  onBack?: () => void
  onSaveDraft?: () => void
}

export function PostHeader({ onBack, onSaveDraft }: PostHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Create Post</h1>
          <p className="text-muted-foreground mt-1">
            Share updates, launches, ideas, and milestones with the startup community.
          </p>
        </div>
      </div>
      <Button
        onClick={onSaveDraft}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Save className="w-4 h-4" />
        Draft
      </Button>
    </div>
  )
}
