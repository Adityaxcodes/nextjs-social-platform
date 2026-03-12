"use client"

import dynamic from "next/dynamic"

// Dynamically import Feed to make it client-only
const Feed = dynamic(() => import("@/components/feed"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 animate-pulse">
        <div className="h-4 bg-white/20 rounded mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-3/4"></div>
      </div>
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 animate-pulse">
        <div className="h-4 bg-white/20 rounded mb-4"></div>
        <div className="h-4 bg-white/20 rounded w-2/3"></div>
      </div>
    </div>
  )
})

export default function FeedWrapper() {
  return <Feed />
}
