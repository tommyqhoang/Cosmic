import type { ReactNode } from 'react'

/**
 * The classic MapleStory UI window: a blue gradient title bar over a beige
 * body with the signature inset highlight. Used to frame content so pages
 * feel like in-game panels rather than flat web cards.
 */
export default function MapleWindow({
  title,
  icon,
  children,
  bodyClassName = '',
  className = '',
}: {
  title: ReactNode
  icon?: ReactNode
  children: ReactNode
  bodyClassName?: string
  className?: string
}) {
  return (
    <div className={`maple-window ${className}`}>
      <div className="maple-window-title text-sm font-display">
        {icon}
        {title}
      </div>
      <div className={`maple-window-body ${bodyClassName}`}>{children}</div>
    </div>
  )
}
