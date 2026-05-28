import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname

  if (path.startsWith('/account')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
  }

  if (path.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    if (token.webadmin !== 1) return new NextResponse(null, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}
