import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { loadModerationTarget } from '@/lib/moderation'
import { z } from 'zod'

const schema = z.object({ reason: z.string().min(1).max(500) })

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.webadmin !== 1) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const accountId = parseInt(id, 10)
  if (isNaN(accountId)) return Response.json({ error: 'Invalid id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Reason is required' }, { status: 400 })

  const check = await loadModerationTarget(accountId)
  if ('error' in check) return check.error

  await prisma.account.update({
    where: { id: accountId },
    data: { banned: 1, banreason: parsed.data.reason },
  })
  console.log(`[ADMIN] ${session.user.name} banned account ${id}: ${parsed.data.reason}`)
  return Response.json({ success: true })
}
