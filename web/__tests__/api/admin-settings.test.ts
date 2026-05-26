/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidateTag } from 'next/cache'
import { GET, PUT } from '../../app/api/admin/settings/route'
import { prisma } from '../../lib/prisma'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
// lib/settings calls unstable_cache at import time; make it a passthrough.
jest.mock('next/cache', () => ({ unstable_cache: (fn: unknown) => fn, revalidateTag: jest.fn() }))
jest.mock('../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../lib/prisma', () => ({
  prisma: {
    cmsSetting: { findMany: jest.fn(), upsert: jest.fn() },
    $transaction: jest.fn(),
  },
}))

const session = getServerSession as jest.Mock
const findMany = prisma.cmsSetting.findMany as jest.Mock
const upsert = prisma.cmsSetting.upsert as jest.Mock
const transaction = prisma.$transaction as jest.Mock
const revalidate = revalidateTag as jest.Mock

function req(body: unknown) {
  return new NextRequest('http://localhost/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

describe('/api/admin/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    session.mockResolvedValue({ user: { id: '1', webadmin: 1, name: 'admin' } })
    findMany.mockResolvedValue([{ key: 'social_youtube', value: 'https://youtube.com/@x' }])
    upsert.mockResolvedValue({})
    transaction.mockResolvedValue([])
  })

  it('GET 401 without a session', async () => {
    session.mockResolvedValue(null)
    expect((await GET()).status).toBe(401)
  })

  it('GET 403 for a non-admin', async () => {
    session.mockResolvedValue({ user: { id: '2', webadmin: 0, name: 'u' } })
    expect((await GET()).status).toBe(403)
  })

  it('GET returns the social links mapped by platform id', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ youtube: 'https://youtube.com/@x', instagram: '', facebook: '' })
  })

  it('PUT 403 for a non-admin', async () => {
    session.mockResolvedValue({ user: { id: '2', webadmin: 0, name: 'u' } })
    const res = await PUT(req({ youtube: 'https://youtube.com/@x' }))
    expect(res.status).toBe(403)
    expect(transaction).not.toHaveBeenCalled()
  })

  it('PUT 400 on a non-URL value', async () => {
    const res = await PUT(req({ facebook: 'not-a-url' }))
    expect(res.status).toBe(400)
    expect(transaction).not.toHaveBeenCalled()
  })

  it('PUT saves only the provided keys, allows blanks, and revalidates', async () => {
    const res = await PUT(req({ youtube: 'https://youtube.com/@x', instagram: '' }))
    expect(res.status).toBe(200)
    // youtube + instagram provided (facebook omitted) → 2 upserts.
    expect(upsert).toHaveBeenCalledTimes(2)
    expect(transaction).toHaveBeenCalledTimes(1)
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { key: 'social_youtube' } }))
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { key: 'social_instagram' } }))
    expect(revalidate).toHaveBeenCalledWith('social-links', 'max')
  })

  it('PUT 500 when the transaction throws', async () => {
    transaction.mockRejectedValue(new Error('db down'))
    const res = await PUT(req({ youtube: 'https://youtube.com/@x' }))
    expect(res.status).toBe(500)
    expect(revalidate).not.toHaveBeenCalled()
  })
})
