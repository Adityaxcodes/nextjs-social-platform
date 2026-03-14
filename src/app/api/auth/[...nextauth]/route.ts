import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('[AUTH] authorize called with email:', credentials?.email)

          if (!credentials?.email || !credentials?.password) {
            console.log('[AUTH] Missing email or password')
            return null
          }

          console.log('[AUTH] Querying database for user...')
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })
          console.log('[AUTH] User found:', !!user, user ? `(id: ${user.id}, has password: ${!!user.password})` : '')

          if (!user || !user.password) {
            console.log('[AUTH] No user found or user has no password')
            return null
          }

          console.log('[AUTH] Comparing passwords...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('[AUTH] Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            console.log('[AUTH] Password mismatch')
            return null
          }

          console.log('[AUTH] Authentication successful for user:', user.id)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            username: user.username,
          }
        } catch (error) {
          console.error('[AUTH] Unexpected error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: import("next-auth/jwt").JWT; user?: import("next-auth").User }) {
      if (user) {
        token.id = user.id
        token.username = (user as { username?: string }).username ?? ""
      }
      return token
    },
    async session({ session, token }: { session: import("next-auth").Session; token: import("next-auth/jwt").JWT }) {
      if (session.user) {
        (session.user as { id?: string; username?: string }).id = token.id as string
        ;(session.user as { id?: string; username?: string }).username = token.username ?? ""
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
