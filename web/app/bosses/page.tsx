import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import BossTimer from '@/components/bosses/BossTimer'
import Sprite from '@/components/maple/Sprite'
import type { Metadata } from 'next'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Boss Records',
  description: 'Check the fastest boss clear times on ShinyMS — Zakum, Horntail, Pink Bean and more. Updated every minute.',
  alternates: { canonical: 'https://shinyms.com/bosses' },
  openGraph: { url: 'https://shinyms.com/bosses', title: 'Boss Records | ShinyMS', description: 'Fastest boss kills on ShinyMS MapleStory v83.' },
}

const BOSS_LABELS: Record<string, { label: string; accent: string; sprite?: string }> = {
  ZAKUM:     { label: 'Zakum',     accent: '#dc2626', sprite: '/maple/mobs/zakum.gif' },
  HORNTAIL:  { label: 'Horntail',  accent: '#ea580c', sprite: '/maple/mobs/horntail.gif' },
  PINKBEAN:  { label: 'Pink Bean', accent: '#db2777', sprite: '/maple/mobs/pink-bean.gif' },
  PAPULATUS: { label: 'Papulatus', accent: '#7c3aed', sprite: '/maple/mobs/papulatus.gif' },
  SCARGA:    { label: 'Scarga',    accent: '#0891b2' },
}

const BOSS_ORDER = ['ZAKUM', 'HORNTAIL', 'PINKBEAN', 'PAPULATUS', 'SCARGA']

type BossEntry = { characterName: string; kills: number }
type BossMap = Record<string, { total: number; top: BossEntry[] }>
type GroupRow = { characterid: number; _count: { id: number } }

// Top 5 killers + total kills for a single boss. Querying per boss (rather than
// one global groupBy with a row cap) guarantees every boss gets its true top 5
// — a global `take` would drop a low-volume boss whose killers sort below the
// cap behind a high-volume boss.
async function topAndTotal(table: 'daily' | 'weekly', boss: string): Promise<{ top: GroupRow[]; total: number }> {
  if (table === 'daily') {
    const [top, total] = await Promise.all([
      prisma.bosslogDaily.groupBy({ by: ['characterid'], where: { bosstype: boss }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }).catch(() => [] as GroupRow[]),
      prisma.bosslogDaily.count({ where: { bosstype: boss } }).catch(() => 0),
    ])
    return { top, total }
  }
  const [top, total] = await Promise.all([
    prisma.bosslogWeekly.groupBy({ by: ['characterid'], where: { bosstype: boss }, _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 5 }).catch(() => [] as GroupRow[]),
    prisma.bosslogWeekly.count({ where: { bosstype: boss } }).catch(() => 0),
  ])
  return { top, total }
}

async function getBossStats(table: 'daily' | 'weekly'): Promise<BossMap> {
  const perBoss = await Promise.all(
    BOSS_ORDER.map(async (boss) => ({ boss, ...(await topAndTotal(table, boss)) })),
  )

  const charIds = [...new Set(perBoss.flatMap(b => b.top.map(t => t.characterid)))]
  const chars =
    charIds.length > 0
      ? await prisma.character.findMany({
          where: { id: { in: charIds } },
          select: { id: true, name: true },
        }).catch(() => [])
      : []
  const charMap = new Map(chars.map(c => [c.id, c.name]))

  const bossMap: BossMap = {}
  for (const { boss, top, total } of perBoss) {
    bossMap[boss] = {
      total,
      top: top.map(t => ({ characterName: charMap.get(t.characterid) ?? 'Unknown', kills: t._count.id })),
    }
  }
  return bossMap
}

export default async function BossesPage() {
  const [daily, weekly] = await Promise.all([
    getBossStats('daily'),
    getBossStats('weekly'),
  ])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-10 flex items-center gap-3">
        <Sprite src="/maple/mobs/mushmom.gif" alt="" height={56} anim="bob" grounded={false} className="shrink-0" />
        <div>
          <h1
            className="font-display font-bold text-2xl sm:text-3xl"
            style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}
          >
            Boss Leaderboards
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
            Kill counts reset with the server&apos;s daily and weekly cycles
          </p>
        </div>
      </div>

      {/* Reset countdowns */}
      <div
        className="mb-8 rounded-2xl px-5 py-4 flex flex-col sm:flex-row gap-4 sm:gap-10"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--foreground-subtle)' }}>Daily reset in</span>
          <BossTimer period="daily" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--foreground-subtle)' }}>Weekly reset in</span>
          <BossTimer period="weekly" />
        </div>
      </div>

      {(['daily', 'weekly'] as const).map(period => {
        const stats = period === 'daily' ? daily : weekly
        return (
          <section key={period} className="mb-12">
            <h2
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: 'var(--foreground-subtle)' }}
            >
              {period === 'daily' ? 'Daily' : 'Weekly'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {BOSS_ORDER.map(bossKey => {
                const info = BOSS_LABELS[bossKey]
                const data = stats[bossKey]
                return (
                  <div
                    key={bossKey}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 1px 6px rgba(28,21,39,0.05)',
                    }}
                  >
                    {/* Boss header */}
                    <div
                      className="px-4 py-3 flex items-center justify-between"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex items-center gap-2.5">
                        {info.sprite ? (
                          <span
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0 overflow-hidden"
                            style={{ backgroundColor: `${info.accent}14`, border: `1px solid ${info.accent}33` }}
                          >
                            <Sprite src={info.sprite} alt={info.label} height={28} anim="bob" grounded={false} />
                          </span>
                        ) : (
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.accent }} />
                        )}
                        <span className="font-bold text-sm font-display" style={{ color: 'var(--foreground)' }}>
                          {info.label}
                        </span>
                      </div>
                      <span
                        className="text-xs font-mono font-bold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${info.accent}18`,
                          color: info.accent,
                        }}
                      >
                        {data?.total ?? 0} kills
                      </span>
                    </div>

                    {/* Top killers */}
                    <div className="p-3 flex flex-col gap-1.5">
                      {data && data.top.length > 0 ? (
                        data.top.map((entry, i) => (
                          <div key={i} className="flex items-center justify-between gap-2 text-sm">
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className="text-xs font-bold w-4 shrink-0 text-right"
                                style={{ color: i < 3 ? info.accent : 'var(--foreground-subtle)' }}
                              >
                                {i + 1}
                              </span>
                              <Link
                                href={`/character/${encodeURIComponent(entry.characterName)}`}
                                className="truncate hover:underline font-medium"
                                style={{ color: 'var(--foreground)' }}
                              >
                                {entry.characterName}
                              </Link>
                            </div>
                            <span
                              className="font-mono text-xs shrink-0"
                              style={{ color: 'var(--foreground-subtle)' }}
                            >
                              ×{entry.kills}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-center py-2" style={{ color: 'var(--foreground-subtle)' }}>
                          No kills recorded
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
