import { prisma } from '@/lib/prisma'
import { getJobName, getJobClass, jobClassColors, jobClassRange, jobClassLabels, FILTERABLE_JOB_CLASSES, STAFF_JOB_CLASSES, type JobClass } from '@/lib/jobs'
import Link from 'next/link'
import Sprite from '@/components/maple/Sprite'
import SectionBanner from '@/components/maple/SectionBanner'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Player Rankings & Search',
  description: 'See the top MapleStory v83 players on ShinyMS ranked by level, experience, and job class — or search for any player by character name.',
  alternates: { canonical: 'https://shinyms.com/rankings' },
  openGraph: { url: 'https://shinyms.com/rankings', title: 'Player Rankings | ShinyMS', description: 'Top players on ShinyMS ranked by level and class.' },
}

async function resolveGuildNames<T extends { guildid: number }>(chars: T[]): Promise<(T & { guildName: string | null })[]> {
  const guildIds = [...new Set(chars.filter(c => c.guildid > 0).map(c => c.guildid))]
  const guilds = guildIds.length > 0
    ? await prisma.guild.findMany({ where: { guildid: { in: guildIds } }, select: { guildid: true, name: true } }).catch(() => [])
    : []
  const guildMap = Object.fromEntries(guilds.map(g => [g.guildid, g.name]))
  return chars.map(c => ({ ...c, guildName: guildMap[c.guildid] ?? null }))
}

async function searchCharacters(q: string) {
  const term = q.trim()
  if (!term) return []
  const results = await prisma.character.findMany({
    where: { name: { contains: term }, gm: 0 },
    orderBy: [{ level: 'desc' }, { rank: 'asc' }],
    take: 30,
    select: { id: true, name: true, level: true, job: true, rank: true, guildid: true },
  }).catch(() => [])
  return resolveGuildNames(results)
}

async function getTopByFame() {
  return prisma.character.findMany({
    where: { gm: 0, fame: { gt: 0 } },
    orderBy: { fame: 'desc' },
    take: 10,
    select: { id: true, name: true, level: true, job: true, fame: true },
  }).catch(() => [])
}

async function getTopByRebirths() {
  return prisma.character.findMany({
    where: { gm: 0, reborns: { gt: 0 } },
    orderBy: [{ reborns: 'desc' }, { level: 'desc' }],
    take: 10,
    select: { id: true, name: true, level: true, job: true, reborns: true },
  }).catch(() => [])
}

async function getTopCharacters(jobClass?: JobClass) {
  const range = jobClass ? jobClassRange(jobClass) : null
  const isStaff = jobClass ? STAFF_JOB_CLASSES.includes(jobClass) : false
  const chars = await prisma.character.findMany({
    where: { ...(isStaff ? {} : { gm: 0 }), ...(range ? { job: { gte: range.gte, lt: range.lt } } : {}) },
    orderBy: [{ reborns: 'desc' }, { level: 'desc' }, { fame: 'desc' }, { rank: 'asc' }],
    take: 100,
    select: { id: true, name: true, level: true, reborns: true, fame: true, job: true, rank: true, rankMove: true, guildid: true, world: true },
  }).catch(() => [])

  const withGuilds = await resolveGuildNames(chars)
  return withGuilds.map((c, i) => ({ ...c, displayRank: i + 1 }))
}

function FilterTab({
  label,
  href,
  isActive,
}: {
  label: string
  href: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'true' : undefined}
      className={`ms-btn ms-btn-sm ${isActive ? 'ms-btn-green' : ''}`}
    >
      {label}
    </Link>
  )
}

