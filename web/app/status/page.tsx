import type { Metadata } from 'next'
import Link from 'next/link'
import MapleWindow from '@/components/maple/MapleWindow'
import Sprite from '@/components/maple/Sprite'
import StatusBoard from '@/components/status/StatusBoard'

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

const cardStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  boxShadow: '0 1px 6px rgba(28,21,39,0.05)',
} as const

const RATES = [
  { label: 'EXP', value: '7×' },
  { label: 'Meso', value: '5×' },
  { label: 'Drop', value: '3×' },
]

export default function StatusPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Sprite src="/maple/mobs/green-mushroom.gif" alt="" height={56} anim="hop" grounded={false} className="hidden sm:block shrink-0" />
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>
            Server Status
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
            Live status of the ShinyMS game server, worlds, and channels.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
        {/* Live board */}
        <MapleWindow title="Live Server Status" bodyClassName="p-5 sm:p-6">
          <StatusBoard />
        </MapleWindow>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          {/* Play CTA */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)' }}>
            <h2 className="font-display font-bold text-base mb-1" style={{ color: '#fff' }}>🍁 Ready to play?</h2>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Jump straight in from your browser, or grab the desktop client — no download required to start.
            </p>
            <a
              href="https://play.shinyms.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              ▶ Play Now
            </a>
          </div>

          {/* Server rates */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--foreground)' }}>Server Rates</h2>
            <div className="grid grid-cols-3 gap-2">
              {RATES.map((r) => (
                <div key={r.label} className="rounded-xl py-3 text-center" style={{ backgroundColor: 'var(--primary-subtle)', border: '1px solid var(--border-subtle)' }}>
                  <div className="font-mono font-bold text-lg" style={{ color: 'var(--primary)' }}>{r.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--foreground-muted)' }}>{r.label}</div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-3" style={{ color: 'var(--foreground-subtle)' }}>
              Type <code style={{ fontFamily: 'var(--font-geist-mono)' }}>@rates</code> in-game to confirm any active event boosts.
            </p>
          </div>

          {/* Help */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="font-semibold text-sm mb-2" style={{ color: 'var(--accent-foreground)' }}>Can’t connect?</h2>
            <p className="text-xs mb-3" style={{ color: 'var(--foreground-muted)' }}>
              If the server shows online but you still can’t log in, reach out and we’ll help.
            </p>
            <div className="flex flex-col gap-1.5 text-sm">
              <a href="https://discord.gg/jKueJFAErs" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>💬 Ask on Discord</a>
              <Link href="/contact" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>✉️ Contact the team</Link>
              <Link href="/guide" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>📖 Player Guide</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
