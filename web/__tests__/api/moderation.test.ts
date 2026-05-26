/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { POST as banPOST } from '../../app/api/admin/users/[id]/ban/route'
import { POST as mutePOST } from '../../app/api/admin/users/[id]/mute/route'
import { prisma } from '../../lib/prisma'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../lib/prisma', () => ({
  prisma: { account: { findUnique: jest.fn(), update: jest.fn() } },
}))

const session = getServerSession as jest.Mock
const findUnique = prisma.account.findUnique as jest.Mock
const update = prisma.account.update as jest.Mock

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })
const admin = { user: { id: '1', webadmin: 1, name: 'admin' } }

function banReq(body: unknown) {
  return new NextRequest('http://localhost/api/admin/users/5/ban', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}
function muteReq() {
  return new NextRequest('http://localhost/api/admin/users/5/mute', { method: 'POST' })
}

describe('POST ban route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    session.mockResolvedValue(admin)
    findUnique.mockResolvedValue({ id: 5, webadmin: 0 })
    update.mockResolvedValue({ id: 5 })
  })

  it('401 with no session', async () => {
    session.mockResolvedValue(null)
    const res = await banPOST(banReq({ reason: 'spam' }), ctx('5')) as Response
    expect(res.status).toBe(401)
  })

  it('403 for a non-admin session', async () => {
    session.mockResolvedValue({ user: { id: '2', webadmin: 0, name: 'u' } })
    const res = await banPOST(banReq({ reason: 'spam' }), ctx('5')) as Response
    expect(res.status).toBe(403)
  })

  it('400 when the reason is missing', async () => {
    const res = await banPOST(banReq({}), ctx('5')) as Response
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Reason is required' })
  })

  it('404 when the target account does not exist', async () => {
    findUnique.mockResolvedValue(null)
    const res = await banPOST(banReq({ reason: 'spam' }), ctx('5')) as Response
    expect(res.status).toBe(404)
  })

  it('403 when the target is a web admin', async () => {
    findUnique.mockResolvedValue({ id: 5, webadmin: 1 })
    const res = await banPOST(banReq({ reason: 'spam' }), ctx('5')) as Response
    expect(res.status).toBe(403)
  })

  it('200 on success and bans the account', async () => {
    const res = await banPOST(banReq({ reason: 'spam' }), ctx('5')) as Response
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(update).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { banned: 1, banreason: 'spam' },
    })
  })
})

describe('POST mute route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    session.mockResolvedValue(admin)
    findUnique.mockResolvedValue({ id: 5, webadmin: 0 })
    update.mockResolvedValue({ id: 5 })
  })

  it('404 when the target is missing', async () => {
    findUnique.mockResolvedValue(null)
    const res = await mutePOST(muteReq(), ctx('5')) as Response
    expect(res.status).toBe(404)
  })

  it('403 when the target is a web admin', async () => {
    findUnique.mockResolvedValue({ id: 5, webadmin: 1 })
    const res = await mutePOST(muteReq(), ctx('5')) as Response
    expect(res.status).toBe(403)
  })

  it('200 on success and mutes the account', async () => {
    const res = await mutePOST(muteReq(), ctx('5')) as Response
    expect(res.status).toBe(200)
    expect(update).toHaveBeenCalledWith({ where: { id: 5 }, data: { mute: 1 } })
  })
})
