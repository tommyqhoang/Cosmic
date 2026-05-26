import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.webadmin !== 1) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const q = req.nextUrl.searchParams.get('search') ?? ''
  const accounts = await prisma.account.findMany({
    // Match the account name OR any of its characters' names, so admins can
    // look an account up by either the login or an in-game character.
    where: q
      ? { OR: [{ name: { contains: q } }, { characters: { some: { name: { contains: q } } } }] }
      : undefined,
    select: {
      id: true, name: true, email: true, banned: true, banreason: true,
      mute: true, webadmin: true, loggedin: true, lastlogin: true,
      createdat: true, nxCredit: true, maplePoint: true, votepoints: true,
      characters: {
        select: { id: true, name: true, level: true, job: true, world: true },
        orderBy: { level: 'desc' },
      },
    },
    orderBy: { createdat: 'desc' },
    take: 50,
  })
  return Response.json(accounts)
}
