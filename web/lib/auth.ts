import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/bcrypt'
import { loginLimiter, loginIpLimiter, clientIp } from '@/lib/rate-limit'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        name: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.name || !credentials?.password) return null

        // Rate-limit by IP (caps username rotation from one host) and by
        // ip+username (stops single-host brute-force without letting an
        // attacker lock a victim out from their own IP).
        const ip = clientIp(req?.headers as Record<string, string | string[] | undefined> | undefined)
        const username = credentials.name.toLowerCase()
        if (!loginIpLimiter.check(ip)) return null
        if (!loginLimiter.check(`${ip}:${username}`)) return null

        const account = await prisma.account.findUnique({ where: { name: credentials.name } })
        if (!account) return null
        if (account.banned) return null
        const valid = await verifyPassword(credentials.password, account.password)
        if (!valid) return null
        return {
          id: String(account.id),
          name: account.name,
          email: account.email ?? undefined,
          webadmin: account.webadmin,
          banned: account.banned,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.webadmin = (user as { webadmin: number }).webadmin
        token.banned = (user as { banned: number }).banned
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.webadmin = token.webadmin
      session.user.banned = token.banned
      return session
    },
  },
  pages: { signIn: '/login' },
  session: { strategy: 'jwt', maxAge: 7 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}
