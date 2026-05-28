import { prisma } from '@/lib/prisma'
import { getJobName, getJobClass } from '@/lib/jobs'

export const dynamic = 'force-dynamic'

const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=30' }

export async function GET() {
  try {
    const chars = await prisma.character.findMany({
      where: { gm: 0 },
      orderBy: [{ reborns: 'desc' }, { level: 'desc' }],
      take: 3,
      select: { name: true, level: true, job: true, reborns: true },
    })
    const players = chars.map((c) => ({
      name: c.name,
      level: c.level,
      jobName: getJobName(c.job),
      jobClass: getJobClass(c.job),
    }))
    return Response.json({ players }, { headers: CACHE_HEADERS })
  } catch {
    return Response.json({ players: [] }, { headers: CACHE_HEADERS })
  }
}
