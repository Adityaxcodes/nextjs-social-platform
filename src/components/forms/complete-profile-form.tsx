'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X, Upload, Loader2, Check } from 'lucide-react'
import { completeProfileSchema, type CompleteProfileFormData } from '@/lib/validation/profile'

const roleOptions = [
  { value: 'founder', label: 'Founder' },
  { value: 'co-founder', label: 'Co-Founder' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'pm', label: 'Product Manager' },
  { value: 'marketer', label: 'Marketer' },
  { value: 'investor', label: 'Investor' },
  { value: 'student', label: 'Student' },
  { value: 'other', label: 'Other' },
]

export function CompleteProfileForm() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [interestInput, setInterestInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const usernameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onChange',
    defaultValues: { interests: [] },
  })

  const usernameValue = watch('username') || ''
  const bio = watch('bio') || ''
  const interests = watch('interests') || []

  // Pre-fill existing profile data from DB
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/profile')
      .then((r) => r.json())
      .then((data) => {
        reset({
          fullName: data.name || '',
          username: data.username || session?.user?.username || '',
          bio: data.bio || '',
          primaryRole: data.role || '',
          startupName: data.startup || '',
          location: data.location || '',
          website: data.website || '',
          interests: data.interests || [],
        })
        if (data.image) setImagePreview(data.image)
      })
      .finally(() => setIsFetching(false))
  }, [status, session, reset])

  // Real username availability check against DB
  const handleUsernameChange = (value: string) => {
    const lowercased = value.toLowerCase()
    setValue('username', lowercased, { shouldValidate: true })
    setUsernameAvailable(null)
    if (!lowercased || lowercased.length < 3) return
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(lowercased)}`)
        const data = await res.json()
        setUsernameAvailable(data.available)
      } catch {
        setUsernameAvailable(null)
      }
    }, 400)
  }

  // Image handling
  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImageFile(file)
  }

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith('image/')) processImageFile(file)
    else toast.error('Please drop an image file')
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Interests
  const addInterest = (value: string) => {
    const trimmed = value.trim().toLowerCase()
    if (!trimmed) return
    if (interests.includes(trimmed)) { toast.error('Already added'); return }
    if (interests.length >= 5) { toast.error('Maximum 5 interests'); return }
    setValue('interests', [...interests, trimmed], { shouldValidate: true })
    setInterestInput('')
  }

  const removeInterest = (index: number) => {
    setValue('interests', interests.filter((_, i) => i !== index), { shouldValidate: true })
  }

  // Submit — upload image if changed, then save profile
  const onSubmit = async (data: CompleteProfileFormData) => {
    setIsSubmitting(true)
    try {
      let imageUrl: string | undefined
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) {
          toast.error('Image upload failed. Please try again.')
          setIsSubmitting(false)
          return
        }
        const { url } = await uploadRes.json()
        imageUrl = url
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.fullName,
          username: data.username,
          bio: data.bio,
          role: data.primaryRole,
          startup: data.startupName ?? '',
          location: data.location ?? '',
          website: data.website ?? '',
          interests: data.interests ?? [],
          ...(imageUrl ? { image: imageUrl } : {}),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'Failed to save profile.')
        return
      }

      toast.success('Profile saved!')
      router.push(`/profile/${data.username}`)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading' || isFetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#a1a1a6' }} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight" style={{ color: '#f5f5f7' }}>
          Complete Your Profile
        </h1>
        <p style={{ color: '#a1a1a6' }} className="text-sm">
          This information will be publicly visible on your profile.
        </p>
      </div>

      {/* ── Basic Info ── */}
      <div className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium mb-2" style={{ color: '#f5f5f7' }}>
            Full Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors outline-none"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: errors.fullName ? '#ef4444' : '#27272b',
              color: '#f5f5f7',
            }}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.fullName.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: '#f5f5f7' }}>
            Username <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-2.5 text-sm select-none" style={{ color: '#a1a1a6' }}>@</div>
            <input
              id="username"
              type="text"
              placeholder="johndoe"
              className="w-full pl-8 pr-10 py-2 rounded-xl border text-sm transition-colors outline-none"
              style={{
                backgroundColor: '#0f0f11',
                borderColor: errors.username ? '#ef4444' : '#27272b',
                color: '#f5f5f7',
              }}
              {...register('username', {
                onChange: (e) => handleUsernameChange(e.target.value),
              })}
            />
            {usernameAvailable === true && usernameValue && !errors.username && (
              <Check className="absolute right-3 top-2.5 w-5 h-5" style={{ color: '#22c55e' }} />
            )}
          </div>
          {errors.username && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.username.message}</p>
          )}
          {usernameAvailable === true && usernameValue && !errors.username && (
            <p className="text-sm mt-1" style={{ color: '#22c55e' }}>@{usernameValue} is available</p>
          )}
          {usernameAvailable === false && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>@{usernameValue} is already taken</p>
          )}
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#f5f5f7' }}>
            Profile Picture
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
            style={{ borderColor: '#27272b', backgroundColor: '#0f0f11' }}
          >
            {imagePreview ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage() }}
                    className="absolute -top-2 -right-2 rounded-full p-1 transition-colors"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    <X className="w-4 h-4" style={{ color: '#fff' }} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                  className="text-sm"
                  style={{ color: '#6366f1' }}
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8" style={{ color: '#a1a1a6' }} />
                <p className="text-sm font-medium" style={{ color: '#f5f5f7' }}>
                  Drag and drop your image here
                </p>
                <p className="text-xs" style={{ color: '#a1a1a6' }}>or click to select (max 5MB)</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        {/* Bio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="bio" className="block text-sm font-medium" style={{ color: '#f5f5f7' }}>
              Bio <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <span className="text-xs" style={{ color: bio.length > 150 ? '#ef4444' : '#a1a1a6' }}>
              {bio.length}/160
            </span>
          </div>
          <textarea
            id="bio"
            placeholder="Tell us about yourself..."
            maxLength={160}
            rows={4}
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors resize-none outline-none"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: errors.bio ? '#ef4444' : '#27272b',
              color: '#f5f5f7',
            }}
            {...register('bio')}
          />
          {errors.bio && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.bio.message}</p>
          )}
        </div>
      </div>

      {/* ── Professional ── */}
      <div className="space-y-6 pt-4 border-t" style={{ borderColor: '#27272b' }}>
        {/* Primary Role */}
        <div>
          <label htmlFor="primaryRole" className="block text-sm font-medium mb-2" style={{ color: '#f5f5f7' }}>
            Primary Role <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            id="primaryRole"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors outline-none appearance-none cursor-pointer"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: errors.primaryRole ? '#ef4444' : '#27272b',
              color: '#f5f5f7',
            }}
            {...register('primaryRole')}
          >
            <option value="">Select a role</option>
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value} style={{ backgroundColor: '#0f0f11' }}>
                {r.label}
              </option>
            ))}
          </select>
          {errors.primaryRole && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.primaryRole.message}</p>
          )}
        </div>

        {/* Startup Name */}
        <div>
          <label htmlFor="startupName" className="block text-sm font-medium mb-2" style={{ color: '#f5f5f7' }}>
            Startup / Company
          </label>
          <input
            id="startupName"
            type="text"
            placeholder="Optional"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors outline-none"
            style={{ backgroundColor: '#0f0f11', borderColor: '#27272b', color: '#f5f5f7' }}
            {...register('startupName')}
          />
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-2" style={{ color: '#f5f5f7' }}>
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="City, Country"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors outline-none"
            style={{ backgroundColor: '#0f0f11', borderColor: '#27272b', color: '#f5f5f7' }}
            {...register('location')}
          />
        </div>

        {/* Website */}
        <div>
          <label htmlFor="website" className="block text-sm font-medium mb-2" style={{ color: '#f5f5f7' }}>
            Website
          </label>
          <input
            id="website"
            type="url"
            placeholder="https://example.com"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors outline-none"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: errors.website ? '#ef4444' : '#27272b',
              color: '#f5f5f7',
            }}
            {...register('website')}
          />
          {errors.website && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{errors.website.message}</p>
          )}
        </div>
      </div>

      {/* ── Interests ── */}
      <div className="space-y-4 pt-4 border-t" style={{ borderColor: '#27272b' }}>
        <div>
          <label htmlFor="interests" className="block text-sm font-medium mb-2" style={{ color: '#f5f5f7' }}>
            Interests {interests.length > 0 && `(${interests.length}/5)`}
          </label>
          <div className="flex gap-2">
            <input
              id="interests"
              type="text"
              placeholder="Add an interest..."
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); addInterest(interestInput) }
              }}
              className="flex-1 px-4 py-2 rounded-xl border text-sm transition-colors outline-none"
              style={{ backgroundColor: '#0f0f11', borderColor: '#27272b', color: '#f5f5f7' }}
              disabled={interests.length >= 5}
            />
            <button
              type="button"
              onClick={() => addInterest(interestInput)}
              disabled={interests.length >= 5 || !interestInput.trim()}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#6366f1', color: '#fff' }}
            >
              Add
            </button>
          </div>
        </div>

        {interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: '#27272b', color: '#f5f5f7' }}
              >
                {interest}
                <button
                  type="button"
                  onClick={() => removeInterest(index)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Submit ── */}
      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#27272b' }}>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: '#6366f1', color: '#fff' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save & View Profile'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/profile/${session?.user?.username}`)}
          className="px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{ backgroundColor: '#27272b', color: '#a1a1a6' }}
        >
          Skip for now
        </button>
      </div>
    </form>
  )
}
