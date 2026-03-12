import LoginForm from '@/components/login-form'
import { GradientBackground } from '@/components/gradient-background'

export const metadata = {
  title: 'Login - StartupHub',
  description: 'Sign in to your StartupHub account',
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      <GradientBackground />
      <div className="absolute inset-0 backdrop-blur-2xl bg-black/30" />
      <div className="relative z-10">
        <LoginForm />
      </div>
    </main>
  )
}
