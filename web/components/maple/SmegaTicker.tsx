import Link from 'next/link'
import { itemIcon } from '@/lib/maplestory'
import type { Smega } from '@/lib/community'

/**
 * The scrolling super-megaphone band, mirroring the in-game smega feed. Pure CSS
 * marquee (no JS) — the content is rendered twice so the -50% translate loops
 * seamlessly. Hovering pauses it. Renders nothing until smegas exist.
 */
export default function SmegaTicker({ smegas }: { smegas: Smega[] }) {
  if (smegas.length === 0) return null

  const Item = ({ s }: { s: Smega }) => (
    <span className="inline-flex items-center gap-2 px-5">
      <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.18)', color: '#fff' }}>
        ch{s.channel}
      </span>
      <span className="font-semibold text-sm" style={{ color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.3)' }}>
        {s.player}
      </span>
      <span className="text-sm" style={{ color: '#fff', textShadow: '0 1px 1px rgba(0,0,0,0.3)' }}>: {s.message}</span>
      {s.itemId != null && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={itemIcon(s.itemId)} alt="" className="sprite" style={{ height: 18, width: 'auto' }} />
      )}
      <span style={{ color: 'rgba(255,255,255,0.55)' }}>◆</span>
    </span>
  )

  return (
    <Link href="/community" aria-label="Latest in-game megaphones" className="smega-ticker smega-band block overflow-hidden group" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
      <div className="flex items-center">
        <span className="shrink-0 z-10 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: 'rgba(0,0,0,0.22)', color: '#fff' }}>
          <span aria-hidden>📢</span> Smega
        </span>
        <div className="smega-marquee py-1.5">
          {smegas.map((s) => <Item key={s.id} s={s} />)}
          {/* duplicate for a seamless -50% loop */}
          {smegas.map((s) => <Item key={`dup-${s.id}`} s={s} />)}
        </div>
      </div>
    </Link>
  )
}
