import type { ReactNode } from 'react'
import Sprite from './Sprite'

/**
 * Sky-and-grass backdrop for the login / register screens so the auth flow
 * feels like stepping onto Maple Island rather than filling out a web form.
 * Clouds drift up top; starter mobs idle on the grass below. Decorative only.
 */

const CLOUDS = [
  { top: '14%', size: 84, dur: 50, delay: 0, op: 0.9 },
  { top: '30%', size: 54, dur: 40, delay: -16, op: 0.7 },
  { top: '9%', size: 64, dur: 58, delay: -30, op: 0.8 },
]

export default function AuthBackdrop({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className="relative min-h-[88vh] flex items-center justify-center px-4 py-16 sm:py-20 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #3a7bc0 0%, #5b9bd6 45%, #79b4e2 75%, #a7d2ef 100%)' }}
    >
      {/* Drifting clouds */}
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          aria-hidden
          className="cloud absolute rounded-full"
          style={{
            top: c.top,
            width: c.size,
            height: c.size * 0.42,
            opacity: c.op,
            background: 'radial-gradient(circle at 50% 60%, #fff 60%, rgba(255,255,255,0.85) 100%)',
            filter: 'blur(2px)',
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* Auth card */}
      <div className={`relative z-10 w-full ${className ?? 'max-w-sm'}`}>{children}</div>

      {/* Grass ridge with idling mobs */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 pointer-events-none">
        <div className="relative h-16 max-w-5xl mx-auto">
          <div className="absolute bottom-1.5" style={{ left: '6%' }}>
            <Sprite src="/maple/mobs/orange-mushroom.gif" alt="" height={52} anim="hop" />
          </div>
          <div className="absolute bottom-2" style={{ left: '26%' }}>
            <Sprite src="/maple/mobs/snail.gif" alt="" height={34} anim="bob" flip delay={500} />
          </div>
          <div className="absolute bottom-1.5" style={{ right: '10%' }}>
            <Sprite src="/maple/mobs/slime.gif" alt="" height={46} anim="hop" delay={800} />
          </div>
          <div className="absolute bottom-2" style={{ right: '28%' }}>
            <Sprite src="/maple/mobs/pig.gif" alt="" height={50} anim="bob" flip delay={300} />
          </div>
        </div>
        <div className="maple-grass-edge h-3" />
        <div className="maple-grass h-10 sm:h-12" />
      </div>
    </div>
  )
}
