import { prisma } from '@/lib/prisma'
import { getJobName, getJobClass, jobClassColors } from '@/lib/jobs'
import { EQUIP_SLOT_NAMES, SLOT_ORDER } from '@/lib/equip-slots'
import { getItemName } from '@/lib/equip-names'
import { notFound } from 'next/navigation'
import { safeDecode } from '@/lib/url'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params
  const decoded = safeDecode(name)
  if (decoded === null) return { title: 'Character Not Found' }
  return {
    title: `${decoded}'s Character`,
    description: `View ${decoded}'s character profile on ShinyMS — stats, equipment, and ranking.`,
    alternates: { canonical: `https://shinyms.com/character/${encodeURIComponent(decoded)}` },
    openGraph: { url: `https://shinyms.com/character/${encodeURIComponent(decoded)}`, title: `${decoded} | ShinyMS Character`, description: `${decoded}'s stats and equipment on ShinyMS MapleStory v83.` },
  }
}

type EquipStats = {
  upgradeslots: number
  str: number
  dex: number
  intStat: number
  luk: number
  hp: number
  mp: number
  watk: number
  matk: number
  wdef: number
  mdef: number
  acc: number
  avoid: number
  speed: number
  jump: number
}

type EquippedItem = {
  itemid: number
  position: number
  equipment: EquipStats | null
}

type StatKey = keyof Pick<EquipStats, 'watk' | 'matk' | 'str' | 'dex' | 'intStat' | 'luk' | 'wdef' | 'hp' | 'mp' | 'speed' | 'jump'>
const STAT_LABELS: [StatKey, string][] = [
  ['watk', 'ATK'], ['matk', 'MATK'], ['str', 'STR'], ['dex', 'DEX'],
  ['intStat', 'INT'], ['luk', 'LUK'], ['wdef', 'DEF'], ['hp', 'HP'],
  ['mp', 'MP'], ['speed', 'SPD'], ['jump', 'JMP'],
]

function getPrimaryStats(e: EquipStats): string {
  return STAT_LABELS
    .filter(([key]) => e[key] > 0)
    .slice(0, 3)
    .map(([key, label]) => `+${e[key]} ${label}`)
    .join(' · ') || '—'
}

