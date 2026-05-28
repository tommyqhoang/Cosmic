import type { Metadata } from 'next'
import Link from 'next/link'
import NpcBox from '@/components/maple/NpcBox'
import SectionBanner from '@/components/maple/SectionBanner'
import StatBar from '@/components/maple/StatBar'
import StatusBoard from '@/components/status/StatusBoard'
import { getSocialLinks } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Server Status',
  description:
    'Live ShinyMS server status — see whether the game is online, how many players are in-game, and the state of each world and channel.',
  alternates: { canonical: 'https://shinyms.com/status' },
  openGraph: {
    url: 'https://shinyms.com/status',
    title: 'Server Status | ShinyMS',
    description: 'Is ShinyMS online? Live worlds, channels, and player count.',
  },
}

export default async function StatusPage() {
  const social = await getSocialLinks()
  const discordUrl = social.discord || 'https://discord.gg/jKueJFAErs'
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
      {/* Floating sprite decorations */}
      <img
        src="/maple/mobs/green-mushroom.gif"
        alt=""
        className="sprite sprite-hop absolute -left-4 top-32 hidden lg:block"
        width={48}
        height={48}
        aria-hidden
      />
      <img
        src="/maple/mobs/slime.gif"
        alt=""
        className="sprite sprite-bob absolute -right-4 top-60 hidden lg:block"
        width={48}
        height={48}
        aria-hidden
      />
      <img
        src="/maple/mobs/blue-mushroom.gif"
        alt=""
        className="sprite sprite-sway absolute left-8 bottom-20 hidden lg:block"
        width={48}
        height={48}
        aria-hidden
      />

      {/* Hero */}
      <div className="mb-8 text-center sm:text-left">
        <SectionBanner>Server Status</SectionBanner>
        <h1 className="ms-hero-title">Live Check</h1>
        <p className="ms-hero-sub mt-3">Live status of the ShinyMS game server, worlds, and channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
        {/* Live board */}
        <NpcBox title="Live Server Status">
          <div style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18 }}>
            <StatusBoard />
          </div>
        </NpcBox>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5">
          {/* Play CTA */}
          <div className="ms-pixel-panel p-0">
            <div
              className="px-4 py-3"
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 11,
                letterSpacing: 1,
                color: '#ffd96b',
                background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)',
                borderBottom: '3px solid var(--ms-npc-border-out)',
              }}
            >
              🍁 Ready to play?
            </div>
            <div className="p-4" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: 'var(--ms-text)' }}>
              <p className="mb-4">Jump straight in from your browser, or grab the desktop client — no download required to start.</p>
              <a
                href="https://play.shinyms.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ms-btn ms-btn-green ms-btn-sm"
              >
                ▶ Play Now
              </a>
            </div>
          </div>

          {/* Server rates as StatBar */}
          <div className="ms-pixel-panel p-0">
            <div
              className="px-4 py-3"
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 11,
                letterSpacing: 1,
                color: '#ffd96b',
                background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)',
                borderBottom: '3px solid var(--ms-npc-border-out)',
              }}
            >
              Server Rates
            </div>
            <div className="p-4 flex flex-col gap-3">
              <StatBar kind="exp" label="EXP" value={7} max={10} displayValue="7×" />
              <StatBar kind="hp" label="MESO" value={5} max={10} displayValue="5×" />
              <StatBar kind="mp" label="DROP" value={3} max={10} displayValue="3×" />
              <p className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#4a3220' }}>
                Type <code style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, background: '#f0dfb0', padding: '2px 4px', border: '2px solid #2a1810' }}>@rates</code> in-game to confirm any active event boosts.
              </p>
            </div>
          </div>

          {/* Help */}
          <div className="ms-pixel-panel p-0">
            <div
              className="px-4 py-3"
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 11,
                letterSpacing: 1,
                color: '#ffd96b',
                background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)',
                borderBottom: '3px solid var(--ms-npc-border-out)',
              }}
            >
              Can’t connect?
            </div>
            <div className="p-4" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: 'var(--ms-text)' }}>
              <p className="mb-3" style={{ color: '#4a3220' }}>If the server shows online but you still can’t log in, reach out and we’ll help.</p>
              <div className="flex flex-col gap-2">
                <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="ms-btn ms-btn-sm">
                  💬 Ask on Discord
                </a>
                <Link href="/contact" className="ms-btn ms-btn-sm">
                  ✉️ Contact the team
                </Link>
                <Link href="/guide" className="ms-btn ms-btn-sm">
                  📖 Player Guide
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
