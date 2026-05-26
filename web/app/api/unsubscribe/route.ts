import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { subscribeLimiter, clientIp } from '@/lib/rate-limit'

const schema = z.object({
  token: z.string().min(1).max(64),
})

// One-click unsubscribe. Idempotent and always returns success (even for an
// unknown/already-removed token) so the page never reveals whether a token was
// valid. Email clients that honor RFC 8058 List-Unsubscribe-Post will POST here
// directly; the /unsubscribe page also POSTs here on button click.
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers)
  if (!subscribeLimiter.check(ip)) {
    return Response.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid unsubscribe link.' }, { status: 400 })
  }

  try {
    await prisma.cmsSubscriber.updateMany({
      where: { token: parsed.data.token, active: true },
      data: { active: false, unsubscribedAt: new Date() },
    })
  } catch (err) {
    console.error('unsubscribe failed', err)
    return Response.json({ error: 'Could not unsubscribe. Please try again later.' }, { status: 500 })
  }

  return Response.json({ success: true })
}
