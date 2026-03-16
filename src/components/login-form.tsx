'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeOff, AlertCircle, Check } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const validatePassword = (value: string) => {
    return value.length >= 8
  }

  const isEmailValid = email.length > 0 && validateEmail(email)
  const isPasswordValid = password.length > 0 && validatePassword(password)
  const isEmailTouched = touchedFields.email
  const isPasswordTouched = touchedFields.password

  const emailError =
    isEmailTouched && email.length > 0 && !validateEmail(email)
      ? 'Please enter a valid email address'
      : ''

  const passwordError =
    isPasswordTouched && password.length > 0 && !validatePassword(password)
      ? 'Password must be at least 8 characters'
      : ''

  const isFormValid = isEmailValid && isPasswordValid

  const handleEmailBlur = () => {
    setTouchedFields((prev) => ({ ...prev, email: true }))
  }

  const handlePasswordBlur = () => {
    setTouchedFields((prev) => ({ ...prev, password: true }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setAuthError('')
    setIsLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setIsLoading(false)

    if (result?.error) {
      setAuthError('Invalid email or password. Please try again.')
    } else {
      router.push('/feed')
    }
  }

  const handleGoogleLogin = () => {
    console.log('Google login clicked')
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
            <Image
              src="/assets/connective%20logo.png"
              alt="Connective logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-white/60 text-sm">
          Sign in to your StartupHub account
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5 mb-6">
        {/* Auth Error */}
        {authError && (
          <div className="flex items-center gap-2 rounded-md bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {authError}
          </div>
        )}
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/90 mb-2"
          >
            Email Address
          </label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? 'email-error' : undefined}
              className={`pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 transition-colors ${
                emailError
                  ? 'border-red-400'
                  : isEmailValid
                    ? 'border-green-400'
                    : ''
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isEmailValid && (
                <Check className="w-5 h-5 text-green-400" aria-hidden="true" />
              )}
              {emailError && (
                <AlertCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
              )}
            </div>
          </div>
          {emailError && (
            <p id="email-error" className="text-red-400 text-sm mt-1">
              {emailError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/90"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? 'password-error' : undefined}
              className={`pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/40 transition-colors ${
                passwordError
                  ? 'border-red-400'
                  : isPasswordValid
                    ? 'border-green-400'
                    : ''
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={0}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {passwordError && (
            <p id="password-error" className="text-red-400 text-sm mt-1">
              {passwordError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full h-10 font-medium"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Signing in...
            </div>
          ) : (
            'Login'
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-transparent text-white/50">
            Or continue with
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full h-10 font-medium bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <svg
          className="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="currentColor"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="currentColor"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="currentColor"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="currentColor"
          />
        </svg>
        Sign in with Google
      </Button>

      {/* Signup Link */}
      <p className="text-center text-sm text-white/60 mt-8">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-white hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
