'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  targetUserId: string
  initialIsFollowing: boolean
  isOwnProfile: boolean
}

export function FollowButton({ targetUserId, initialIsFollowing, isOwnProfile }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (isOwnProfile) {
    return (
      <a
        href="/complete-profile"
        className="px-6 py-2 rounded-full text-sm font-medium transition-all"
        style={{ border: '1px solid #3a3a45', color: '#a0a0b0' }}
      >
        Edit Profile
      </a>
    )
  }

  const handleClick = async () => {
    setIsLoading(true)

    try {
      if (isFollowing) {
        const res = await fetch('/api/unfollow', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIdToUnfollow: targetUserId }),
        })
        if (res.ok) setIsFollowing(false)
        else if (res.status === 401) router.push('/login')
      } else {
        const res = await fetch('/api/follow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userIdToFollow: targetUserId }),
        })
        if (res.ok) setIsFollowing(true)
        else if (res.status === 401) router.push('/login')
      }
    } finally {
      setIsLoading(false)
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="px-6 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50"
      style={
        isFollowing
          ? { border: '1px solid #3a3a45', color: '#a0a0b0', backgroundColor: 'transparent' }
          : { backgroundColor: '#5a5aff', color: '#ffffff', border: '1px solid transparent' }
      }
    >
      {isLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  )
}
