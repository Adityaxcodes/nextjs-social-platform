import SignupForm from '@/components/signup-form'
import { GradientBackground } from '@/components/gradient-background'

export const metadata = {
  title: 'Sign Up - StartupHub',
  description: 'Create your StartupHub account',
}

export default function SignupPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-8 overflow-hidden">
      <GradientBackground />
      <div className="absolute inset-0 backdrop-blur-2xl bg-black/30" />
      <div className="relative z-10">
        <SignupForm />
      </div>
    </main>
  )
}
