import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import BossTimer from '@/components/bosses/BossTimer'
import Sprite from '@/components/maple/Sprite'
import SectionBanner from '@/components/maple/SectionBanner'
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
      {/* Hero */}
      <div className="relative mb-12 text-center sm:text-left">
        <span className="ms-sparkle" style={{ top: '10%', right: '5%' }}>✦</span>
        <span className="ms-sparkle" style={{ bottom: '0%', left: '2%', animationDelay: '0.5s' }}>✦</span>
        <div className="absolute -top-4 right-0 hidden sm:block">
          <Sprite src="/maple/mobs/zakum.gif" alt="" height={52} anim="bob" grounded={false} delay={200} />
        </div>
        <div className="absolute top-10 -left-6 hidden sm:block">
          <Sprite src="/maple/mobs/pink-bean.gif" alt="" height={44} anim="hop" grounded={false} delay={400} />
        </div>
        <SectionBanner>Boss Leaderboards</SectionBanner>
        <h1 className="ms-hero-title mt-2">Boss Records</h1>
        <p className="ms-hero-sub mt-3">Kill counts reset with the server&apos;s daily and weekly cycles</p>
      </div>

      {/* Reset countdowns */}
      <div className="ms-pixel-panel mb-10 p-4 sm:p-5">
        <div
          className="flex flex-col sm:flex-row gap-4 sm:gap-10"
          style={{ fontFamily: 'var(--ms-font-b)', fontSize: '20px' }}
        >
          <div className="flex items-center gap-3">
            <span className="ms-pill">Daily</span>
            <BossTimer period="daily" />
          </div>
          <div className="flex items-center gap-3">
            <span className="ms-pill">Weekly</span>
            <BossTimer period="weekly" />
          </div>
        </div>
      </div>

      {(['daily', 'weekly'] as const).map((period) => {
        const stats = period === 'daily' ? daily : weekly
        return (
          <section key={period} className="mb-12">
            <SectionBanner>{period === 'daily' ? 'Daily' : 'Weekly'}</SectionBanner>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {BOSS_ORDER.map((bossKey) => {
                const info = BOSS_LABELS[bossKey]
                const data = stats[bossKey]
                return (
                  <div key={bossKey} className="ms-boss-card">
                    <span className="ms-boss-label">{info.label}</span>

                    {/* Boss header */}
                    <div className="flex items-center justify-center gap-2.5 mb-4 mt-2">
                      {info.sprite ? (
                        <Sprite src={info.sprite} alt={info.label} height={32} anim="bob" grounded={false} />
                      ) : (
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: info.accent }} />
                      )}
                      <span
                        style={{
                          fontFamily: 'var(--ms-font-d)',
                          fontSize: '11px',
                          color: '#f8c34a',
                          letterSpacing: '1px',
                        }}
                      >
                        {info.label}
                      </span>
                    </div>

                    {/* Total kills */}
                    <div className="mb-4">
                      <span
                        className="ms-pill"
                        style={{
                          background: `${info.accent}22`,
                          color: info.accent,
                          borderColor: info.accent,
                        }}
                      >
                        {data?.total ?? 0} kills
                      </span>
                    </div>

                    {/* Top killers */}
                    <div className="flex flex-col gap-1.5" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px' }}>
                      {data && data.top.length > 0 ? (
                        data.top.map((entry, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-2 px-2 py-1.5"
                            style={{
                              backgroundColor:
                                i < 3 ? `${info.accent}18` : 'rgba(255,255,255,0.06)',
                              border: '2px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                style={{
                                  fontFamily: 'var(--ms-font-d)',
                                  fontSize: '9px',
                                  color: i < 3 ? info.accent : '#9c8fa6',
                                  width: '20px',
                                  textAlign: 'right',
                                  flexShrink: 0,
                                }}
                              >
                                {i + 1}
                              </span>
                              <Link
                                href={`/character/${encodeURIComponent(entry.characterName)}`}
                                className="truncate hover:underline"
                                style={{ color: '#fff8d8' }}
                              >
                                {entry.characterName}
                              </Link>
                            </div>
                            <span
                              style={{
                                fontFamily: 'var(--ms-font-d)',
                                fontSize: '9px',
                                color: '#9c8fa6',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                              }}
                            >
                              x{entry.kills}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p
                          className="text-center py-3"
                          style={{
                            color: '#9c8fa6',
                            fontFamily: 'var(--ms-font-b)',
                            fontSize: '18px',
                          }}
                        >
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
