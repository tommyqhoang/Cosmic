import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendAnnouncementEmails, sendDiscordAnnouncement } from '@/lib/email'
import { readSocialLinks } from '@/lib/settings'
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  category: z.enum(['changelog', 'maintenance', 'alert', 'event', 'update']),
  pinned: z.boolean().optional().default(false),
  // When true, email active newsletter subscribers about this announcement.
  // Only applies on create (this POST) — editing a post never re-sends.
  notify: z.boolean().optional().default(true),
})

export async function GET() {
  const posts = await prisma.cmsPost.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { author: { select: { name: true } } },
    take: 20,
  })
  return Response.json(posts)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.webadmin !== 1) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 })

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { notify, ...postData } = parsed.data
  const post = await prisma.cmsPost.create({
    data: { ...postData, authorId: Number(session.user.id) },
    include: { author: { select: { name: true } } },
  })

  // Broadcast the announcement to subscribers (email) and Discord. Awaited so
  // they run before the serverless function is frozen, but each is wrapped so a
  // delivery failure never fails the publish. Both no-op when their respective
  // env vars (RESEND_API_KEY / DISCORD_WEBHOOK_URL) are unset (see lib/email).
  if (notify) {
    try {
      const subscribers = await prisma.cmsSubscriber.findMany({
        where: { active: true },
        select: { email: true, token: true },
      })
      const social = await readSocialLinks()
      await Promise.allSettled([
        sendAnnouncementEmails(post, subscribers, social.discord),
        sendDiscordAnnouncement(post),
      ])
    } catch (err) {
      console.error('announcement dispatch failed', err)
    }
  }

  // Pages that list posts are ISR-cached (revalidate = 60); refresh them now
  // so the new post shows immediately instead of after the cache window.
  revalidatePath('/')
  revalidatePath('/news')

  return Response.json(post, { status: 201 })
}
