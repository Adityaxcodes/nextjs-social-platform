import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token }) {
        // A valid token means the user is authenticated
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  },
)

// Protect these routes — anyone without a session is redirected to /login
export const config = {
  matcher: ['/create', '/create/:path*', '/feed', '/feed/:path*', '/complete-profile'],
}
