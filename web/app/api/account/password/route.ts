import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/bcrypt'
import { passwordLimiter, clientIp } from '@/lib/rate-limit'
import { z } from 'zod'

const schema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').max(50),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Throttle to stop online brute-force of the current password.
  const ip = clientIp(req.headers)
  if (!passwordLimiter.check(`${ip}:${session.user.name}`)) {
    return Response.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 })

  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { currentPassword, newPassword } = parsed.data

  const account = await prisma.account.findUnique({
    where: { name: session.user.name! },
    select: { password: true, banned: true },
  })
  if (!account) return Response.json({ error: 'Account not found' }, { status: 404 })
  // Re-check ban server-side: the 7-day JWT outlives a mid-session ban.
  if (account.banned) return Response.json({ error: 'Account is banned' }, { status: 403 })

  const valid = await verifyPassword(currentPassword, account.password)
  if (!valid) return Response.json({ error: 'Current password is incorrect' }, { status: 400 })

  if (currentPassword === newPassword) {
    return Response.json({ error: 'New password must differ from current password' }, { status: 400 })
  }

  const hashed = await hashPassword(newPassword)
  try {
    await prisma.account.update({ where: { name: session.user.name! }, data: { password: hashed } })
  } catch {
    // e.g. the row was removed between the read above and this write (P2025).
    return Response.json({ error: 'Could not update password. Please try again.' }, { status: 500 })
  }

  return Response.json({ success: true })
}
