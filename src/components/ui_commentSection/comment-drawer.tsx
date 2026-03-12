'use client'

import * as React from 'react'
import { X, Heart } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui_commentSection/drawer'
import { Button } from '@/components/ui_commentSection/button'
import { Input } from '@/components/ui_commentSection/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui_commentSection/avatar'
import { ScrollArea } from '@/components/ui_commentSection/scroll-area'
import { cn } from '@/lib/utils'

interface Comment {
  id: string
  userId: string
  username: string
  avatar: string
  text: string
  timestamp: string
  likes?: number
  liked?: boolean
}

interface CommentDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  comments?: Comment[]
  onSubmitComment?: (text: string) => void
  currentUser?: {
    username: string
    avatar: string
  }
}

const formatTimeAgo = (timestamp: string): string => {
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function CommentDrawer({
  open,
  onOpenChange,
  comments = [],
  onSubmitComment,
  currentUser = {
    username: 'You',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
  },
}: CommentDrawerProps) {
  const [commentText, setCommentText] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new comments are added
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView()
    }
  }, [comments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmitComment?.(commentText)
      setCommentText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="right-0 top-0 bottom-0 left-auto h-full w-full max-w-[420px] flex flex-col rounded-none border-l border-border bg-card">
        <DrawerHeader className="flex items-center justify-between border-b border-border px-4 py-3">
          <DrawerTitle className="text-base font-semibold text-foreground">
            Comments
          </DrawerTitle>
          <DrawerDescription className="sr-only">
            View and add comments to this post
          </DrawerDescription>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Comments List */}
          {comments.length > 0 ? (
            <ScrollArea className="flex-1">
              <div className="space-y-4 p-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="group flex gap-3 rounded-md p-2 transition-colors hover:bg-muted/50"
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={comment.avatar} alt={comment.username} />
                      <AvatarFallback>
                        {comment.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {comment.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(comment.timestamp)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-foreground break-words">
                        {comment.text}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                          onClick={() => console.log('Like comment:', comment.id)}
                        >
                          <Heart
                            className={cn(
                              'h-3.5 w-3.5',
                              comment.liked && 'fill-primary text-primary',
                            )}
                          />
                          {comment.likes ? (
                            <span className="text-xs">
                              {comment.likes}
                            </span>
                          ) : null}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
              <p className="text-sm text-muted-foreground font-medium">
                No comments yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Start the conversation
              </p>
            </div>
          )}
        </div>

        {/* Comment Input Section */}
        <div className="border-t border-border bg-card p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage
                src={currentUser.avatar}
                alt={currentUser.username}
              />
              <AvatarFallback>
                {currentUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-1 gap-2">
              <Input
                type="text"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSubmitting}
                className="flex-1 bg-muted text-foreground placeholder:text-muted-foreground border-border"
              />
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={!commentText.trim() || isSubmitting}
                className="shrink-0"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
