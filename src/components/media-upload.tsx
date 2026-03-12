'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
const DISPLAY_TYPES = ['.jpg', '.png', '.webp', '.mp4']

interface MediaUploadProps {
  onFileSelect: (file: File) => Promise<void>
  onFileRemove: () => void
  selectedFile?: File
  preview?: string
  error?: string
  isUploading?: boolean
}

export function MediaUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  preview,
  error,
  isUploading = false,
}: MediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.target === dropZoneRef.current) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const validateAndProcessFile = async (file: File) => {
    // Validate file type
    if (!SUPPORTED_TYPES.includes(file.type)) {
      // Error handling is managed by parent component
      return false
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      // Error handling is managed by parent component
      return false
    }

    await onFileSelect(file)
    return true
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await validateAndProcessFile(files[0])
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      await validateAndProcessFile(files[0])
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-3">
      <Label className="text-foreground font-semibold">Media Upload (Optional)</Label>

      {!selectedFile && (
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
            isDragging
              ? 'border-accent bg-accent/5'
              : 'border-border bg-muted/20 hover:border-accent/50'
          }`}
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick()
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={DISPLAY_TYPES.join(',')}
            onChange={handleFileInput}
            className="hidden"
          />
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-foreground font-medium">Drag and drop your file here</p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Supported: {DISPLAY_TYPES.join(', ')} (Max 10MB)
          </p>
        </div>
      )}

      {selectedFile && !preview && isUploading && (
        <div className="bg-muted/20 border border-border rounded-2xl p-6 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-accent animate-spin" />
          <div className="text-left">
            <p className="text-sm text-foreground font-medium">Uploading...</p>
            <p className="text-xs text-muted-foreground">{selectedFile.name}</p>
          </div>
        </div>
      )}

      {preview && (
        <div className="relative bg-muted/20 border border-border rounded-2xl overflow-hidden">
          {selectedFile?.type.startsWith('image/') ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover"
            />
          ) : (
            <video
              src={preview}
              className="w-full h-64 object-cover bg-black"
              controls
            />
          )}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              onClick={onFileRemove}
              size="sm"
              variant="destructive"
              className="gap-1"
            >
              <X className="w-4 h-4" />
              Remove
            </Button>
          </div>
          {selectedFile && (
            <div className="absolute bottom-3 left-3 right-3 bg-black/70 text-white text-xs rounded p-2">
              {selectedFile.name} • {formatFileSize(selectedFile.size)}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
