import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userIdToFollow } = await req.json()

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
  })

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  try {
    await prisma.follow.create({
    data: {
      followerId: currentUser!.id,
      followingId: userIdToFollow,
    },
    })
  } catch {
    return NextResponse.json({ error: "Already following" }, { status: 409 })
  }

  return NextResponse.json({ success: true })
}