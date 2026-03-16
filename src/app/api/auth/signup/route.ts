import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { name, username, email, password } = await request.json()

    if (!name || !username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const existingUsername = await prisma.user.findUnique({ where: { username } })
    if (existingUsername) {
      return NextResponse.json({ error: 'This username is already taken' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        interests: [],
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
