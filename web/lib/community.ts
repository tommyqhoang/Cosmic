import { prisma } from '@/lib/prisma'

// Community-feed data. Smega rows come from our own CmsSmega table; weddings and
// fame are read straight from the v83 game tables (`marriages`, `famelog`),
// which aren't modelled in Prisma, so we use raw SQL. All reads are wrapped so a
// missing table (e.g. before the smega migration runs) degrades to an empty feed
// rather than crashing the page.

export type Smega = {
  id: number
  player: string
  channel: number
  type: string
  message: string
  itemId: number | null
  createdAt: Date
}

export async function recentSmegas(limit = 30): Promise<Smega[]> {
  try {
    return await prisma.cmsSmega.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
  } catch {
    return []
  }
}

export type Wedding = {
  marriageid: number
  husband: string
  husbandJob: number
  wife: string
  wifeJob: number
}

// `marriages` has no timestamp, so marriageid (autoincrement) is our recency proxy.
export async function recentWeddings(limit = 8): Promise<Wedding[]> {
  return prisma.$queryRaw<Wedding[]>`
    SELECT m.marriageid, h.name AS husband, h.job AS husbandJob, w.name AS wife, w.job AS wifeJob
    FROM marriages m
    JOIN characters h ON h.id = m.husbandid
    JOIN characters w ON w.id = m.wifeid
    WHERE h.gm = 0 AND w.gm = 0
    ORDER BY m.marriageid DESC
    LIMIT ${limit}`.catch(() => [])
}

export type FameEvent = {
  fromName: string
  toName: string
  toJob: number
  at: Date
}

export async function recentFame(limit = 12): Promise<FameEvent[]> {
  return prisma.$queryRaw<FameEvent[]>`
    SELECT g.name AS fromName, t.name AS toName, t.job AS toJob, f.\`when\` AS at
    FROM famelog f
    JOIN characters t ON t.id = f.characterid_to
    JOIN characters g ON g.id = f.characterid
    ORDER BY f.\`when\` DESC
    LIMIT ${limit}`.catch(() => [])
}

export type FamedPlayer = {
  name: string
  job: number
  fameCount: number
}

// Most fame received in the last 7 days. COUNT(*) comes back as BigInt from
// MySQL, so coerce to Number before it leaves this module.
export async function topFamedThisWeek(limit = 8): Promise<FamedPlayer[]> {
  const rows = await prisma.$queryRaw<{ name: string; job: number; fameCount: bigint }[]>`
    SELECT t.name AS name, t.job AS job, COUNT(*) AS fameCount
    FROM famelog f
    JOIN characters t ON t.id = f.characterid_to
    WHERE t.gm = 0 AND f.\`when\` >= NOW() - INTERVAL 7 DAY
    GROUP BY t.id, t.name, t.job
    ORDER BY fameCount DESC
    LIMIT ${limit}`.catch(() => [])
  return rows.map((r) => ({ name: r.name, job: r.job, fameCount: Number(r.fameCount) }))
}
