/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/subscribe/route'
import { prisma } from '../../lib/prisma'
import { subscribeLimiter } from '../../lib/rate-limit'
import { sendWelcomeEmail } from '../../lib/email'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    cmsSubscriber: { upsert: jest.fn() },
  },
}))
jest.mock('../../lib/rate-limit', () => ({
  subscribeLimiter: { check: jest.fn(() => true) },
  clientIp: jest.fn(() => '1.2.3.4'),
}))
jest.mock('../../lib/email', () => ({ sendWelcomeEmail: jest.fn(async () => undefined) }))
jest.mock('../../lib/settings', () => ({
  readSocialLinks: jest.fn(async () => ({ discord: 'https://discord.gg/test' })),
}))

const upsert = prisma.cmsSubscriber.upsert as jest.Mock
const limiterCheck = subscribeLimiter.check as jest.Mock
const welcome = sendWelcomeEmail as jest.Mock

function req(body: unknown) {
  return new NextRequest('http://localhost/api/subscribe', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

describe('POST /api/subscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    limiterCheck.mockReturnValue(true)
    upsert.mockResolvedValue({ id: 1, email: 'a@b.com', token: 'tok' })
  })

  it('201 and sends a welcome email on a valid subscription', async () => {
    const res = await POST(req({ email: 'Player@Example.com' }))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ success: true })
    // Email is lower-cased before storage.
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { email: 'player@example.com' } }))
    expect(welcome).toHaveBeenCalledWith('player@example.com', 'tok', 'https://discord.gg/test')
  })

  it('reactivates a returning subscriber via upsert update', async () => {
    await POST(req({ email: 'a@b.com' }))
    const arg = upsert.mock.calls[0][0]
    expect(arg.update).toEqual({ active: true, unsubscribedAt: null })
  })

  it('400 on an invalid email', async () => {
    const res = await POST(req({ email: 'not-an-email' }))
    expect(res.status).toBe(400)
    expect(upsert).not.toHaveBeenCalled()
    expect(welcome).not.toHaveBeenCalled()
  })

  it('429 when the rate limiter rejects', async () => {
    limiterCheck.mockReturnValue(false)
    const res = await POST(req({ email: 'a@b.com' }))
    expect(res.status).toBe(429)
    expect(upsert).not.toHaveBeenCalled()
  })

  it('500 when the upsert throws', async () => {
    upsert.mockRejectedValue(new Error('db down'))
    const res = await POST(req({ email: 'a@b.com' }))
    expect(res.status).toBe(500)
    expect(welcome).not.toHaveBeenCalled()
  })
})
