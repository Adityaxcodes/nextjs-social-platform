import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserList } from '@/components/ui_follow/user-list'
import { prisma } from '@/lib/prisma'

type FollowerUserSummary = {
  id: string
  username: string | null
  name: string | null
  image: string | null
}

type FollowerEdge = {
  follower: FollowerUserSummary
}

export default async function FollowersPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      followers: {
        include: {
          follower: {
            select: { id: true, username: true, name: true, image: true },
          },
        },
      },
    },
  })

  if (!user) notFound()

  const followers = user.followers.map((f: FollowerEdge) => ({
    id: f.follower.id,
    username: f.follower.username ?? '',
    name: f.follower.name ?? f.follower.username ?? '',
    image: f.follower.image ?? '',
  }))

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-2xl flex-col px-6 py-6">
        <div className="mb-8 flex items-center gap-3">
          <Link href={`/profile/${username}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Followers</h1>
            <p className="text-sm text-muted-foreground">{followers.length} people follow @{username}</p>
          </div>
        </div>

        <UserList users={followers} emptyMessage="No followers yet" />
      </main>
    </div>
  )
}
