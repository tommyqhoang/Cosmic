import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Refresh every ISR-cached page that renders posts so edits/deletes show now.
function revalidatePostPages(postId: number) {
  revalidatePath('/')
  revalidatePath('/news')
  revalidatePath(`/news/${postId}`)
}

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  category: z.enum(['changelog', 'maintenance', 'alert', 'event', 'update']).optional(),
  pinned: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return { error: Response.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (session.user.webadmin !== 1) return { error: Response.json({ error: 'Forbidden' }, { status: 403 }) }
  return { session }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin()
  if ('error' in check) return check.error

  const { id } = await params
  const postId = parseInt(id, 10)
  if (isNaN(postId)) return Response.json({ error: 'Invalid post id' }, { status: 400 })

  const body = await req.json().catch(() => null)
  if (!body) return Response.json({ error: 'Invalid body' }, { status: 400 })

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })

  try {
    const post = await prisma.cmsPost.update({ where: { id: postId }, data: parsed.data })
    revalidatePostPages(postId)
    return Response.json(post)
  } catch {
    return Response.json({ error: 'Post not found' }, { status: 404 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const check = await requireAdmin()
  if ('error' in check) return check.error

  const { id } = await params
  const postId = parseInt(id, 10)
  if (isNaN(postId)) return Response.json({ error: 'Invalid post id' }, { status: 400 })

  try {
    await prisma.cmsPost.delete({ where: { id: postId } })
    revalidatePostPages(postId)
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'Post not found' }, { status: 404 })
  }
}
