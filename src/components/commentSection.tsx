"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"

interface Comment {
  id: string;
  content: string;
  user: {
    image: string | null;
    username: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {

  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comment?postId=${postId}`)
    const data = await res.json()
    setComments(data)
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    await fetch("/api/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        postId,
        content
      })
    })

    setContent("")
    fetchComments()
  }

  return (
    <div className="mt-4">

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 border rounded-md px-3 py-2"
        />

        <button className="bg-primary px-4 py-2 rounded-md text-white">
          Post
        </button>
      </form>

      <div className="space-y-3">

        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">

            <Image
              src={comment.user.image || ""}
              alt={comment.user.username || "user profile image"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />

            <div>
              <p className="text-sm font-semibold">
                {comment.user.username}
              </p>

              <p className="text-sm">
                {comment.content}
              </p>
            </div>

          </div>
        ))}

      </div>

    </div>
  )
}