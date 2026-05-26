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

const MEDALS = ['🥇', '🥈', '🥉']

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
        <h1
          className="font-display font-bold text-2xl sm:text-3xl"
          style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}
        >
          Guild Rankings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
          {query ? `Guilds matching "${query}"` : `Top ${guilds.length} guilds ranked by Guild Points`}
        </p>
        </div>
      </div>

      {/* Search — plain GET, no JS required */}
      <form method="GET" action="/guilds" className="flex gap-3 mb-8">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search for a guild by name…"
          autoComplete="off"
          className="flex-1 rounded-xl px-4 py-2.5 text-sm"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--foreground)', outline: 'none' }}
        />
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
          Search
        </button>
        {query && (
          <Link href="/guilds" className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}>
            Clear
          </Link>
        )}
      </form>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}
      >
        <table className="w-full text-sm" style={{ backgroundColor: 'var(--surface)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--navy)' }}>
              {['#', 'Guild', 'GP', 'Members', 'Top Level'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${i === 0 ? 'text-left w-16' : i >= 2 ? 'text-right hidden sm:table-cell' : 'text-left'}`}
                  style={{ color: 'rgba(255,255,255,0.7)' }}
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
                  style={{
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    backgroundColor: isTop3
                      ? 'var(--accent-subtle)'
                      : i % 2 === 0 ? 'var(--surface)' : 'var(--surface-raised)',
                  }}
                >
                  <td className="px-4 py-3 font-bold text-base w-16">
                    {isTop3 ? (
                      <span>{MEDALS[guild.displayRank - 1]}</span>
                    ) : (
                      <span className="text-sm font-mono" style={{ color: 'var(--foreground-subtle)' }}>
                        {guild.displayRank}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/guilds/${encodeURIComponent(guild.name)}`}
                      className="font-semibold hover:underline"
                      style={{ color: isTop3 ? 'var(--accent-foreground)' : 'var(--primary)' }}
                    >
                      {guild.name}
                    </Link>
                    {guild.notice && (
                      <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: 'var(--foreground-subtle)' }}>
                        {guild.notice}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell font-mono font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                    {guild.GP.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell text-sm" style={{ color: 'var(--foreground-subtle)' }}>
                    {guild.members}/{guild.capacity}
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell font-mono text-sm" style={{ color: 'var(--foreground)' }}>
                    {guild.topLevel > 0 ? guild.topLevel : '—'}
                  </td>
                </tr>
              )
            })}
            {guilds.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-16 text-sm" style={{ color: 'var(--foreground-subtle)' }}>
                  {query ? `No guilds found matching "${query}"` : 'No guilds found yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
