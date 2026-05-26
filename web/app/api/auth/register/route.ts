import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/bcrypt'
import { registerLimiter, clientIp } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/captcha'

const schema = z.object({
  name: z.string().min(4).max(13).regex(/^[a-zA-Z0-9]+$/, 'Username must be alphanumeric'),
  password: z.string().min(6).max(50),
  email: z.string().email(),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    // The regex only checks shape; reject impossible dates ("2000-13-45") that
    // would become an Invalid Date and make prisma.create throw.
    .refine((s) => {
      const d = new Date(`${s}T00:00:00Z`)
      return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
    }, 'Invalid date'),
})

export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers)
  if (!registerLimiter.check(ip)) {
    return Response.json({ error: 'Too many requests. Please wait a minute.' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 })

  // Verify the CAPTCHA before doing any work. Skipped automatically when
  // TURNSTILE_SECRET_KEY is unset (see lib/captcha). Login is intentionally
  // exempt — it is guarded by the rate limiter instead.
  const captchaToken = typeof body.captchaToken === 'string' ? body.captchaToken : ''
  if (!(await verifyTurnstile(captchaToken, ip))) {
    return Response.json({ error: 'Captcha verification failed. Please try again.' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { name, password, email, birthday } = parsed.data

  // Friendly pre-check for the common case; the create below is still guarded
  // against the TOCTOU race where two concurrent requests both pass this check.
  const existing = await prisma.account.findUnique({ where: { name } })
  if (existing) {
    return Response.json({ error: 'Username already taken' }, { status: 409 })
  }

  const hashed = await hashPassword(password)
  try {
    await prisma.account.create({
      data: {
        name,
        password: hashed,
        email,
        birthday: new Date(`${birthday}T00:00:00Z`),
        tos: 1,
        language: 2,
      },
    })
  } catch (err) {
    // Unique constraint violation -> someone registered the same name first.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return Response.json({ error: 'Username already taken' }, { status: 409 })
    }
    return Response.json({ error: 'Could not create account. Please try again.' }, { status: 500 })
  }

  return Response.json({ success: true }, { status: 201 })
}
