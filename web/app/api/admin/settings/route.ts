import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidateTag } from 'next/cache'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SOCIAL_PLATFORMS } from '@/lib/social'
import {
  readSocialLinksStrict,
  readGeneralSettingsStrict,
  readServerRatesStrict,
  readSocialLinks,
  readGeneralSettings,
  readServerRates,
  SOCIAL_LINKS_TAG,
  GENERAL_SETTINGS_TAG,
  SERVER_RATES_TAG,
  CONTACT_NPC_NAME_KEY,
  EXP_RATE_KEY,
  MESO_RATE_KEY,
  DROP_RATE_KEY,
} from '@/lib/settings'

// Prisma raises P2021 when the underlying table is missing. The cms_settings
// table is provisioned by web/prisma/sql/create_cms_settings.sql (run on deploy
// by scripts/ensure-cms-tables.mjs); if a database hasn't had it applied yet,
// reads look "empty" and writes fail — so we surface an actionable message
// rather than the generic 500 admins can't act on.
function missingTableResponse(err: unknown): Response | null {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
    return Response.json(
      {
        error:
          'Settings storage is not initialized in this database (the cms_settings table is missing). Redeploy the web service to auto-create it, or run web/prisma/sql/create_cms_settings.sql against the DB.',
      },
      { status: 503 },
    )
  }
  return null
}

const urlOrBlank = z
  .string()
  .max(500)
  .trim()
  .refine((v) => v === '' || /^https?:\/\/.+/i.test(v), 'Must be a valid http(s) URL')

const rateField = z.coerce.number().int().min(1).max(1000).optional()

const schema = z.object({
  ...Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, urlOrBlank.optional()])),
  contactNpcName: z.string().max(32).trim().optional(),
  expRate: rateField,
  mesoRate: rateField,
  dropRate: rateField,
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.webadmin !== 1) return Response.json({ error: 'Forbidden' }, { status: 403 })

  try {
    const [social, general, rates] = await Promise.all([
      readSocialLinksStrict(),
      readGeneralSettingsStrict(),
      readServerRatesStrict(),
    ])
    return Response.json({ ...social, contactNpcName: general.contactNpcName, ...rates })
  } catch (err) {
    console.error('settings load failed', err)
    return missingTableResponse(err) ?? Response.json({ error: 'Could not load settings.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.webadmin !== 1) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 })

  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const data = parsed.data as Record<string, string | number | undefined>
  try {
    const ops = [
      ...SOCIAL_PLATFORMS.filter((p) => data[p.id] !== undefined).map((p) => {
        const value = data[p.id] as string
        return prisma.cmsSetting.upsert({
          where: { key: p.key },
          create: { key: p.key, value },
          update: { value },
        })
      }),
    ]
    if (data.contactNpcName !== undefined) {
      ops.push(
        prisma.cmsSetting.upsert({
          where: { key: CONTACT_NPC_NAME_KEY },
          create: { key: CONTACT_NPC_NAME_KEY, value: data.contactNpcName as string },
          update: { value: data.contactNpcName as string },
        }),
      )
    }
    const rateEntries: [string, string][] = []
    if (data.expRate !== undefined) rateEntries.push([EXP_RATE_KEY, String(data.expRate)])
    if (data.mesoRate !== undefined) rateEntries.push([MESO_RATE_KEY, String(data.mesoRate)])
    if (data.dropRate !== undefined) rateEntries.push([DROP_RATE_KEY, String(data.dropRate)])
    for (const [key, value] of rateEntries) {
      ops.push(prisma.cmsSetting.upsert({ where: { key }, create: { key, value }, update: { value } }))
    }
    await prisma.$transaction(ops)
  } catch (err) {
    console.error('settings save failed', err)
    return missingTableResponse(err) ?? Response.json({ error: 'Could not save settings. Please try again.' }, { status: 500 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(revalidateTag as any)(SOCIAL_LINKS_TAG, 'max')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(revalidateTag as any)(GENERAL_SETTINGS_TAG, 'max')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(revalidateTag as any)(SERVER_RATES_TAG, 'max')

  const [social, general, rates] = await Promise.all([
    readSocialLinks(),
    readGeneralSettings(),
    readServerRates(),
  ])
  return Response.json({ ...social, contactNpcName: general.contactNpcName, ...rates })
}
