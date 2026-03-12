'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, AlertCircle, Check, X } from 'lucide-react'

interface PasswordStrength {
  score: number
  label: string
  color: string
}

export default function SignupForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const validateUsername = (value: string) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,16}$/
    return usernameRegex.test(value)
  }

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/\d/.test(pwd)) score++
    if (/[!@#$%^&*]/.test(pwd)) score++

    const strengths: PasswordStrength[] = [
      { score: 0, label: 'Too weak', color: 'bg-red-500' },
      { score: 1, label: 'Weak', color: 'bg-orange-500' },
      { score: 2, label: 'Fair', color: 'bg-yellow-500' },
      { score: 3, label: 'Good', color: 'bg-blue-500' },
      { score: 4, label: 'Strong', color: 'bg-green-500' },
      { score: 5, label: 'Very strong', color: 'bg-green-500' },
    ]

    return strengths[Math.min(score, 5)]
  }

  const validatePasswords = () => password === confirmPassword && password.length >= 8

  const isFullNameValid = fullName.trim().length >= 2
  const isUsernameValid = validateUsername(username)
  const isEmailValid = email.length > 0 && validateEmail(email)
  const passwordStrength = calculatePasswordStrength(password)
  const isPasswordValid = password.length >= 8
  const arePasswordsMatching = password.length > 0 && validatePasswords()
  const isFormValid = isFullNameValid && isUsernameValid && isEmailValid && isPasswordValid && arePasswordsMatching

  const handleFieldBlur = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    if (validateUsername(value)) {
      setTimeout(() => {
        setUsernameAvailable(Math.random() > 0.3)
      }, 500)
    } else {
      setUsernameAvailable(null)
    }
  }

  const fullNameError =
    touchedFields.fullName && fullName.trim().length > 0 && !isFullNameValid
      ? 'Full name must be at least 2 characters'
      : ''

  const usernameError =
    touchedFields.username && username.length > 0 && !validateUsername(username)
      ? 'Username must be 3-16 characters (letters, numbers, _, -)'
      : usernameAvailable === false
        ? 'Username is already taken'
        : ''

  const emailError =
    touchedFields.email && email.length > 0 && !validateEmail(email)
      ? 'Please enter a valid email address'
      : ''

  const confirmPasswordError =
    touchedFields.confirmPassword && confirmPassword.length > 0 && !validatePasswords()
      ? password !== confirmPassword
        ? 'Passwords do not match'
        : 'Password must be at least 8 characters'
      : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setAuthError('')
    setIsLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fullName, username, email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setAuthError(data.error || 'Something went wrong. Please try again.')
      setIsLoading(false)
      return
    }

    // Auto-login after successful signup
    const result = await signIn('credentials', { email, password, redirect: false })

    setIsLoading(false)

    if (result?.error) {
      router.push('/login')
    } else {
      router.push('/complete-profile')
    }
  }

  const handleGoogleSignup = () => {
    console.log('Google signup clicked')
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
            <span className="text-xl font-bold text-white">SH</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Get Started</h1>
        <p className="text-white/60 text-sm">
          Create your StartupHub account in minutes
        </p>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {/* Auth Error */}
        {authError && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {authError}
          </div>
        )}
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-white/90 mb-2">
            Full Name
          </label>
          <div className="relative">
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => handleFieldBlur('fullName')}
              aria-invalid={!!fullNameError}
              className={`pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 transition-colors ${
                fullNameError ? 'border-red-400' : isFullNameValid && touchedFields.fullName ? 'border-green-400' : ''
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isFullNameValid && touchedFields.fullName && <Check className="w-5 h-5 text-green-400" />}
              {fullNameError && <AlertCircle className="w-5 h-5 text-red-400" />}
            </div>
          </div>
          {fullNameError && <p className="text-red-400 text-sm mt-1">{fullNameError}</p>}
        </div>

        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-white/90 mb-2">
            Username
          </label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              placeholder="johndoe_startup"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              onBlur={() => handleFieldBlur('username')}
              aria-invalid={!!usernameError}
              className={`pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 transition-colors ${
                usernameError ? 'border-red-400' : usernameAvailable === true ? 'border-green-400' : ''
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameAvailable === true && <Check className="w-5 h-5 text-green-400" />}
              {usernameError && <AlertCircle className="w-5 h-5 text-red-400" />}
            </div>
          </div>
          {usernameError && <p className="text-red-400 text-sm mt-1">{usernameError}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              aria-invalid={!!emailError}
              className={`pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 transition-colors ${
                emailError ? 'border-red-400' : isEmailValid && touchedFields.email ? 'border-green-400' : ''
              }`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isEmailValid && touchedFields.email && <Check className="w-5 h-5 text-green-400" />}
              {emailError && <AlertCircle className="w-5 h-5 text-red-400" />}
            </div>
          </div>
          {emailError && <p className="text-red-400 text-sm mt-1">{emailError}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleFieldBlur('password')}
              className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password Strength */}
          {password.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${passwordStrength.color}`}
                    style={{ width: `${Math.min((passwordStrength.score / 5) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-white/60 whitespace-nowrap">
                  {passwordStrength.label}
                </span>
              </div>
              <div className="text-xs text-white/50 space-y-1">
                <div className="flex items-center gap-2">
                  {password.length >= 8 ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-white/40" />}
                  <span>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[a-z]/.test(password) && /[A-Z]/.test(password) ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-white/40" />}
                  <span>Uppercase and lowercase letters</span>
                </div>
                <div className="flex items-center gap-2">
                  {/\d/.test(password) ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-white/40" />}
                  <span>At least one number</span>
                </div>
                <div className="flex items-center gap-2">
                  {/[!@#$%^&*]/.test(password) ? <Check className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-white/40" />}
                  <span>Special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleFieldBlur('confirmPassword')}
              aria-invalid={!!confirmPasswordError}
              className={`pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 transition-colors ${
                confirmPasswordError ? 'border-red-400' : arePasswordsMatching && touchedFields.confirmPassword ? 'border-green-400' : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {confirmPasswordError && <p className="text-red-400 text-sm mt-1">{confirmPasswordError}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={!isFormValid || isLoading} className="w-full h-10 font-medium mt-6">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Creating account...
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-transparent text-white/50">Or sign up with</span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignup}
        className="w-full h-10 font-medium bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
        </svg>
        Sign up with Google
      </Button>

      {/* Login Link */}
      <p className="text-center text-sm text-white/60 mt-8">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-white hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}
