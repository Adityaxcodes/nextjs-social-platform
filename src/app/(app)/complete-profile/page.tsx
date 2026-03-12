import { Metadata } from 'next'
import { CompleteProfileForm } from '@/components/profile-forms/complete-profile-form'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Complete Your Profile',
  description: 'Complete your profile to get started',
}

export default function CompleteProfilePage() {
  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#0f0f11' }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <div
          className="rounded-2xl p-8 sm:p-12"
          style={{ backgroundColor: '#1a1a1f' }}
        >
          <CompleteProfileForm />
        </div>
      </div>
      <Toaster />
    </div>
  )
}
