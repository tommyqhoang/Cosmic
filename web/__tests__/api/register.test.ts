/** @jest-environment node */
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { POST } from '../../app/api/auth/register/route'
import { prisma } from '../../lib/prisma'
import { registerLimiter } from '../../lib/rate-limit'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    account: { findUnique: jest.fn(), create: jest.fn() },
  },
}))
jest.mock('../../lib/rate-limit', () => ({
  registerLimiter: { check: jest.fn(() => true) },
  clientIp: jest.fn(() => '1.2.3.4'),
}))
jest.mock('../../lib/bcrypt', () => ({ hashPassword: jest.fn(async () => 'hashed') }))

const findUnique = prisma.account.findUnique as jest.Mock
const create = prisma.account.create as jest.Mock
const limiterCheck = registerLimiter.check as jest.Mock

function req(body: unknown) {
  return new NextRequest('http://localhost/api/auth/register', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

const valid = { name: 'tommy123', password: 'secret1', email: 'tommy@example.com', birthday: '2000-01-15' }

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    limiterCheck.mockReturnValue(true)
    findUnique.mockResolvedValue(null)
    create.mockResolvedValue({ id: 1 })
  })

  it('201 on a successful registration', async () => {
    const res = await POST(req(valid))
    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({ success: true })
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('409 when the username already exists (pre-check)', async () => {
    findUnique.mockResolvedValue({ id: 99, name: 'tommy123' })
    const res = await POST(req(valid))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'Username already taken' })
    expect(create).not.toHaveBeenCalled()
  })

  it('409 when create throws a P2002 unique-constraint error (TOCTOU race)', async () => {
    create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: '5.22.0' }),
    )
    const res = await POST(req(valid))
    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ error: 'Username already taken' })
  })

  it('500 when create throws a non-P2002 error', async () => {
    create.mockRejectedValue(new Error('connection lost'))
    const res = await POST(req(valid))
    expect(res.status).toBe(500)
  })

  it('400 when username is too short', async () => {
    const res = await POST(req({ ...valid, name: 'ab' }))
    expect(res.status).toBe(400)
  })

  it('400 when username is non-alphanumeric', async () => {
    const res = await POST(req({ ...valid, name: 'bad name!' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Username must be alphanumeric')
  })

  it('400 on an impossible birthday 2000-13-45', async () => {
    const res = await POST(req({ ...valid, birthday: '2000-13-45' }))
    expect(res.status).toBe(400)
  })

  it('400 when email is missing', async () => {
    const res = await POST(req({ ...valid, email: '' }))
    expect(res.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it('400 on empty / unparseable body', async () => {
    const res = await POST(req('not json'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid request body' })
  })

  it('429 when the rate limiter rejects', async () => {
    limiterCheck.mockReturnValue(false)
    const res = await POST(req(valid))
    expect(res.status).toBe(429)
  })
})
