"use client"

import { useEffect, useState } from "react"
import { PostCard } from "@/components/post-card"

interface Post {
  id: string
  caption: string
  mediaUrl: string
  mediaType: string
  createdAt: string
  author: {
    username: string
    name: string
  }
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts')
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Loading feed...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <p className="text-slate-600 text-lg">
            No posts yet. Be the first to share something!
          </p>
        </div>
      ) : (
        posts.map((post) => {
          // Generate deterministic engagement numbers based on post ID
          const seed = post.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
          const likes = Math.floor((seed * 7) % 500) + 50
          const comments = Math.floor((seed * 3) % 50) + 5
          const shares = Math.floor((seed * 2) % 20) + 1

          return (
            <PostCard
              key={post.id}
              postId={post.id}
              author={{
                name: post.author.name || post.author.username,
                handle: `@${post.author.username}`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.username}`,
              }}
              timestamp={getTimeAgo(post.createdAt)}
              content={post.caption}
              image={post.mediaType === 'image' ? post.mediaUrl : undefined}
              likes={likes}
              comments={comments}
              shares={shares}
            />
          )
        })
      )}
    </div>
  )
}