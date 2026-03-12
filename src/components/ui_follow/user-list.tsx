import Link from 'next/link'
import { FollowButton } from '@/components/follow-button'

interface User {
  id: string
  username: string
  name: string
  image?: string
  isFollowing?: boolean
  isOwnProfile?: boolean
}

interface UserListProps {
  users: User[]
  emptyMessage?: string
}

const getInitials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')

export function UserList({ users, emptyMessage = 'No users found' }: UserListProps) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-10">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-4 rounded-xl px-4 py-4"
          style={{ backgroundColor: '#1a1a1f', border: '1px solid #2a2a35' }}
        >
          <Link
            href={`/profile/${user.username.replace('@', '')}`}
            className="flex items-center gap-4 flex-1 min-w-0"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: '#2a2a3a' }}>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-11 w-11 rounded-full object-cover"
                />
              ) : (
                getInitials(user.name)
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm text-white truncate">@{user.username.replace('@', '')}</p>
              <p className="text-zinc-400 text-sm truncate">{user.name}</p>
            </div>
          </Link>
          <FollowButton
            targetUserId={user.id}
            initialIsFollowing={user.isFollowing ?? false}
            isOwnProfile={user.isOwnProfile ?? false}
          />
        </div>
      ))}
    </div>
  )
}
