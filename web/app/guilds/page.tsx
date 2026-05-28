import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Sprite from '@/components/maple/Sprite'
import type { Metadata } from 'next'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'Guild Rankings',
  description: 'Browse the top guilds on ShinyMS MapleStory v83 private server, ranked by guild points and member count.',
  alternates: { canonical: 'https://shinyms.com/guilds' },
  openGraph: { url: 'https://shinyms.com/guilds', title: 'Guild Rankings | ShinyMS', description: 'Top guilds on ShinyMS ranked by guild points.' },
}

async function getGuildRankings(search?: string) {
  const term = search?.trim()
  const guilds = await prisma.guild.findMany({
    where: term ? { name: { contains: term } } : undefined,
    orderBy: { GP: 'desc' },
    take: 50,
    select: { guildid: true, name: true, GP: true, capacity: true, notice: true },
  }).catch(() => [])

  if (guilds.length === 0) return []

  const guildIds = guilds.map(g => g.guildid)

  const memberStats = await prisma.character.groupBy({
    by: ['guildid'],
    where: { guildid: { in: guildIds }, gm: 0 },
    _count: { id: true },
    _max: { level: true },
  }).catch(() => [])

  const statsMap = new Map(memberStats.map(s => [s.guildid, s]))

  return guilds.map((g, i) => {
    const stats = statsMap.get(g.guildid)
    return {
      ...g,
      members: stats?._count.id ?? 0,
      topLevel: stats?._max.level ?? 0,
      displayRank: i + 1,
    }
  })
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: '9999px',
          backgroundColor: '#f8c34a',
          border: '2px solid #3a2418',
          fontFamily: 'var(--ms-font-d)',
          fontSize: '10px',
          color: '#2a1810',
          textShadow: '1px 1px 0 #fff5b0',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        }}
      >
        1
      </span>
    )
  }
  if (rank === 2) {
    return (
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: '9999px',
          backgroundColor: '#c0c0c0',
          border: '2px solid #3a2418',
          fontFamily: 'var(--ms-font-d)',
          fontSize: '10px',
          color: '#2a1810',
          textShadow: '1px 1px 0 #fff',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        }}
      >
        2
      </span>
    )
  }
  if (rank === 3) {
    return (
      <span
        className="inline-flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: '9999px',
          backgroundColor: '#cd7f32',
          border: '2px solid #3a2418',
          fontFamily: 'var(--ms-font-d)',
          fontSize: '10px',
          color: '#2a1810',
          textShadow: '1px 1px 0 #ffd8a0',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        }}
      >
        3
      </span>
    )
  }
  return (
    <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: '10px', color: '#4a3220' }}>
      {rank}
    </span>
  )
}

export default async function GuildsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const query = q.trim()
  const guilds = await getGuildRankings(query)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-6 flex items-center gap-3">
        <Sprite src="/maple/mobs/ribbon-pig.gif" alt="" height={52} anim="bob" grounded={false} className="hidden sm:block shrink-0" />
        <div>
          <h1 className="ms-section-title" style={{ margin: 0 }}>
            Guild Rankings
          </h1>
          <p className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#4a3220' }}>
            {query ? `Guilds matching "${query}"` : `Top ${guilds.length} guilds ranked by Guild Points`}
          </p>
        </div>
      </div>

      {/* Search — plain GET, no JS required */}
      <form method="GET" action="/guilds" className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search for a guild by name…"
          autoComplete="off"
          className="flex-1 px-4 py-2.5"
          style={{
            border: '3px solid #3a2418',
            backgroundColor: '#f8efd0',
            color: '#2a1810',
            fontFamily: 'var(--ms-font-b)',
            fontSize: '18px',
            outline: 'none',
            boxShadow: 'inset 2px 2px 0 #b89460, inset -2px -2px 0 #fff5d8',
          }}
        />
        <button type="submit" className="ms-btn">
          Search
        </button>
        {query && (
          <Link href="/guilds" className="ms-btn" style={{ background: 'linear-gradient(to bottom, #d8c08c 0%, #b89460 100%)', color: '#2a1810', textShadow: '1px 1px 0 #f0dc9c' }}>
            Clear
          </Link>
        )}
      </form>

      <div className="ms-pixel-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: '420px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 50%, #3a2418 100%)' }}>
                {['#', 'Guild', 'GP', 'Members', 'Top Level'].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 ${i === 0 ? 'text-left w-16' : i >= 2 ? 'text-right hidden sm:table-cell' : 'text-left'}`}
                    style={{
                      fontFamily: 'var(--ms-font-d)',
                      fontSize: '9px',
                      color: '#ffd96b',
                      letterSpacing: '1px',
                      borderBottom: '3px solid #2a1810',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guilds.map((guild, i) => {
                const isTop3 = !query && guild.displayRank <= 3
                return (
                  <tr
                    key={guild.guildid}
                    className="transition-colors hover:bg-[var(--ms-slot-hover)]"
                    style={{
                      backgroundColor: i % 2 === 0 ? 'var(--ms-panel-bg)' : '#f0dfb0',
                      borderBottom: '1px solid var(--ms-slot-shadow)',
                    }}
                  >
                    <td className="px-4 py-3 w-16">
                      <RankBadge rank={guild.displayRank} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/guilds/${encodeURIComponent(guild.name)}`}
                        className="hover:underline"
                        style={{
                          fontFamily: 'var(--ms-font-b)',
                          fontSize: '18px',
                          color: isTop3 ? '#c64b1b' : '#2a1810',
                          fontWeight: 600,
                        }}
                      >
                        {guild.name}
                      </Link>
                      {guild.notice && (
                        <p
                          className="mt-0.5 truncate max-w-xs"
                          style={{ fontFamily: 'var(--ms-font-b)', fontSize: '16px', color: '#4a3220' }}
                        >
                          {guild.notice}
                        </p>
                      )}
                    </td>
                    <td
                      className="px-4 py-3 text-right hidden sm:table-cell"
                      style={{ fontFamily: 'var(--ms-font-d)', fontSize: '11px', color: '#2a1810' }}
                    >
                      {guild.GP.toLocaleString()}
                    </td>
                    <td
                      className="px-4 py-3 text-right hidden sm:table-cell"
                      style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#4a3220' }}
                    >
                      {guild.members}/{guild.capacity}
                    </td>
                    <td
                      className="px-4 py-3 text-right hidden sm:table-cell"
                      style={{ fontFamily: 'var(--ms-font-d)', fontSize: '11px', color: '#2a1810' }}
                    >
                      {guild.topLevel > 0 ? guild.topLevel : '—'}
                    </td>
                  </tr>
                )
              })}
              {guilds.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '20px', color: '#4a3220' }}>
                    {query ? `No guilds found matching "${query}"` : 'No guilds found yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
