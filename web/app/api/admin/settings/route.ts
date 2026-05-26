import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SOCIAL_PLATFORMS } from '@/lib/social'
import { readSocialLinks, SOCIAL_LINKS_TAG } from '@/lib/settings'

// Each social link is optional and may be cleared (empty string). When present
// it must be an http(s) URL — anything else is rejected so a bad value can't be
// injected into a footer link.
const urlOrBlank = z
  .string()
  .max(500)
  .trim()
  .refine((v) => v === '' || /^https?:\/\/.+/i.test(v), 'Must be a valid http(s) URL')

const schema = z.object(
  Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, urlOrBlank.optional()])),
)

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.webadmin !== 1) return Response.json({ error: 'Forbidden' }, { status: 403 })

  return Response.json(await readSocialLinks())
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.webadmin !== 1) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 })

  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })

  // Upsert each provided platform. Only keys present in the payload are touched,
  // so a partial save leaves the others untouched.
  try {
    await prisma.$transaction(
      SOCIAL_PLATFORMS.filter((p) => parsed.data[p.id] !== undefined).map((p) => {
        const value = parsed.data[p.id] as string
        return prisma.cmsSetting.upsert({
          where: { key: p.key },
          create: { key: p.key, value },
          update: { value },
        })
      }),
    )
  } catch (err) {
    console.error('settings save failed', err)
    return Response.json({ error: 'Could not save settings. Please try again.' }, { status: 500 })
  }

  // Invalidate the cached footer read so the new links show site-wide
  // (stale-while-revalidate on the next visit to each page).
  revalidateTag(SOCIAL_LINKS_TAG, 'max')

  return Response.json(await readSocialLinks())
}
