import Sprite from './Sprite'

/**
 * Decorative daytime Maple World scene layered behind the hero copy:
 * drifting clouds up top, maple leaves tumbling down, and a grassy ridge
 * along the bottom where the starter mobs bounce. Purely cosmetic
 * (aria-hidden, pointer-events-none) so it never intercepts the CTAs.
 */

const CLOUDS = [
  { top: '12%', size: 90, dur: 46, delay: 0, op: 0.9 },
  { top: '26%', size: 60, dur: 38, delay: -12, op: 0.75 },
  { top: '8%', size: 70, dur: 54, delay: -28, op: 0.8 },
  { top: '38%', size: 48, dur: 32, delay: -6, op: 0.6 },
]

const LEAVES = [
  { left: '8%', dur: 9, delay: 0 },
  { left: '22%', dur: 12, delay: -3 },
  { left: '40%', dur: 8, delay: -6 },
  { left: '58%', dur: 13, delay: -1 },
  { left: '73%', dur: 10, delay: -8 },
  { left: '88%', dur: 11, delay: -4 },
]

const MOBS = [
  { src: '/maple/mobs/orange-mushroom.gif', alt: 'Orange Mushroom', left: '6%', h: 60, anim: 'hop' as const, delay: 0 },
  { src: '/maple/mobs/snail.gif', alt: 'Snail', left: '20%', h: 38, anim: 'bob' as const, delay: 400, flip: true },
  { src: '/maple/mobs/slime.gif', alt: 'Slime', left: '34%', h: 50, anim: 'hop' as const, delay: 900 },
  { src: '/maple/mobs/pig.gif', alt: 'Pig', left: '64%', h: 56, anim: 'bob' as const, delay: 300, flip: true },
  { src: '/maple/mobs/blue-snail.gif', alt: 'Blue Snail', left: '80%', h: 40, anim: 'bob' as const, delay: 700 },
  { src: '/maple/mobs/green-mushroom.gif', alt: 'Green Mushroom', left: '92%', h: 58, anim: 'hop' as const, delay: 1200, flip: true },
]

export default function HeroScene() {
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Clouds */}
      {CLOUDS.map((c, i) => (
        <div
          key={`cloud-${i}`}
          className="cloud absolute rounded-full"
          style={{
            top: c.top,
            width: c.size,
            height: c.size * 0.42,
            opacity: c.op,
            background: 'radial-gradient(circle at 50% 60%, #ffffff 60%, rgba(255,255,255,0.85) 100%)',
            filter: 'blur(2px)',
            boxShadow: '0 8px 18px rgba(26,58,92,0.12)',
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}

      {/* Falling maple leaves */}
      {LEAVES.map((l, i) => (
        <div
          key={`leaf-${i}`}
          className="leaf absolute top-0"
          style={{ left: l.left, animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/maple/items/maple-leaf.png" alt="" className="sprite" style={{ height: 22, width: 'auto' }} />
        </div>
      ))}

      {/* Grassy ridge with starter mobs standing on it */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="relative h-20 sm:h-24">
          {MOBS.map((m) => (
            <div key={m.src} className="absolute bottom-2" style={{ left: m.left }}>
              <Sprite src={m.src} alt={m.alt} height={m.h} anim={m.anim} flip={m.flip} delay={m.delay} />
            </div>
          ))}
        </div>
        <div className="maple-grass-edge h-3.5" />
        <div className="maple-grass h-10 sm:h-12" />
      </div>
    </div>
  )
}