function RankBadge({ rank }: { rank: number }) {
  const colors = ['#f8c34a', '#c0c0c0', '#cd7f32']
  if (rank > 3) {
    return (
      <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: '9px', color: '#4a3220' }}>
        {rank}
      </span>
    )
  }
  return (
    <span
      style={{
        fontFamily: 'var(--ms-font-d)',
        fontSize: '9px',
        color: '#fff',
        background: colors[rank - 1],
        border: '2px solid #1a0a04',
        padding: '2px 6px',
        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
        display: 'inline-block',
      }}
    >
      {rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'}
    </span>
  )
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; job?: string }>
}) {
  const { q = '', job = '' } = await searchParams
  const query = q.trim()

  const jobFilter = (FILTERABLE_JOB_CLASSES as string[]).includes(job) ? (job as JobClass) : undefined

  const searchResults = query ? await searchCharacters(query) : []
  const [characters, fameTop, rebirthsTop] = query
    ? [[], [], []] as const
    : await Promise.all([
        getTopCharacters(jobFilter),
        jobFilter ? Promise.resolve([]) : getTopByFame(),
        jobFilter ? Promise.resolve([]) : getTopByRebirths(),
      ])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Hero */}
      <div className="relative mb-10 text-center sm:text-left">
        <span className="ms-sparkle" style={{ top: '10%', right: '8%' }}>✦</span>
        <span className="ms-sparkle" style={{ bottom: '0%', left: '4%', animationDelay: '0.6s' }}>✦</span>
        <div className="absolute -top-4 right-0 hidden sm:block">
          <Sprite src="/maple/mobs/mano.gif" alt="" height={48} anim="hop" grounded={false} delay={100} />
        </div>
        <div className="absolute top-8 -left-6 hidden sm:block">
          <Sprite src="/maple/mobs/snail.gif" alt="" height={36} anim="bob" grounded={false} delay={300} />
        </div>
        <SectionBanner>Rankings</SectionBanner>
        <h1 className="ms-hero-title mt-2">Player Rankings</h1>
        <p className="ms-hero-sub mt-3">
          {query
            ? `Search results for "${query}"`
            : jobFilter
              ? `Top ${characters.length} ${jobClassLabels[jobFilter]}s ranked by rebirths, level, then fame`
              : `Top ${characters.length} players ranked by rebirths, level, then fame`}
        </p>
      </div>

      {/* Search */}
      <form method="GET" action="/rankings" className="mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search for a player by character name..."
            aria-label="Search players by character name"
            autoComplete="off"
            className="w-full"
            style={{
              fontFamily: 'var(--ms-font-b)',
              fontSize: '20px',
              background: '#fff8d8',
              border: '3px solid #2a1810',
              boxShadow: 'inset 2px 2px 0 #d8c08c, inset -2px -2px 0 #fff',
              padding: '10px 14px',
              color: '#2a1810',
              outline: 'none',
            }}
          />
        </div>
        <button type="submit" className="ms-btn ms-btn-green">
          Search
        </button>
        {query && (
          <a href="/rankings" className="ms-btn">
            Clear
          </a>
        )}
      </form>

      {/* Search results */}
      {query && (
        <div className="ms-pixel-panel mb-8 overflow-x-auto">
          <table className="w-full" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '20px', minWidth: '500px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)', color: '#ffd96b', fontFamily: 'var(--ms-font-d)', fontSize: '11px', letterSpacing: '1px' }}>
                {['Character', 'Level', 'Class', 'Guild', 'Rank'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-left ${i >= 3 ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {searchResults.map((c, i) => {
                const color = jobClassColors[getJobClass(c.job)]
                return (
                  <tr key={c.id} style={{
                    borderTop: i === 0 ? 'none' : '2px dashed #b89460',
                    backgroundColor: i % 2 === 0 ? 'var(--ms-npc-bg)' : '#f0dfb0',
                  }}>
                    <td className="px-4 py-2.5">
                      <Link href={`/character/${encodeURIComponent(c.name)}`} className="hover:underline" style={{ color: '#c64b1b', fontWeight: 600 }}>{c.name}</Link>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: '#2a1810' }}>{c.level}</td>
                    <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{getJobName(c.job)}</span></td>
                    <td className="px-4 py-2.5 hidden sm:table-cell" style={{ color: '#4a3220' }}>{c.guildName ?? '—'}</td>
                    <td className="px-4 py-2.5 hidden sm:table-cell" style={{ color: '#4a3220' }}>{c.rank > 0 ? `#${c.rank}` : '—'}</td>
                  </tr>
                )
              })}
              {searchResults.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10" style={{ color: '#4a3220' }}>
                    No characters found for &quot;{query}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table */}
      {!query && (<>

        {/* Job class filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <FilterTab label="All Classes" href="/rankings" isActive={!jobFilter} />
          {FILTERABLE_JOB_CLASSES.map((jc) => (
            <FilterTab
              key={jc}
              label={jobClassLabels[jc]}
              href={`/rankings?job=${jc}`}
              isActive={jobFilter === jc}
            />
          ))}
        </div>

        <div className="ms-pixel-panel mb-12 overflow-x-auto">
          <table className="w-full" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '20px', minWidth: '640px' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)', color: '#ffd96b', fontFamily: 'var(--ms-font-d)', fontSize: '11px', letterSpacing: '1px' }}>
                <th className="px-4 py-3 text-left w-16">#</th>
                <th className="px-4 py-3 text-left">Character</th>
                <th className="px-4 py-3 text-left">Level</th>
                <th className="px-4 py-3 text-left">Rebirths</th>
                <th className="px-4 py-3 text-left">Fame</th>
                <th className="px-4 py-3 text-left">Class</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Guild</th>
              </tr>
            </thead>
            <tbody>
              {characters.map((char, i) => {
                const jobClass = getJobClass(char.job)
                const color = jobClassColors[jobClass]

                return (
                  <tr
                    key={char.id}
                    style={{
                      borderTop: i === 0 ? 'none' : '2px dashed #b89460',
                      backgroundColor: i % 2 === 0 ? 'var(--ms-npc-bg)' : '#f0dfb0',
                    }}
                  >
                    <td className="px-4 py-2.5 w-16">
                      <RankBadge rank={char.displayRank} />
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/character/${encodeURIComponent(char.name)}`}
                        className="hover:underline"
                        style={{ color: '#c64b1b', fontWeight: 600 }}
                      >
                        {char.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: '#2a1810' }}>{char.level}</td>
                    <td className="px-4 py-2.5" style={{ color: '#2a1810' }}>{char.reborns}</td>
                    <td className="px-4 py-2.5" style={{ color: '#2a1810' }}>{char.fame}</td>
                    <td className="px-4 py-2.5"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{getJobName(char.job)}</span></td>
                    <td className="px-4 py-2.5 hidden sm:table-cell" style={{ color: '#4a3220' }}>{char.guildName ?? '—'}</td>
                  </tr>
                )
              })}
              {characters.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10" style={{ color: '#4a3220' }}>
                    No characters found yet. Be the first to rank up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Top Fame */}
        {fameTop.length > 0 && (
          <div className="mb-12">
            <SectionBanner>Top Fame</SectionBanner>
            <p className="ms-muted mb-4">Most famed players on the server</p>
            <div className="ms-pixel-panel overflow-x-auto">
              <table className="w-full" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '20px', minWidth: '480px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)', color: '#ffd96b', fontFamily: 'var(--ms-font-d)', fontSize: '11px', letterSpacing: '1px' }}>
                    {['#', 'Character', 'Fame', 'Level', 'Class'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-left ${i === 0 ? 'w-16' : i >= 3 ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fameTop.map((char, i) => {
                    const color = jobClassColors[getJobClass(char.job)]
                    return (
                      <tr key={char.id} style={{
                        borderTop: i === 0 ? 'none' : '2px dashed #b89460',
                        backgroundColor: i % 2 === 0 ? 'var(--ms-npc-bg)' : '#f0dfb0',
                      }}>
                        <td className="px-4 py-2.5 w-16">
                          <RankBadge rank={i + 1} />
                        </td>
                        <td className="px-4 py-2.5">
                          <Link href={`/character/${encodeURIComponent(char.name)}`} className="hover:underline" style={{ color: '#c64b1b', fontWeight: 600 }}>{char.name}</Link>
                        </td>
                        <td className="px-4 py-2.5" style={{ color: '#2a1810' }}>{char.fame}</td>
                        <td className="px-4 py-2.5 hidden sm:table-cell" style={{ color: '#4a3220' }}>{char.level}</td>
                        <td className="px-4 py-2.5 hidden sm:table-cell"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{getJobName(char.job)}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Rebirths */}
        {rebirthsTop.length > 0 && (
          <div className="mb-12">
            <SectionBanner>Top Rebirths</SectionBanner>
            <p className="ms-muted mb-4">Players who have completed the most rebirths</p>
            <div className="ms-pixel-panel overflow-x-auto">
              <table className="w-full" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '20px', minWidth: '480px' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)', color: '#ffd96b', fontFamily: 'var(--ms-font-d)', fontSize: '11px', letterSpacing: '1px' }}>
                    {['#', 'Character', 'Rebirths', 'Level', 'Class'].map((h, i) => (
                      <th key={h} className={`px-4 py-3 text-left ${i === 0 ? 'w-16' : i >= 3 ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rebirthsTop.map((char, i) => {
                    const color = jobClassColors[getJobClass(char.job)]
                    return (
                      <tr key={char.id} style={{
                        borderTop: i === 0 ? 'none' : '2px dashed #b89460',
                        backgroundColor: i % 2 === 0 ? 'var(--ms-npc-bg)' : '#f0dfb0',
                      }}>
                        <td className="px-4 py-2.5 w-16">
                          <RankBadge rank={i + 1} />
                        </td>
                        <td className="px-4 py-2.5">
                          <Link href={`/character/${encodeURIComponent(char.name)}`} className="hover:underline" style={{ color: '#c64b1b', fontWeight: 600 }}>{char.name}</Link>
                        </td>
                        <td className="px-4 py-2.5" style={{ color: '#2a1810' }}>{char.reborns}</td>
                        <td className="px-4 py-2.5 hidden sm:table-cell" style={{ color: '#4a3220' }}>{char.level}</td>
                        <td className="px-4 py-2.5 hidden sm:table-cell"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{getJobName(char.job)}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </>)}
    </div>
  )
}