function EquipSlotCard({ slot, item }: { slot: number; item: EquippedItem | undefined }) {
  const slotName = EQUIP_SLOT_NAMES[slot] ?? 'Unknown'
  const hasItem = !!item

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-1"
      style={{
        backgroundColor: hasItem ? 'var(--surface)' : 'var(--surface-subtle)',
        border: `1px solid ${hasItem ? 'var(--border)' : 'var(--border-subtle)'}`,
        opacity: hasItem ? 1 : 0.6,
        minHeight: '80px',
      }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: 'var(--foreground-subtle)' }}
      >
        {slotName}
      </div>

      {hasItem && item ? (
        <>
          <div className="text-xs font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>
            {getItemName(item.itemid)}
          </div>
          {item.equipment && (
            <>
              <div className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                {getPrimaryStats(item.equipment)}
              </div>
              {item.equipment.upgradeslots > 0 && (
                <div className="text-xs mt-auto" style={{ color: 'var(--foreground-subtle)', opacity: 0.7 }}>
                  {item.equipment.upgradeslots} slots
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <div className="text-xs italic" style={{ color: 'var(--foreground-subtle)' }}>
          Empty
        </div>
      )}
    </div>
  )
}

export default async function CharacterPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const decodedName = safeDecode(name)
  if (decodedName === null) return notFound()

  const char = await prisma.character.findFirst({
    where: { name: decodedName, gm: 0 },
    select: {
      id: true, name: true, level: true, job: true, rank: true,
      guildid: true, world: true, fame: true,
      str: true, dex: true, intStat: true, luk: true,
      maxhp: true, maxmp: true,
      inventoryItems: {
        where: { inventorytype: 1, position: { lt: 0 } },
        select: {
          itemid: true, position: true,
          equipment: {
            select: {
              upgradeslots: true,
              str: true, dex: true, intStat: true, luk: true,
              hp: true, mp: true, watk: true, matk: true,
              wdef: true, mdef: true, acc: true, avoid: true,
              speed: true, jump: true,
            },
          },
        },
      },
    },
  }).catch(() => null)

  if (!char) return notFound()

  const guild = char.guildid > 0
    ? await prisma.guild.findUnique({ where: { guildid: char.guildid }, select: { name: true } }).catch(() => null)
    : null

  const equippedBySlot = new Map<number, EquippedItem>(
    char.inventoryItems.map(item => [item.position, item])
  )

  const zero = { str: 0, dex: 0, int: 0, luk: 0, hp: 0, mp: 0, watk: 0, matk: 0, wdef: 0, mdef: 0 }
  const gear = char.inventoryItems.reduce((acc, item) => {
    if (!item.equipment) return acc
    const e = item.equipment
    return {
      str:  acc.str  + e.str,
      dex:  acc.dex  + e.dex,
      int:  acc.int  + e.intStat,
      luk:  acc.luk  + e.luk,
      hp:   acc.hp   + e.hp,
      mp:   acc.mp   + e.mp,
      watk: acc.watk + e.watk,
      matk: acc.matk + e.matk,
      wdef: acc.wdef + e.wdef,
      mdef: acc.mdef + e.mdef,
    }
  }, zero)

  const jobClass = getJobClass(char.job)
  const jobColor = jobClassColors[jobClass]

  const statRows = [
    { label: 'STR', base: char.str,    bonus: gear.str  },
    { label: 'DEX', base: char.dex,    bonus: gear.dex  },
    { label: 'INT', base: char.intStat, bonus: gear.int },
    { label: 'LUK', base: char.luk,    bonus: gear.luk  },
  ]
  const combatRows = [
    { label: 'HP',   value: char.maxhp + gear.hp },
    { label: 'MP',   value: char.maxmp + gear.mp },
    { label: 'ATK',  value: gear.watk },
    { label: 'MATK', value: gear.matk },
    { label: 'DEF',  value: gear.wdef },
    { label: 'MDEF', value: gear.mdef },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--foreground-subtle)' }}>
        <Link href="/rankings" className="hover:underline" style={{ color: 'var(--primary)' }}>Rankings</Link>
        <span>/</span>
        <span>{char.name}</span>
      </div>

      {/* Header card */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(28,21,39,0.08)' }}
      >
        <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--navy) 0%, var(--primary) 100%)' }} />
        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0"
            style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
          >
            {char.name.charAt(0).toUpperCase()}
          </div>

          {/* Name + job */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{char.name}</h1>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${jobColor}`}>
                {getJobName(char.job)}
              </span>
              {char.rank > 0 && char.rank <= 10 && (
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-foreground)', border: '1px solid var(--accent)' }}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  Top 10
                </span>
              )}
            </div>
            <div className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>
              {guild ? `${guild.name} · ` : ''}World {char.world}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 sm:gap-6 shrink-0">
            {[
              { label: 'Level', value: String(char.level) },
              { label: 'Rank',  value: char.rank > 0 ? `#${char.rank}` : 'Unranked' },
              { label: 'Fame',  value: String(char.fame) },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--foreground-subtle)' }}>{label}</div>
                <div className="font-mono font-bold text-base" style={{ color: 'var(--foreground)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Equipment grid */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--foreground-subtle)' }}>
            Equipment
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SLOT_ORDER.map(slot => (
              <EquipSlotCard key={slot} slot={slot} item={equippedBySlot.get(slot)} />
            ))}
            {/* pad to complete the row if needed */}
            {SLOT_ORDER.length % 4 !== 0 && Array.from({ length: 4 - (SLOT_ORDER.length % 4) }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
          </div>
        </div>

        {/* Stats panel */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--foreground-subtle)' }}>
            Stats
          </h2>

          {/* Core stats */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr>
                {['', 'Base', '+Gear', 'Total'].map(h => (
                  <th key={h} className="text-right first:text-left pb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--foreground-subtle)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statRows.map(({ label, base, bonus }) => (
                <tr key={label} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td className="py-1.5 font-semibold text-xs" style={{ color: 'var(--foreground)' }}>{label}</td>
                  <td className="py-1.5 text-right font-mono text-xs" style={{ color: 'var(--foreground-subtle)' }}>{base}</td>
                  <td className="py-1.5 text-right font-mono text-xs" style={{ color: bonus > 0 ? 'var(--success, #16a34a)' : 'var(--foreground-subtle)' }}>
                    {bonus > 0 ? `+${bonus}` : '—'}
                  </td>
                  <td className="py-1.5 text-right font-mono font-bold text-xs" style={{ color: 'var(--foreground)' }}>
                    {base + bonus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Combat stats */}
          <div
            className="rounded-xl p-3 grid grid-cols-2 gap-x-3 gap-y-1.5"
            style={{ backgroundColor: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)' }}
          >
            {combatRows.map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--foreground-subtle)' }}>{label}</span>
                <span className="font-mono font-bold text-xs" style={{ color: 'var(--foreground)' }}>
                  {value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
