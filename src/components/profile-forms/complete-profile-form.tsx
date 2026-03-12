'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X, Upload, Loader2, Check } from 'lucide-react'
import { completeProfileSchema, type CompleteProfileFormData } from '@/lib/validation/profile'

const roleOptions = [
  { value: 'founder', label: 'Founder' },
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
  const hasFetchedRef = useRef(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    mode: 'onChange',
    defaultValues: {
      interests: [],
    },
  })

  const username = watch('username') || ''
  const bio = watch('bio') || ''
  const interests = watch('interests') || []

  // Pre-fill existing profile data from DB
  useEffect(() => {
    if (status !== 'authenticated' || hasFetchedRef.current) return
    hasFetchedRef.current = true
    fetch('/api/profile')
      .then((r) => r.json())
      .then(async (data) => {
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
        await trigger()
      })
      .finally(() => setIsFetching(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // Debounced username availability check against DB
  const handleUsernameChange = (value: string) => {
    const lowercasedUsername = value.toLowerCase()
    setValue('username', lowercasedUsername, { shouldValidate: true })
    setUsernameAvailable(null)
    if (!lowercasedUsername || lowercasedUsername.length < 3) return
    if (usernameTimerRef.current) clearTimeout(usernameTimerRef.current)
    usernameTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(lowercasedUsername)}`)
        const data = await res.json()
        setUsernameAvailable(data.available)
      } catch {
        setUsernameAvailable(null)
      }
    }, 400)
  }

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processImageFile(file)
    } else {
      toast.error('Please drop an image file')
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processImageFile(file)
    }
  }

  const processImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const addInterest = (interest: string) => {
    const trimmed = interest.trim().toLowerCase()
    if (!trimmed) return

    if (interests.includes(trimmed)) {
      toast.error('This interest is already added')
      return
    }

    if (interests.length >= 5) {
      toast.error('Maximum 5 interests allowed')
      return
    }

    setValue('interests', [...interests, trimmed], { shouldValidate: true })
    setInterestInput('')
  }

  const removeInterest = (index: number) => {
    setValue(
      'interests',
      interests.filter((_, i) => i !== index),
      { shouldValidate: true }
    )
  }

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
      style={{ backgroundColor: '#1a1a1f' }}
    >
      {/* Header Section */}
      <div className="space-y-2">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: '#f5f5f7' }}
        >
          Complete Your Profile
        </h1>
        <p style={{ color: '#a1a1a6' }}>
          This information will be publicly visible on your profile.
        </p>
      </div>

      {/* Basic Info Section */}
      <div className="space-y-6">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium mb-2"
            style={{ color: '#f5f5f7' }}
          >
            Full Name *
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="John Doe"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: errors.fullName ? '#ef4444' : '#27272b',
              color: '#f5f5f7',
            }}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Username Field */}
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium mb-2"
            style={{ color: '#f5f5f7' }}
          >
            Username *
          </label>
          <div className="relative">
            <div
              className="absolute left-4 top-2.5 text-sm"
              style={{ color: '#a1a1a6' }}
            >
              @
            </div>
            <input
              id="username"
              type="text"
              placeholder="johndoe"
              className="w-full pl-8 pr-12 py-2 rounded-xl border text-sm transition-colors"
              style={{
                backgroundColor: '#0f0f11',
                borderColor: errors.username ? '#ef4444' : '#27272b',
                color: '#f5f5f7',
              }}
              {...register('username', {
                onChange: (e) => handleUsernameChange(e.target.value),
              })}
            />
            {usernameAvailable && username && (
              <Check
                className="absolute right-3 top-2.5 w-5 h-5"
                style={{ color: '#22c55e' }}
              />
            )}
          </div>
          {errors.username && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
              {errors.username.message}
            </p>
          )}
          {usernameAvailable && username && !errors.username && (
            <p className="text-sm mt-1" style={{ color: '#22c55e' }}>
              @{username} is available
            </p>
          )}
        </div>

        {/* Profile Image */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#f5f5f7' }}>
            Profile Picture
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleImageDrop}
            className="rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
            style={{
              borderColor: '#27272b',
              backgroundColor: '#0f0f11',
            }}
            onClick={() => fileInputRef.current?.click()}
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
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage()
                    }}
                    className="absolute -top-2 -right-2 rounded-full p-1 transition-colors"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    <X className="w-4 h-4" style={{ color: '#fff' }} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  className="text-sm"
                  style={{ color: '#6366f1' }}
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8" style={{ color: '#a1a1a6' }} />
                <p style={{ color: '#f5f5f7' }} className="text-sm font-medium">
                  Drag and drop your image here
                </p>
                <p style={{ color: '#a1a1a6' }} className="text-xs">
                  or click to select (max 5MB)
                </p>
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

        {/* Bio Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="bio"
              className="block text-sm font-medium"
              style={{ color: '#f5f5f7' }}
            >
              Bio *
            </label>
            <span
              className="text-xs"
              style={{ color: bio.length > 150 ? '#ef4444' : '#a1a1a6' }}
            >
              {bio.length}/160
            </span>
          </div>
          <textarea
            id="bio"
            placeholder="Tell us about yourself..."
            maxLength={160}
            rows={4}
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors resize-none"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: errors.bio ? '#ef4444' : '#27272b',
              color: '#f5f5f7',
            }}
            {...register('bio')}
          />
          {errors.bio && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
              {errors.bio.message}
            </p>
          )}
        </div>
      </div>

      {/* Professional Section */}
      <div className="space-y-6 pt-4 border-t" style={{ borderColor: '#27272b' }}>
        {/* Primary Role */}
        <div>
          <label
            htmlFor="primaryRole"
            className="block text-sm font-medium mb-2"
            style={{ color: '#f5f5f7' }}
          >
            Primary Role *
          </label>
          <select
            id="primaryRole"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: errors.primaryRole ? '#ef4444' : '#27272b',
              color: '#f5f5f7',
            }}
            {...register('primaryRole')}
          >
            <option value="">Select a role</option>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          {errors.primaryRole && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
              {errors.primaryRole.message}
            </p>
          )}
        </div>

        {/* Startup Name */}
        <div>
          <label
            htmlFor="startupName"
            className="block text-sm font-medium mb-2"
            style={{ color: '#f5f5f7' }}
          >
            Startup Name
          </label>
          <input
            id="startupName"
            type="text"
            placeholder="Optional"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: '#27272b',
              color: '#f5f5f7',
            }}
            {...register('startupName')}
          />
        </div>

        {/* Location */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium mb-2"
            style={{ color: '#f5f5f7' }}
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            placeholder="City, Country"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: '#27272b',
              color: '#f5f5f7',
            }}
            {...register('location')}
          />
        </div>

        {/* Website */}
        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium mb-2"
            style={{ color: '#f5f5f7' }}
          >
            Website
          </label>
          <input
            id="website"
            type="url"
            placeholder="https://example.com"
            className="w-full px-4 py-2 rounded-xl border text-sm transition-colors"
            style={{
              backgroundColor: '#0f0f11',
              borderColor: errors.website ? '#ef4444' : '#27272b',
              color: '#f5f5f7',
            }}
            {...register('website')}
          />
          {errors.website && (
            <p className="text-sm mt-1" style={{ color: '#ef4444' }}>
              {errors.website.message}
            </p>
          )}
        </div>
      </div>

      {/* Interests Section */}
      <div className="space-y-4 pt-4 border-t" style={{ borderColor: '#27272b' }}>
        <div>
          <label
            htmlFor="interests"
            className="block text-sm font-medium mb-2"
            style={{ color: '#f5f5f7' }}
          >
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
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addInterest(interestInput)
                }
              }}
              className="flex-1 px-4 py-2 rounded-xl border text-sm transition-colors"
              style={{
                backgroundColor: '#0f0f11',
                borderColor: '#27272b',
                color: '#f5f5f7',
              }}
              disabled={interests.length >= 5}
            />
            <button
              type="button"
              onClick={() => addInterest(interestInput)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: '#6366f1',
                color: '#fff',
              }}
              disabled={interests.length >= 5 || !interestInput.trim()}
            >
              Add
            </button>
          </div>
        </div>

        {/* Interest Tags */}
        {interests.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                style={{
                  backgroundColor: '#27272b',
                  color: '#f5f5f7',
                }}
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

      {/* Submit Section */}
      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: '#27272b' }}>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            backgroundColor: isValid && !isSubmitting ? '#6366f1' : '#4f46e5',
            color: '#fff',
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </button>
        <button
          type="button"
          className="px-6 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{
            backgroundColor: '#27272b',
            color: '#a1a1a6',
          }}
          onClick={() => {
            router.push('/feed')
          }}
        >
          Skip for now
        </button>
      </div>
    </form>
  )
}
