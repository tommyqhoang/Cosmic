import { prisma } from '@/lib/prisma'
import { getJobName, getJobClass, jobClassColors } from '@/lib/jobs'
import { notFound } from 'next/navigation'
import { safeDecode } from '@/lib/url'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 120

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params
  const decoded = safeDecode(name)
  if (decoded === null) return { title: 'Guild Not Found', robots: { index: false } }
  const guild = await prisma.guild
    .findFirst({ where: { name: decoded }, select: { name: true } })
    .catch(() => null)
  if (!guild) return { title: 'Guild Not Found', robots: { index: false } }

  const url = `https://shinyms.com/guilds/${encodeURIComponent(guild.name)}`
  return {
    title: `${guild.name} — Guild`,
    description: `View members, ranks, and details for the ${guild.name} guild on ShinyMS, a free MapleStory v83 private server.`,
    alternates: { canonical: url },
    openGraph: {
      url,
      title: `${guild.name} | ShinyMS Guilds`,
      description: `Members and ranks for the ${guild.name} guild on ShinyMS.`,
    },
  }
}

export default async function GuildPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  const decodedName = safeDecode(name)
  if (decodedName === null) return notFound()
  const guild = await prisma.guild.findFirst({
    where: { name: decodedName },
  }).catch(() => null)
  if (!guild) return notFound()

  const members = await prisma.character.findMany({
    where: { guildid: guild.guildid, gm: 0 },
    orderBy: [{ guildrank: 'asc' }, { level: 'desc' }],
    select: { id: true, name: true, level: true, job: true, rank: true, guildrank: true },
  }).catch(() => [])

  const RANK_LABELS = ['', guild.name, 'Jr. Master', 'Member', 'Member', 'Member']

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--foreground-subtle)' }}>
        <Link href="/guilds" className="hover:underline" style={{ color: 'var(--primary)' }}>Guilds</Link>
        <span>/</span>
        <span>{guild.name}</span>
      </div>

      {/* Guild header */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 24px rgba(28,21,39,0.08)' }}
      >
        <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--navy) 0%, var(--primary) 100%)' }} />
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0"
              style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
            >
              {guild.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold mb-0.5" style={{ color: 'var(--foreground)' }}>{guild.name}</h1>
              {guild.notice && (
                <p className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>{guild.notice}</p>
              )}
            </div>
            <div className="flex gap-6 shrink-0">
              {[
                { label: 'GP', value: guild.GP.toLocaleString() },
                { label: 'Members', value: `${members.length}/${guild.capacity}` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <div className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--foreground-subtle)' }}>{label}</div>
                  <div className="font-mono font-bold text-base" style={{ color: 'var(--foreground)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Members table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}
      >
        <table className="w-full text-sm" style={{ backgroundColor: 'var(--surface)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--navy)' }}>
              {['Character', 'Level', 'Class', 'Guild Rank'].map((h, i) => (
                <th
                  key={h}
                  className={`px-4 py-3.5 text-xs font-semibold uppercase tracking-wider ${i >= 2 ? 'text-left hidden sm:table-cell' : 'text-left'}`}
                  style={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => {
              const jobClass = getJobClass(m.job)
              const color = jobClassColors[jobClass]
              return (
                <tr
                  key={m.id}
                  style={{
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    backgroundColor: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-raised)',
                  }}
                >
                  <td className="px-4 py-3">
                    <Link href={`/character/${encodeURIComponent(m.name)}`} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                      {m.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold" style={{ color: 'var(--foreground)' }}>{m.level}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color}`}>{getJobName(m.job)}</span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                    {RANK_LABELS[m.guildrank] ?? 'Member'}
                  </td>
                </tr>
              )
            })}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-12 text-sm" style={{ color: 'var(--foreground-subtle)' }}>No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
