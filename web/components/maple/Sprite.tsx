/**
 * A MapleStory sprite (mob, NPC or item) pulled from our local asset pack.
 * Renders the original animated GIF/PNG verbatim — a plain <img> is used on
 * purpose so animation frames play and the sprite keeps its natural ratio
 * (next/image would re-encode and can flatten the animation).
 */
type Anim = 'bob' | 'hop' | 'sway' | 'none'

const ANIM_CLASS: Record<Anim, string> = {
  bob: 'sprite-bob',
  hop: 'sprite-hop',
  sway: 'sprite-sway',
  none: '',
}

export default function Sprite({
  src,
  alt,
  height = 64,
  anim = 'bob',
  flip = false,
  grounded = true,
  delay = 0,
  className = '',
}: {
  src: string
  alt: string
  height?: number
  anim?: Anim
  flip?: boolean
  grounded?: boolean
  delay?: number
  className?: string
}) {
  return (
    <span
      className={`inline-block ${className}`}
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        className={`sprite ${grounded ? 'sprite-grounded' : ''} ${ANIM_CLASS[anim]}`}
        style={{ height, width: 'auto', animationDelay: `${delay}ms` }}
      />
    </span>
  )
}
