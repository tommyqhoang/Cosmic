/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/unsubscribe/route'
import { prisma } from '../../lib/prisma'
import { subscribeLimiter } from '../../lib/rate-limit'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    cmsSubscriber: { updateMany: jest.fn() },
  },
}))
jest.mock('../../lib/rate-limit', () => ({
  subscribeLimiter: { check: jest.fn(() => true) },
  clientIp: jest.fn(() => '1.2.3.4'),
}))

const updateMany = prisma.cmsSubscriber.updateMany as jest.Mock
const limiterCheck = subscribeLimiter.check as jest.Mock

function req(body: unknown) {
  return new NextRequest('http://localhost/api/unsubscribe', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

describe('POST /api/unsubscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    limiterCheck.mockReturnValue(true)
    updateMany.mockResolvedValue({ count: 1 })
  })

  it('200 and deactivates the matching active subscriber', async () => {
    const res = await POST(req({ token: 'abc123' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    const arg = updateMany.mock.calls[0][0]
    expect(arg.where).toEqual({ token: 'abc123', active: true })
    expect(arg.data.active).toBe(false)
    expect(arg.data.unsubscribedAt).toBeInstanceOf(Date)
  })

  it('200 even for an unknown token (no enumeration)', async () => {
    updateMany.mockResolvedValue({ count: 0 })
    const res = await POST(req({ token: 'nope' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })

  it('400 when the token is missing', async () => {
    const res = await POST(req({}))
    expect(res.status).toBe(400)
    expect(updateMany).not.toHaveBeenCalled()
  })

  it('429 when the rate limiter rejects', async () => {
    limiterCheck.mockReturnValue(false)
    const res = await POST(req({ token: 'abc123' }))
    expect(res.status).toBe(429)
    expect(updateMany).not.toHaveBeenCalled()
  })
})
