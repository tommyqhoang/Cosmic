import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import Sprite from '@/components/maple/Sprite'
import { getJobName, getJobClass } from '@/lib/jobs'
import {
  recentSmegas, recentWeddings, recentFame, topFamedThisWeek,
  type Wedding, type FameEvent, type FamedPlayer,
} from '@/lib/community'
import SectionBanner from '@/components/maple/SectionBanner'
import CharAvatar, { charForJob } from '@/components/maple/CharAvatar'
import LiveSmegaFeed from '@/components/maple/LiveSmegaFeed'
import { getSocialLinks } from '@/lib/settings'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Community — Megaphones, Weddings & Fame',
  description: 'The living pulse of ShinyMS: the latest in-game super megaphones, freshly married couples, and the most-famed players this week.',
  alternates: { canonical: 'https://shinyms.com/community' },
  openGraph: { url: 'https://shinyms.com/community', title: 'Community | ShinyMS', description: 'Latest megaphones, weddings, and fame on ShinyMS.' },
}

function timeAgo(date: Date | string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`
}

function CharLink({ name }: { name: string }) {
  return (
    <Link href={`/character/${encodeURIComponent(name)}`} style={{ color: '#c64b1b', fontFamily: 'var(--ms-font-d)', fontSize: 10, letterSpacing: 0.5, textDecoration: 'underline dotted' }}>
      {name}
    </Link>
  )
}

function JobPill({ job }: { job: number }) {
  return (
    <span style={{
      fontFamily: 'var(--ms-font-b)', fontSize: 14, letterSpacing: 0.5,
      background: 'var(--ms-slot-bg)', border: '2px solid var(--ms-slot-shadow)',
      color: 'var(--ms-text)', padding: '2px 6px', display: 'inline-flex', alignItems: 'center',
    }}>
      {getJobName(job)}
    </span>
  )
}

function PixelPanel({ children, heading }: { children: ReactNode; heading?: string }) {
  return (
    <div className="ms-pixel-panel">
      {heading && (
        <div style={{
          background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 50%, #3a2418 100%)',
          color: '#ffd96b',
          fontFamily: 'var(--ms-font-d)',
          fontSize: 11,
          letterSpacing: 1,
          padding: '10px 14px',
          textShadow: '2px 2px 0 #1a0a04',
          borderBottom: '3px solid var(--ms-panel-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {heading}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  )
}

// ── Weddings ──
function Weddings({ weddings }: { weddings: Wedding[] }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="ms-section-title" style={{ fontSize: 'clamp(12px, 2vw, 18px)', margin: 0 }}>Recent Weddings</h2>
        <p className="ms-muted" style={{ fontSize: 18 }}>Congratulations to the server&apos;s newest couples</p>
      </div>
      <PixelPanel>
        {weddings.length === 0 ? (
          <p className="text-center py-8" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: '#4a3220' }}>
            No weddings yet — be the first to tie the knot!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {weddings.map((w) => (
              <div key={w.marriageid} className="flex items-center gap-3">
                <CharAvatar cls={charForJob(getJobClass(w.husbandJob))} size={40} showLabel={false} label={w.husband} />
                <div className="min-w-0 flex-1 text-center">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <CharLink name={w.husband} />
                    <span style={{ color: '#e0457b' }} aria-hidden>❤</span>
                    <CharLink name={w.wife} />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5 flex-wrap">
                    <JobPill job={w.husbandJob} />
                    <JobPill job={w.wifeJob} />
                  </div>
                </div>
                <CharAvatar cls={charForJob(getJobClass(w.wifeJob))} size={40} showLabel={false} label={w.wife} />
              </div>
            ))}
          </div>
        )}
      </PixelPanel>
    </div>
  )
}

// ── Fame this week ──
function FameThisWeek({ famed }: { famed: FamedPlayer[] }) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="ms-section-title" style={{ fontSize: 'clamp(12px, 2vw, 18px)', margin: 0 }}>Most Famed This Week</h2>
        <p className="ms-muted" style={{ fontSize: 18 }}>Players who earned the most fame in the last 7 days</p>
      </div>
      <PixelPanel>
        {famed.length === 0 ? (
          <p className="text-center py-8" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: '#4a3220' }}>
            No fame given this week yet.
          </p>
        ) : (
          <div className="flex flex-col">
            {famed.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 px-3 py-2" style={{
                borderTop: i === 0 ? 'none' : '2px dashed var(--ms-slot-shadow)',
                backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.03)',
              }}>
                <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#4a3220', width: 20, flexShrink: 0 }}>{i + 1}</span>
                <CharAvatar cls={charForJob(getJobClass(p.job))} size={24} showLabel={false} />
                <div className="min-w-0 flex-1"><CharLink name={p.name} /></div>
                <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#c64b1b' }}>+{p.fameCount}</span>
              </div>
            ))}
          </div>
        )}
      </PixelPanel>
    </div>
  )
}

// ── Recent fame activity ──
function RecentFame({ events }: { events: FameEvent[] }) {
  if (events.length === 0) return null
  return (
    <div className="mt-8">
      <div className="mb-3">
        <h2 className="ms-section-title" style={{ fontSize: 'clamp(12px, 2vw, 18px)', margin: 0 }}>Fame Activity</h2>
        <p className="ms-muted" style={{ fontSize: 18 }}>The latest fame handed out around the world</p>
      </div>
      <PixelPanel>
        <div className="flex flex-col">
          {events.map((e, i) => (
            <div key={`${e.fromName}-${e.toName}-${+new Date(e.at)}-${i}`} className="flex items-center gap-2 px-3 py-2" style={{
              borderTop: i === 0 ? 'none' : '2px dashed var(--ms-slot-shadow)',
            }}>
              <span aria-hidden>⭐</span>
              <span className="min-w-0 flex-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#4a3220' }}>
                <CharLink name={e.fromName} /> famed <CharLink name={e.toName} /> <JobPill job={e.toJob} />
              </span>
              <span className="shrink-0" style={{ fontFamily: 'var(--ms-font-d)', fontSize: 8, color: '#8a6f3c' }}>
                {timeAgo(e.at)}
              </span>
            </div>
          ))}
        </div>
      </PixelPanel>
    </div>
  )
}

export default async function CommunityPage() {
  const [smegas, weddings, famedWeek, fameEvents, social] = await Promise.all([
    recentSmegas(30),
    recentWeddings(8),
    topFamedThisWeek(8),
    recentFame(12),
    getSocialLinks(),
  ])

  const discordUrl = social.discord || 'https://discord.gg/jKueJFAErs'

  return (
    <div className="relative overflow-hidden">
      {/* Floating sprites */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <div className="absolute hidden sm:block" style={{ top: 24, left: '6%' }}>
          <Sprite src="/maple/mobs/orange-mushroom.gif" alt="" height={56} anim="bob" grounded={false} delay={0} />
        </div>
        <div className="absolute hidden md:block" style={{ top: 60, right: '8%' }}>
          <Sprite src="/maple/mobs/pig.gif" alt="" height={48} anim="bob" grounded={false} delay={400} />
        </div>
        <div className="absolute hidden lg:block" style={{ top: 140, left: '12%' }}>
          <Sprite src="/maple/mobs/slime.gif" alt="" height={40} anim="hop" grounded={false} delay={800} />
        </div>
        <div className="absolute hidden sm:block" style={{ top: 100, right: '18%' }}>
          <Sprite src="/maple/mobs/blue-snail.gif" alt="" height={36} anim="sway" grounded={false} delay={1200} />
        </div>
        <span className="ms-sparkle" style={{ top: 80, left: '40%', fontSize: 18 }}>✦</span>
        <span className="ms-sparkle" style={{ top: 160, right: '25%', fontSize: 14, animationDelay: '0.8s' }}>✦</span>
      </div>

      {/* Main content */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14" style={{ zIndex: 2 }}>
        {/* Hero */}
        <div className="text-center mb-10 sm:mb-14">
          <div className="flex justify-center mb-4">
            <SectionBanner>COMMUNITY · LIVE FEED</SectionBanner>
          </div>
          <h1 className="ms-hero-title" style={{ fontSize: 'clamp(22px, 3.6vw, 38px)' }}>
            What&apos;s happening<br className="hidden sm:block" /> in Maple World
          </h1>
          <div className="mt-4 mb-6 flex justify-center">
            <span className="ms-hero-sub" style={{ fontSize: 'clamp(14px, 2vw, 22px)' }}>
              The latest megaphones, weddings, and fame — live from the server.
            </span>
          </div>

          {/* Smega Ticker */}
          <div className="max-w-3xl mx-auto">
            <LiveSmegaFeed smegas={smegas} />
          </div>

          {/* CTA */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="ms-btn">💬 JOIN DISCORD</a>
            <Link href="/news" className="ms-btn">📰 SEE LATEST NEWS</Link>
            <span className="ms-muted hidden sm:inline" style={{ fontSize: 18 }}>
              Not playing yet? <Link href="/register" style={{ color: '#c64b1b', fontWeight: 700, textDecoration: 'underline dotted' }}>Make an account →</Link>
            </span>
          </div>
        </div>

        {/* Grid: Weddings + Fame */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          <Weddings weddings={weddings} />
          <div>
            <FameThisWeek famed={famedWeek} />
            <RecentFame events={fameEvents} />
          </div>
        </div>
      </div>
    </div>
  )
}
