import { NextRequest } from 'next/server'
import { randomBytes } from 'crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { subscribeLimiter, clientIp } from '@/lib/rate-limit'
import { sendWelcomeEmail } from '@/lib/email'
import { readSocialLinks } from '@/lib/settings'

const schema = z.object({
  email: z.string().email().max(254),
})

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers)
  if (!subscribeLimiter.check(ip)) {
    return Response.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const token = randomBytes(24).toString('hex')

  // Upsert keeps the row stable across re-subscribes: a previously unsubscribed
  // email is reactivated and gets a fresh token; the welcome mail re-delivers the
  // unsubscribe link. The response is identical whether the email was new or not
  // so the endpoint can't be used to enumerate who is subscribed.
  let welcomeToken = token
  try {
    const sub = await prisma.cmsSubscriber.upsert({
      where: { email },
      create: { email, token },
      update: { active: true, unsubscribedAt: null, token },
    })
    welcomeToken = sub.token
  } catch (err) {
    console.error('subscribe upsert failed', err)
    return Response.json({ error: 'Could not subscribe. Please try again later.' }, { status: 500 })
  }

  // Fire the welcome email but never let a mail failure fail the subscription.
  const social = await readSocialLinks()
  await sendWelcomeEmail(email, welcomeToken, social.discord)

  return Response.json({ success: true }, { status: 201 })
}
