import type { Metadata } from 'next'
import Link from 'next/link'
import Sprite from '@/components/maple/Sprite'
import { itemIcon } from '@/lib/maplestory'
import { getJobName, getJobClass, jobClassColors } from '@/lib/jobs'
import {
  recentSmegas, recentWeddings, recentFame, topFamedThisWeek,
  type Smega, type Wedding, type FameEvent, type FamedPlayer,
} from '@/lib/community'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Community — Megaphones, Weddings & Fame',
  description: 'The living pulse of ShinyMS: the latest in-game super megaphones, freshly married couples, and the most-famed players this week.',
  alternates: { canonical: 'https://shinyms.com/community' },
  openGraph: { url: 'https://shinyms.com/community', title: 'Community | ShinyMS', description: 'Latest megaphones, weddings, and fame on ShinyMS.' },
}

function timeAgo(date: Date): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`
}

const SMEGA_LABEL: Record<string, string> = { super: 'Super', item: 'Item', triple: 'Triple' }

function CharLink({ name }: { name: string }) {
  return (
    <Link href={`/character/${encodeURIComponent(name)}`} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
      {name}
    </Link>
  )
}

function JobPill({ job }: { job: number }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${jobClassColors[getJobClass(job)]}`}>{getJobName(job)}</span>
}

function Initial({ name, tone }: { name: string; tone: 'his' | 'hers' }) {
  const bg = tone === 'hers' ? '#fce4ec' : 'var(--primary-subtle)'
  const fg = tone === 'hers' ? '#c2185b' : 'var(--primary)'
  return (
    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold shrink-0" style={{ backgroundColor: bg, color: fg }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function SectionHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-4">
      <h2 className="font-display font-bold text-xl" style={{ color: 'var(--foreground)', letterSpacing: '0.03em' }}>{title}</h2>
      <p className="text-sm mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>{subtitle}</p>
    </div>
  )
}

// ── Megaphone feed (#1) ──
function SmegaBanner({ s }: { s: Smega }) {
  return (
    <div className="smega-band rounded-xl px-4 py-3 flex items-center gap-3" style={{ border: '1px solid rgba(0,0,0,0.12)' }}>
      <span className="shrink-0 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff' }}>
        {SMEGA_LABEL[s.type] ?? s.type}
      </span>
      <div className="min-w-0 flex-1">
        <span className="font-bold text-sm" style={{ color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.3)' }}>{s.player}</span>
        <span className="text-sm" style={{ color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.3)' }}> : {s.message}</span>
      </div>
      {s.itemId != null && (
        <span className="shrink-0 inline-flex items-center justify-center rounded-lg" style={{ width: 34, height: 34, backgroundColor: 'rgba(255,255,255,0.85)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={itemIcon(s.itemId)} alt="" className="sprite" style={{ maxHeight: 26, width: 'auto' }} />
        </span>
      )}
      <span className="shrink-0 text-xs font-medium tabular-nums" style={{ color: 'rgba(255,255,255,0.8)' }}>
        ch{s.channel} · {timeAgo(s.createdAt)}
      </span>
    </div>
  )
}

function SmegaFeed({ smegas }: { smegas: Smega[] }) {
  return (
    <section className="mb-12">
      <SectionHead title="Megaphone Feed" subtitle="Every super, item & triple megaphone fired across the world — live." />
      {smegas.length === 0 ? (
        <div className="rounded-2xl text-center py-14 px-6" style={{ border: '1px dashed var(--border-strong)', backgroundColor: 'var(--surface-subtle)' }}>
          <div className="text-3xl mb-2" aria-hidden>📢</div>
          <p className="font-display text-lg" style={{ color: 'var(--foreground)' }}>The feed is quiet… for now</p>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>Fire a Super Megaphone in-game and it&apos;ll show up here instantly.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {smegas.map((s) => <SmegaBanner key={s.id} s={s} />)}
        </div>
      )}
    </section>
  )
}

// ── Weddings (#5) ──
function Weddings({ weddings }: { weddings: Wedding[] }) {
  return (
    <section>
      <SectionHead title="Recent Weddings" subtitle="Congratulations to the server's newest couples 💍" />
      {weddings.length === 0 ? (
        <p className="text-sm rounded-2xl py-10 text-center" style={{ color: 'var(--foreground-subtle)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>No weddings yet — be the first to tie the knot!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {weddings.map((w) => (
            <div key={w.marriageid} className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 6px rgba(28,21,39,0.05)' }}>
              <Initial name={w.husband} tone="his" />
              <div className="min-w-0 flex-1 text-center">
                <div className="flex items-center justify-center gap-2 text-sm flex-wrap">
                  <CharLink name={w.husband} />
                  <span style={{ color: '#e0457b' }} aria-hidden>❤</span>
                  <CharLink name={w.wife} />
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <JobPill job={w.husbandJob} />
                  <JobPill job={w.wifeJob} />
                </div>
              </div>
              <Initial name={w.wife} tone="hers" />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Fame (#5) ──
function FameThisWeek({ famed }: { famed: FamedPlayer[] }) {
  return (
    <div>
      <SectionHead title="Most Famed This Week" subtitle="Players who earned the most fame in the last 7 days" />
      {famed.length === 0 ? (
        <p className="text-sm rounded-2xl py-8 text-center" style={{ color: 'var(--foreground-subtle)', border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>No fame given this week yet.</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}>
          {famed.map((p, i) => (
            <div key={p.name} className="flex items-center gap-3 px-4 py-2.5" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', backgroundColor: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-raised)' }}>
              <span className="font-mono text-sm w-5 shrink-0" style={{ color: 'var(--foreground-subtle)' }}>{i + 1}</span>
              <div className="min-w-0 flex-1"><CharLink name={p.name} /></div>
              <JobPill job={p.job} />
              <span className="font-mono font-bold text-sm shrink-0" style={{ color: 'var(--accent-foreground)' }}>+{p.fameCount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RecentFame({ events }: { events: FameEvent[] }) {
  if (events.length === 0) return null
  return (
    <div className="mt-8">
      <SectionHead title="Fame Activity" subtitle="The latest fame handed out around the world" />
      <ul className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}>
        {events.map((e, i) => (
          <li key={`${e.fromName}-${e.toName}-${+new Date(e.at)}-${i}`} className="flex items-center gap-2 px-4 py-2.5 text-sm" style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)' }}>
            <span aria-hidden>⭐</span>
            <span className="min-w-0 flex-1" style={{ color: 'var(--foreground-muted)' }}>
              <CharLink name={e.fromName} /> famed <CharLink name={e.toName} /> <JobPill job={e.toJob} />
            </span>
            <span className="shrink-0 text-xs" style={{ color: 'var(--foreground-subtle)' }}>{timeAgo(e.at)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function CommunityPage() {
  const [smegas, weddings, famedWeek, fameEvents] = await Promise.all([
    recentSmegas(30),
    recentWeddings(8),
    topFamedThisWeek(8),
    recentFame(12),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Sprite src="/maple/npcs/dances-with-balrog.gif" alt="" height={58} anim="sway" grounded={false} className="hidden sm:block shrink-0" />
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>Community</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>The living pulse of ShinyMS — megaphones, weddings, and fame.</p>
        </div>
      </div>

      <SmegaFeed smegas={smegas} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <Weddings weddings={weddings} />
        <div>
          <FameThisWeek famed={famedWeek} />
          <RecentFame events={fameEvents} />
        </div>
      </div>
    </div>
  )
}
