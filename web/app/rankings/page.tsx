import { prisma } from '@/lib/prisma'
import { getJobName, getJobClass, jobClassColors, jobClassRange, jobClassLabels, FILTERABLE_JOB_CLASSES, STAFF_JOB_CLASSES, type JobClass } from '@/lib/jobs'
import Link from 'next/link'
import Sprite from '@/components/maple/Sprite'
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
  // Staff are hidden by default; a staff-class filter lifts the gm = 0 exclusion so they show.
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

const MEDALS = ['🥇', '🥈', '🥉']

function FilterTab({
  label,
  href,
  isActive,
  colorClass,
}: {
  label: string
  href: string
  isActive: boolean
  colorClass?: string
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'true' : undefined}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors duration-150 ${!isActive && colorClass ? colorClass : ''}`}
      style={
        isActive
          ? { backgroundColor: 'var(--primary)', color: '#fff', border: '1px solid var(--primary)' }
          : colorClass
            ? undefined
            : { backgroundColor: 'var(--surface)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }
      }
    >
      {label}
    </Link>
  )
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; job?: string }>
}) {
  const { q = '', job = '' } = await searchParams
  const query = q.trim()

  // Only honour a job value that matches a known class; otherwise treat as no filter.
  const jobFilter = (FILTERABLE_JOB_CLASSES as string[]).includes(job) ? (job as JobClass) : undefined

  // When searching, only run the search; otherwise load the full rankings.
  // A job filter narrows the main table; the fame/rebirth tops stay server-wide and are hidden while filtering.
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
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Sprite src="/maple/mobs/mano.gif" alt="" height={52} anim="hop" grounded={false} className="hidden sm:block shrink-0" />
        <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>
          Player Rankings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
          {query
            ? `Search results for "${query}"`
            : jobFilter
              ? `Top ${characters.length} ${jobClassLabels[jobFilter]}s ranked by rebirths, level, then fame`
              : `Top ${characters.length} players ranked by rebirths, level, then fame`}
        </p>
        </div>
      </div>

      {/* Search — plain GET, no JS required */}
      <form method="GET" action="/rankings" className="flex gap-3 mb-8">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search for a player by character name…"
          autoComplete="off"
          className="flex-1 rounded-xl px-4 py-2.5 text-sm"
          style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: 'var(--foreground)', outline: 'none' }}
        />
        <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
          Search
        </button>
        {query && (
          <a href="/rankings" className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}>
            Clear
          </a>
        )}
      </form>

      {/* Search results */}
      {query && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}>
          <table className="w-full text-sm" style={{ backgroundColor: 'var(--surface)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--navy)' }}>
                {['Character', 'Level', 'Class', 'Guild', 'Rank'].map((h, i) => (
                  <th key={h} className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider${i >= 3 ? ' hidden sm:table-cell' : ''}`} style={{ color: 'rgba(255,255,255,0.7)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {searchResults.map((c, i) => {
                const color = jobClassColors[getJobClass(c.job)]
                return (
                  <tr key={c.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', backgroundColor: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-raised)' }}>
                    <td className="px-4 py-3">
                      <Link href={`/character/${encodeURIComponent(c.name)}`} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>{c.name}</Link>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--foreground)' }}>{c.level}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{getJobName(c.job)}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm" style={{ color: 'var(--foreground-subtle)' }}>{c.guildName ?? '—'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell font-mono text-sm" style={{ color: 'var(--foreground-subtle)' }}>{c.rank > 0 ? `#${c.rank}` : '—'}</td>
                  </tr>
                )
              })}
              {searchResults.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-sm" style={{ color: 'var(--foreground-subtle)' }}>
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
            colorClass={jobClassColors[jc]}
          />
        ))}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}
      >
        <table className="w-full text-sm" style={{ backgroundColor: 'var(--surface)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--navy)' }}>
              <th className="px-4 py-3.5 text-left w-16 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>#</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>Character</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>Level</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>Rebirths</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>Fame</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>Class</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'rgba(255,255,255,0.7)' }}>Guild</th>
            </tr>
          </thead>
          <tbody>
            {characters.map((char, i) => {
              const jobClass = getJobClass(char.job)
              const color = jobClassColors[jobClass]
              const isTop3 = char.displayRank <= 3

              return (
                <tr
                  key={char.id}
                  style={{
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    backgroundColor: isTop3
                      ? 'var(--accent-subtle)'
                      : i % 2 === 0 ? 'var(--surface)' : 'var(--surface-raised)',
                  }}
                >
                  <td className="px-4 py-3 font-bold text-base w-16">
                    {isTop3 ? (
                      <span>{MEDALS[char.displayRank - 1]}</span>
                    ) : (
                      <span className="text-sm font-mono" style={{ color: 'var(--foreground-subtle)' }}>
                        {char.displayRank}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/character/${encodeURIComponent(char.name)}`}
                      className="font-semibold transition-colors duration-150 hover:underline"
                      style={{ color: isTop3 ? 'var(--accent-foreground)' : 'var(--primary)' }}
                    >
                      {char.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--foreground)' }}>
                    {char.level}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--foreground)' }}>
                    {char.reborns}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--foreground)' }}>
                    {char.fame}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>
                      {getJobName(char.job)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-sm" style={{ color: 'var(--foreground-subtle)' }}>
                    {char.guildName ?? '—'}
                  </td>
                </tr>
              )
            })}
            {characters.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-16 text-sm" style={{ color: 'var(--foreground-subtle)' }}>
                  No characters found yet. Be the first to rank up!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Top Fame */}
      {fameTop.length > 0 && (
        <div className="mt-12">
          <div className="mb-4">
            <h2 className="font-display font-bold text-xl" style={{ color: 'var(--foreground)', letterSpacing: '0.03em' }}>Top Fame</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>Most famed players on the server</p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}>
            <table className="w-full text-sm" style={{ backgroundColor: 'var(--surface)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--navy)' }}>
                  {['#', 'Character', 'Fame', 'Level', 'Class'].map((h, i) => (
                    <th key={h} className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${i === 0 ? 'text-left w-16' : i >= 3 ? 'text-left hidden sm:table-cell' : 'text-left'}`} style={{ color: 'rgba(255,255,255,0.7)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fameTop.map((char, i) => {
                  const color = jobClassColors[getJobClass(char.job)]
                  return (
                    <tr key={char.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', backgroundColor: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-raised)' }}>
                      <td className="px-4 py-3 font-mono text-sm w-16" style={{ color: 'var(--foreground-subtle)' }}>{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/character/${encodeURIComponent(char.name)}`} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>{char.name}</Link>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--foreground)' }}>{char.fame}</td>
                      <td className="px-4 py-3 font-mono hidden sm:table-cell" style={{ color: 'var(--foreground-subtle)' }}>{char.level}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{getJobName(char.job)}</span>
                      </td>
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
        <div className="mt-12">
          <div className="mb-4">
            <h2 className="font-display font-bold text-xl" style={{ color: 'var(--foreground)', letterSpacing: '0.03em' }}>Top Rebirths</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>Players who have completed the most rebirths</p>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}>
            <table className="w-full text-sm" style={{ backgroundColor: 'var(--surface)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--navy)' }}>
                  {['#', 'Character', 'Rebirths', 'Level', 'Class'].map((h, i) => (
                    <th key={h} className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${i === 0 ? 'text-left w-16' : i >= 3 ? 'text-left hidden sm:table-cell' : 'text-left'}`} style={{ color: 'rgba(255,255,255,0.7)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rebirthsTop.map((char, i) => {
                  const color = jobClassColors[getJobClass(char.job)]
                  return (
                    <tr key={char.id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', backgroundColor: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-raised)' }}>
                      <td className="px-4 py-3 font-mono text-sm w-16" style={{ color: 'var(--foreground-subtle)' }}>{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/character/${encodeURIComponent(char.name)}`} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>{char.name}</Link>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--foreground)' }}>{char.reborns}</td>
                      <td className="px-4 py-3 font-mono hidden sm:table-cell" style={{ color: 'var(--foreground-subtle)' }}>{char.level}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{getJobName(char.job)}</span>
                      </td>
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
