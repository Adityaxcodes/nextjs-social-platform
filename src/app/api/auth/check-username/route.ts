import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../[...nextauth]/route'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')?.toLowerCase()

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false })
  }

  const session = await getServerSession(authOptions)

  // If the username belongs to the currently logged-in user, it's "available" (they already own it)
  if (session?.user?.username === username) {
    return NextResponse.json({ available: true })
  }

  const existing = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  })

  return NextResponse.json({ available: !existing })
}
