/** @jest-environment node */
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { GET, POST } from '../../app/api/posts/route'
import { prisma } from '../../lib/prisma'
import { sendAnnouncementEmails, sendDiscordAnnouncement } from '../../lib/email'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../lib/auth', () => ({ authOptions: {} }))
jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), unstable_cache: jest.fn((fn) => fn) }))
jest.mock('../../lib/prisma', () => ({
  prisma: {
    cmsPost: { findMany: jest.fn(), create: jest.fn() },
    cmsSubscriber: { findMany: jest.fn() },
  },
}))
jest.mock('../../lib/email', () => ({
  sendAnnouncementEmails: jest.fn(async () => 0),
  sendDiscordAnnouncement: jest.fn(async () => undefined),
}))
jest.mock('../../lib/settings', () => ({
  readSocialLinks: jest.fn(async () => ({ discord: 'https://discord.gg/test' })),
}))

const session = getServerSession as jest.Mock
const findMany = prisma.cmsPost.findMany as jest.Mock
const create = prisma.cmsPost.create as jest.Mock
const subscribers = prisma.cmsSubscriber.findMany as jest.Mock
const revalidate = revalidatePath as jest.Mock
const emails = sendAnnouncementEmails as jest.Mock
const discord = sendDiscordAnnouncement as jest.Mock

function req(body: unknown) {
  return new NextRequest('http://localhost/api/posts', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

const validPost = { title: 'Hi', content: 'Body', category: 'update' as const }

describe('GET /api/posts', () => {
  beforeEach(() => jest.clearAllMocks())

  it('200 returns the post list', async () => {
    const posts = [{ id: 1, title: 'A' }]
    findMany.mockResolvedValue(posts)
    const res = await GET()
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(posts)
  })
})

describe('POST /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    session.mockResolvedValue({ user: { id: '1', webadmin: 1, name: 'admin' } })
    create.mockResolvedValue({ id: 7, ...validPost })
    subscribers.mockResolvedValue([{ email: 'a@b.com', token: 'tok' }])
  })

  it('401 with no session', async () => {
    session.mockResolvedValue(null)
    const res = await POST(req(validPost))
    expect(res.status).toBe(401)
  })

  it('403 when the session user is not a web admin', async () => {
    session.mockResolvedValue({ user: { id: '2', webadmin: 0, name: 'user' } })
    const res = await POST(req(validPost))
    expect(res.status).toBe(403)
  })

  it('400 on an invalid body (missing title)', async () => {
    const res = await POST(req({ content: 'Body', category: 'update' }))
    expect(res.status).toBe(400)
    expect(create).not.toHaveBeenCalled()
  })

  it('400 on an invalid category', async () => {
    const res = await POST(req({ ...validPost, category: 'nope' }))
    expect(res.status).toBe(400)
  })

  it('201 on success; creates the post and revalidates / and /news', async () => {
    const res = await POST(req(validPost))
    expect(res.status).toBe(201)
    expect(create).toHaveBeenCalledTimes(1)
    expect(create.mock.calls[0][0].data).toMatchObject({ ...validPost, authorId: 1 })
    // `notify` is a dispatch flag, not a column — it must not reach the DB.
    expect(create.mock.calls[0][0].data).not.toHaveProperty('notify')
    expect(revalidate).toHaveBeenCalledWith('/')
    expect(revalidate).toHaveBeenCalledWith('/news')
  })

  it('broadcasts to email + Discord by default', async () => {
    await POST(req(validPost))
    expect(emails).toHaveBeenCalledWith(expect.objectContaining({ title: 'Hi' }), [{ email: 'a@b.com', token: 'tok' }], 'https://discord.gg/test')
    expect(discord).toHaveBeenCalledWith(expect.objectContaining({ title: 'Hi' }))
  })

  it('skips all broadcasts when notify is false', async () => {
    await POST(req({ ...validPost, notify: false }))
    expect(subscribers).not.toHaveBeenCalled()
    expect(emails).not.toHaveBeenCalled()
    expect(discord).not.toHaveBeenCalled()
  })
})
