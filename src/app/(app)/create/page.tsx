'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PostHeader } from '@/components/post-header'
import { CaptionField } from '@/components/caption-field'
import { PostTypeSelector } from '@/components/post-type-selector'
import { MediaUpload } from '@/components/media-upload'
import { TagsInput } from '@/components/tags-input'
import { AdvancedSettings } from '@/components/advanced-settings'
import { SuccessToast } from '@/components/success-toast'

interface FormErrors {
  caption?: string
  postType?: string
  media?: string
}

export default function CreatePostPage() {
  const router = useRouter()
  const { status } = useSession()

  // Redirect unauthenticated users to login before they can fire any API request
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  const [caption, setCaption] = useState('')
  const [postType, setPostType] = useState('update')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [visibility, setVisibility] = useState('public')
  const [allowComments, setAllowComments] = useState(true)
  const [postAs, setPostAs] = useState('personal')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    const trimmedCaption = caption.trim()
    if (!trimmedCaption) {
      newErrors.caption = 'Caption is required'
    } else if (trimmedCaption.length < 3) {
      newErrors.caption = 'Caption must be at least 3 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle file selection
  const handleFileSelect = async (file: File) => {
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
    if (!supportedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        media: 'Unsupported file type. Please use JPG, PNG, WebP, or MP4.',
      }))
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setErrors((prev) => ({ ...prev, media: 'File size exceeds 10MB limit.' }))
      return
    }

    setSelectedFile(file)
    setIsUploading(true)
    setErrors((prev) => ({ ...prev, media: undefined }))

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        setIsUploading(false)
      }
      reader.onerror = () => {
        setErrors((prev) => ({ ...prev, media: 'Failed to load preview. Please try again.' }))
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setErrors((prev) => ({ ...prev, media: 'Failed to process file.' }))
      setIsUploading(false)
    }
  }

  // Handle file removal
  const handleFileRemove = () => {
    setSelectedFile(null)
    setPreview(null)
    setErrors((prev) => ({ ...prev, media: undefined }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      // Upload file first if one was selected
      let uploadedUrl: string | undefined
      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json()
          setErrors((prev) => ({ ...prev, media: uploadErr.error || 'Upload failed' }))
          setIsSubmitting(false)
          return
        }
        const { url } = await uploadRes.json()
        uploadedUrl = url
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: caption.trim(),
          mediaUrl: uploadedUrl ?? '',
          mediaType: selectedFile
            ? selectedFile.type.startsWith('video/')
              ? 'video'
              : 'image'
            : 'text',
          postType,
          tags,
          visibility,
          allowComments,
          postAs,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setErrors((prev) => ({
          ...prev,
          caption: data.error || 'Failed to publish post. Please try again.',
        }))
        return
      }

      setShowSuccess(true)

      setTimeout(() => {
        router.push('/feed')
      }, 1500)
    } catch {
      setErrors((prev) => ({
        ...prev,
        caption: 'Failed to publish post. Please try again.',
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    }
  }

  const handleSaveDraft = () => {
    console.log('Draft saved:', { caption, postType, tags })
  }

  const isFormValid = caption.trim().length > 0 && !isSubmitting && !isUploading

  // Don't render the form until session status is resolved
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PostHeader onBack={handleBack} onSaveDraft={handleSaveDraft} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Container */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-lg space-y-6">
            {/* Caption Field */}
            <CaptionField
              value={caption}
              onChange={setCaption}
              error={errors.caption}
            />

            <div className="h-px bg-border" />

            {/* Post Type */}
            <PostTypeSelector
              value={postType}
              onChange={setPostType}
              error={errors.postType}
            />

            <div className="h-px bg-border" />

            {/* Media Upload */}
            <MediaUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile ?? undefined}
              preview={preview ?? undefined}
              error={errors.media}
              isUploading={isUploading}
            />

            <div className="h-px bg-border" />

            {/* Tags Input */}
            <TagsInput tags={tags} onChange={setTags} />

            <div className="h-px bg-border" />

            {/* Advanced Settings */}
            <AdvancedSettings
              visibility={visibility}
              onVisibilityChange={setVisibility}
              allowComments={allowComments}
              onAllowCommentsChange={setAllowComments}
              postAs={postAs}
              onPostAsChange={setPostAs}
            />
          </div>

          {/* Submit Section */}
          <div className="flex gap-3">
            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid || isUploading}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 rounded-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                'Publish Post'
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Your post will be visible to the community immediately after publishing.
          </p>
        </form>
      </main>

      {/* Success Toast */}
      {showSuccess && (
        <SuccessToast
          message="Post published successfully! 🎉"
          onClose={() => setShowSuccess(false)}
        />
      )}
    </div>
  )
}