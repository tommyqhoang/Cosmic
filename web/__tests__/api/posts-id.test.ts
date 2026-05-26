/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { PATCH, DELETE } from '../../app/api/posts/[id]/route'
import { prisma } from '../../lib/prisma'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../lib/auth', () => ({ authOptions: {} }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn() }))
jest.mock('../../lib/prisma', () => ({
  prisma: { cmsPost: { update: jest.fn(), delete: jest.fn() } },
}))

const session = getServerSession as jest.Mock
const update = prisma.cmsPost.update as jest.Mock
const del = prisma.cmsPost.delete as jest.Mock
const revalidate = revalidatePath as jest.Mock

const ctx = (id: string) => ({ params: Promise.resolve({ id }) })

function patchReq(body: unknown) {
  return new NextRequest('http://localhost/api/posts/5', {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}
function deleteReq() {
  return new NextRequest('http://localhost/api/posts/5', { method: 'DELETE' })
}

const admin = { user: { id: '1', webadmin: 1, name: 'admin' } }

describe('PATCH /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    session.mockResolvedValue(admin)
  })

  it('401 with no session', async () => {
    session.mockResolvedValue(null)
    const res = await PATCH(patchReq({ title: 'X' }), ctx('5')) as Response
    expect(res.status).toBe(401)
  })

  it('403 when not an admin', async () => {
    session.mockResolvedValue({ user: { id: '2', webadmin: 0, name: 'u' } })
    const res = await PATCH(patchReq({ title: 'X' }), ctx('5')) as Response
    expect(res.status).toBe(403)
  })

  it('400 on a non-numeric id', async () => {
    const res = await PATCH(patchReq({ title: 'X' }), ctx('abc')) as Response
    expect(res.status).toBe(400)
  })

  it('400 on an invalid body field', async () => {
    const res = await PATCH(patchReq({ category: 'bogus' }), ctx('5')) as Response
    expect(res.status).toBe(400)
  })

  it('404 when the record is missing (update throws)', async () => {
    update.mockRejectedValue(new Error('P2025'))
    const res = await PATCH(patchReq({ title: 'X' }), ctx('5')) as Response
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Post not found' })
  })

  it('200 on success and revalidates', async () => {
    update.mockResolvedValue({ id: 5, title: 'X' })
    const res = await PATCH(patchReq({ title: 'X' }), ctx('5')) as Response
    expect(res.status).toBe(200)
    expect(update).toHaveBeenCalledWith({ where: { id: 5 }, data: { title: 'X' } })
    expect(revalidate).toHaveBeenCalledWith('/')
    expect(revalidate).toHaveBeenCalledWith('/news')
    expect(revalidate).toHaveBeenCalledWith('/news/5')
  })
})

describe('DELETE /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    session.mockResolvedValue(admin)
  })

  it('401 with no session', async () => {
    session.mockResolvedValue(null)
    const res = await DELETE(deleteReq(), ctx('5')) as Response
    expect(res.status).toBe(401)
  })

  it('403 when not an admin', async () => {
    session.mockResolvedValue({ user: { id: '2', webadmin: 0, name: 'u' } })
    const res = await DELETE(deleteReq(), ctx('5')) as Response
    expect(res.status).toBe(403)
  })

  it('404 when the record is missing (delete throws)', async () => {
    del.mockRejectedValue(new Error('P2025'))
    const res = await DELETE(deleteReq(), ctx('5')) as Response
    expect(res.status).toBe(404)
  })

  it('204 on success and revalidates', async () => {
    del.mockResolvedValue({ id: 5 })
    const res = await DELETE(deleteReq(), ctx('5')) as Response
    expect(res.status).toBe(204)
    expect(del).toHaveBeenCalledWith({ where: { id: 5 } })
    expect(revalidate).toHaveBeenCalledWith('/news/5')
  })
})
