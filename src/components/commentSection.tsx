"use client"

import { useState, useEffect } from "react"

export default function CommentSection({ postId }) {

  const [comments, setComments] = useState([])
  const [content, setContent] = useState("")

  async function fetchComments() {
    const res = await fetch(`/api/comment?postId=${postId}`)
    const data = await res.json()
    setComments(data)
  }

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  async function handleSubmit(e) {
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

            <img
              src={comment.user.image}
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