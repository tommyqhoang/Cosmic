import { NextRequest } from 'next/server'
import { contactLimiter, clientIp } from '@/lib/rate-limit'
import { verifyTurnstile } from '@/lib/captcha'
import { contactSchema, sendContactMessage } from '@/lib/contact'

// POST /api/contact
// Pipeline: rate limit → parse body → honeypot → validate → captcha → deliver.
// Captcha is verified after validation so we don't spend a Turnstile call on
// obviously-malformed payloads.
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers)
  if (!contactLimiter.check(ip)) {
    return Response.json(
      { error: 'Too many messages. Please wait a minute and try again.' },
      { status: 429 },
    )
  }

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Honeypot: humans never see (or fill) the hidden field. If it's set, a bot
  // submitted — return a fake success so it can't tell it was caught, and send
  // nothing onward.
  if (typeof body._hp === 'string' && body._hp.trim() !== '') {
    return Response.json({ success: true }, { status: 200 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Please check the form and try again.'
    return Response.json({ error: message }, { status: 400 })
  }

  const token = typeof body.captchaToken === 'string' ? body.captchaToken : ''
  if (!(await verifyTurnstile(token, ip))) {
    return Response.json({ error: 'Captcha verification failed. Please try again.' }, { status: 403 })
  }

  try {
    await sendContactMessage(parsed.data)
  } catch (err) {
    console.error('contact send failed', err)
    return Response.json(
      { error: 'Could not send your message. Please try again, or reach us on Discord.' },
      { status: 500 },
    )
  }

  return Response.json({ success: true }, { status: 200 })
}
