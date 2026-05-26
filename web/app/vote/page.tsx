import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import Sprite from '@/components/maple/Sprite'
import type { Metadata } from 'next'

// Per-player vote links embed the account name, so this must render per-request.
export const dynamic = 'force-dynamic'

// TopG passes whatever follows "server-682556-" back to our postback as p_resp,
// so we append the signed-in account name to credit the right player.
const TOPG_BASE = 'https://topg.org/maplestory-private-servers/server-682556'
const GTOP100_BASE = 'https://gtop100.com/MapleStory/server-106072'

export const metadata: Metadata = {
  title: 'Vote & Earn NX',
  description: 'Vote for ShinyMS on MapleStory private server lists and earn free NX Cash rewards every day.',
  alternates: { canonical: 'https://shinyms.com/vote' },
  openGraph: { url: 'https://shinyms.com/vote', title: 'Vote for ShinyMS — Earn Free NX', description: 'Vote daily and earn free NX Cash on ShinyMS.' },
}

async function getTopVoters() {
  return prisma.account.findMany({
    where: { votepoints: { gt: 0 }, webadmin: 0 },
    orderBy: { votepoints: 'desc' },
    take: 10,
    select: { name: true, votepoints: true },
  }).catch(() => [])
}

export default async function VotePage() {
  const [topVoters, session] = await Promise.all([getTopVoters(), getServerSession(authOptions)])
  const username = session?.user?.name ?? null

  const sites = [
    {
      name: 'Gtop100',
      // ?vote=1&pingUsername=<name> → Gtop100 returns it as pb_name in the pingback.
      url: username
        ? `${GTOP100_BASE}?vote=1&pingUsername=${encodeURIComponent(username)}`
        : GTOP100_BASE,
      desc: 'Vote every 12 hours',
      reward: '+1 Vote Point per vote',
    },
    {
      name: 'TopG',
      // Append the account name so TopG returns it to our postback (p_resp).
      url: username ? `${TOPG_BASE}-${encodeURIComponent(username)}#vote` : `${TOPG_BASE}#vote`,
      desc: 'Vote every 24 hours',
      reward: '+1 Vote Point per vote',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8 flex items-center gap-3">
        <Sprite src="/maple/npcs/heena.gif" alt="" height={58} anim="bob" grounded={false} className="hidden sm:block shrink-0" />
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>
            Vote for ShinyMS
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
            Voting helps grow our community and earns you in-game rewards.
          </p>
        </div>
      </div>

      {username ? (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Voting as <strong>{username}</strong> — Vote Points are credited to your account automatically.
        </div>
      ) : (
        <div
          className="mb-6 rounded-xl px-4 py-3 text-sm flex flex-wrap items-center gap-x-2 gap-y-1"
          style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-foreground)', border: '1px solid var(--accent)' }}
        >
          <span><strong>Sign in before voting</strong> so your Vote Points are credited to your account.</span>
          <Link href="/login" className="font-semibold underline">Sign in →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vote sites */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {sites.map(site => {
            const cardClass = 'flex items-center justify-between rounded-xl p-5 hover-card'
            const cardStyle = {
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 4px rgba(28,21,39,0.05)',
              textDecoration: 'none',
            }
            const inner = (
              <>
                <div>
                  <div className="text-base font-bold mb-0.5" style={{ color: 'var(--foreground)' }}>{site.name}</div>
                  <div className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>{site.desc}</div>
                  <div
                    className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {site.reward}
                  </div>
                </div>
                <div
                  className="ml-4 shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150"
                  style={{ backgroundColor: username ? 'var(--primary)' : 'var(--accent)', color: '#fff' }}
                >
                  {username ? 'Vote' : 'Sign in to Vote'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                </div>
              </>
            )
            // Logged out: send to login (with return to /vote) so the vote link
            // can carry the account name — otherwise the vote can't be credited.
            return username ? (
              <a key={site.name} href={site.url} target="_blank" rel="noopener noreferrer" className={cardClass} style={cardStyle}>
                {inner}
              </a>
            ) : (
              <Link key={site.name} href="/login?callbackUrl=%2Fvote" className={cardClass} style={cardStyle}>
                {inner}
              </Link>
            )
          })}
        </div>

        {/* Rewards info */}
        <div className="flex flex-col gap-4">
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,21,39,0.05)' }}
          >
            <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>How Voting Works</h3>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {[
                'Click a vote site above',
                'Complete the captcha on the site',
                'Vote Points are credited automatically',
                'Redeem points in-game via the NPC',
              ].map((step, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div
                    className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ color: 'var(--foreground-muted)' }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent)' }}
          >
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--accent-foreground)' }}>Earn up to 2 Vote Points per day</p>
            <p className="text-xs" style={{ color: 'var(--accent-foreground)', opacity: 0.75 }}>
              Vote on both sites daily for maximum rewards. Points never expire.
            </p>
          </div>

          {/* Top voters */}
          {topVoters.length > 0 && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,21,39,0.05)' }}
            >
              <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Top Voters</h3>
              </div>
              <div className="p-3 flex flex-col gap-1">
                {topVoters.map((voter, i) => (
                  <div key={voter.name} className="flex items-center justify-between px-2 py-1.5 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-right text-xs font-bold shrink-0" style={{ color: i < 3 ? 'var(--accent-foreground)' : 'var(--foreground-subtle)' }}>
                        {i + 1}
                      </span>
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>{voter.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold" style={{ color: 'var(--primary)' }}>
                      {voter.votepoints} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
