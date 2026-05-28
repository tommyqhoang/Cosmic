import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getJobName, getJobClass } from '@/lib/jobs'

const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=30' }

const getTopCharacters = unstable_cache(
  async () => {
    const chars = await prisma.character.findMany({
      where: { gm: 0 },
      orderBy: [{ reborns: 'desc' }, { level: 'desc' }],
      take: 3,
      select: { name: true, level: true, job: true, reborns: true },
    })
    return chars.map((c) => ({
      name: c.name,
      level: c.level,
      jobName: getJobName(c.job),
      jobClass: getJobClass(c.job),
    }))
  },
  ['top-characters'],
  { revalidate: 60 },
)

export async function GET() {
  try {
    const players = await getTopCharacters()
    return Response.json({ players }, { headers: CACHE_HEADERS })
  } catch {
    return Response.json({ players: [] }, { headers: CACHE_HEADERS })
  }
}
