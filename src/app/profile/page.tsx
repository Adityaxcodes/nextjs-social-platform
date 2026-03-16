import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

type SessionUser = {
  id?: string
  username?: string
}

export default async function ProfileIndexPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/login')
  }

  const sessionUser = session.user as SessionUser
  let username = sessionUser.username?.trim()

  if (!username && sessionUser.id) {
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { username: true },
    })
    username = user?.username?.trim()
  }

  if (!username) {
    redirect('/complete-profile')
  }

  redirect(`/profile/${encodeURIComponent(username)}`)
}
