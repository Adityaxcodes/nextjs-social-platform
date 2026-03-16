import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Button } from '@/components/ui_follow/button'
import { UserList } from '@/components/ui_follow/user-list'
import { prisma } from '@/lib/prisma'

export default async function FollowingPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      following: {
        include: {
          following: {
            select: { id: true, username: true, name: true, image: true },
          },
        },
      },
    },
  })

  if (!user) notFound()

  const session = await getServerSession(authOptions)
  const currentUserEmail = session?.user?.email

  let currentUserId: string | null = null
  let currentFollowingIds: string[] = []
  if (currentUserEmail) {
    const cu = await prisma.user.findUnique({
      where: { email: currentUserEmail },
      select: { id: true, following: { select: { followingId: true } } },
    })
    if (cu) {
      currentUserId = cu.id
      currentFollowingIds = cu.following.map((f:any) => f.followingId)
    }
  }

  const following = user.following.map((f) => ({
    id: f.following.id,
    username: f.following.username ?? '',
    name: f.following.name ?? f.following.username ?? '',
    image: f.following.image ?? '',
    isFollowing: currentFollowingIds.includes(f.following.id),
    isOwnProfile: currentUserId === f.following.id,
  }))

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f11' }}>
      <main className="mx-auto flex max-w-2xl flex-col px-6 py-6">
        <div className="mb-8 flex items-center gap-3">
          <Link href={`/profile/${username}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Following</h1>
            <p className="text-sm text-muted-foreground">People connected with this profile</p>
          </div>
        </div>

        <UserList users={following} emptyMessage="Not following anyone yet" />
      </main>
    </div>
  )
}
