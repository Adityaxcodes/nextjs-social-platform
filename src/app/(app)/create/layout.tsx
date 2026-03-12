import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Post - StartupHub',
  description: 'Share updates, launches, ideas, and milestones with the startup community',
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
