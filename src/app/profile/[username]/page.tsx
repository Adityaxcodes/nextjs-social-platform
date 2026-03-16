import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { notFound } from 'next/navigation'
import { FollowButton } from '@/components/follow-button'
import { MapPin, Globe, Briefcase, Building2, Calendar, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  return { title: `@${username}` }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      posts: { orderBy: { createdAt: 'desc' } },
      followers: true,
      following: true,
    },
  })

  if (!user) notFound()

  const session = await getServerSession(authOptions)
  const currentUserEmail = session?.user?.email

  const isOwnProfile = currentUserEmail === user.email

  // Check if the logged-in user already follows this profile
  let isFollowing = false
  if (currentUserEmail && !isOwnProfile) {
    const currentUser = await prisma.user.findUnique({
      where: { email: currentUserEmail },
      select: { id: true },
    })
    if (currentUser) {
      const follow = await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: currentUser.id, followingId: user.id } },
      })
      isFollowing = !!follow
    }
  }

  const avatarUrl = user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f11' }}>
      {/* Nav spacer */}
      <div className="h-16" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* Back to Feed Button */}
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:gap-3"
          style={{ backgroundColor: '#1a1a1f', color: '#9090ff', border: '1px solid #2a2a35' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Feed
        </Link>

        {/* Profile Card */}
        <div className="rounded-2xl p-8 space-y-6" style={{ backgroundColor: '#1a1a1f', border: '1px solid #2a2a35' }}>

          {/* Top row: avatar + actions */}
          <div className="flex items-start justify-between gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 shrink-0">
              <Image
                src={avatarUrl}
                alt={user.name || user.username}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <FollowButton
              targetUserId={user.id}
              initialIsFollowing={isFollowing}
              isOwnProfile={isOwnProfile}
            />
          </div>

          {/* Name + username */}
          <div>
            <h1 className="text-xl font-semibold text-white leading-tight">
              {user.name || user.username}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#6060a0' }}>@{user.username}</p>
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="text-sm leading-relaxed" style={{ color: '#b0b0c0' }}>
              {user.bio}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ color: '#80809a' }}>
            {user.role && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {user.role}
              </span>
            )}
            {user.startup && (
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {user.startup}
              </span>
            )}
            {user.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {user.location}
              </span>
            )}
            {user.website && (
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                style={{ color: '#7070e0' }}
              >
                <Globe className="w-3.5 h-3.5" />
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {joinedDate}
            </span>
          </div>

          {/* Interests */}
          {user.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: '#2a2a4a', color: '#9090ff', border: '1px solid #3a3a6a' }}
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-6 pt-2 border-t" style={{ borderColor: '#2a2a35' }}>
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{user.posts.length}</p>
              <p className="text-xs" style={{ color: '#60607a' }}>Posts</p>
            </div>
            <Link href={`/profile/${user.username}/followers`} className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-semibold text-white">{user.followers.length}</p>
              <p className="text-xs" style={{ color: '#60607a' }}>Followers</p>
            </Link>
            <Link href={`/profile/${user.username}/following`} className="text-center hover:opacity-80 transition-opacity">
              <p className="text-lg font-semibold text-white">{user.following.length}</p>
              <p className="text-xs" style={{ color: '#60607a' }}>Following</p>
            </Link>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#60607a' }}>
            Posts
          </h2>

          {user.posts.length === 0 ? (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ backgroundColor: '#1a1a1f', border: '1px solid #2a2a35' }}
            >
              <p className="text-sm" style={{ color: '#60607a' }}>No posts yet.</p>
            </div>
          ) : (
            user.posts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl p-6 space-y-3"
                style={{ backgroundColor: '#1a1a1f', border: '1px solid #2a2a35' }}
              >
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={avatarUrl}
                      alt={user.name || user.username}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name || user.username}</p>
                    <p className="text-xs" style={{ color: '#60607a' }}>
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Caption */}
                <p className="text-sm leading-relaxed" style={{ color: '#b0b0c0' }}>
                  {post.caption}
                </p>

                {/* Media */}
                {post.mediaUrl && post.mediaType === 'image' && (
                  <div className="relative w-full rounded-xl overflow-hidden" style={{ maxHeight: '400px' }}>
                    <Image
                      src={post.mediaUrl}
                      alt="Post media"
                      width={800}
                      height={400}
                      className="w-full object-cover rounded-xl"
                      unoptimized
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
