import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { UserList } from '@/components/ui_follow/user-list'
import { mockFollowers } from '@/lib/mock-users'

export default function FollowersPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex max-w-2xl flex-col px-6 py-6">
        <div className="mb-8 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Followers</h1>
            <p className="text-sm text-muted-foreground">People connected with this profile</p>
          </div>
        </div>

        <UserList users={mockFollowers} emptyMessage="No followers yet" />
      </main>
    </div>
  )
}
