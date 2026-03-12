import Link from "next/link"

export default function Sidebar() {
  return (
    <div className="w-64 border-r p-4 space-y-4">

      <Link href="/feed">Home</Link>

      <Link href="/create">Create Post</Link>

      <Link href="/profile">Profile</Link>

    </div>
  )
}