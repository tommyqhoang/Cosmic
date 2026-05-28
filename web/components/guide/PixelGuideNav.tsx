'use client'

import { useEffect, useState } from 'react'

export type TocItem = { id: string; label: string; emoji: string }

export default function PixelGuideNav({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-88px 0px -65% 0px', threshold: 0 }
    )
    for (const { id } of items) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  const linkClass = (id: string) => {
    const isActive = active === id
    return [
      'flex items-center gap-2.5 px-3 py-2.5 cursor-pointer',
      'border-2 border-[#1a0a04]',
      'transition-all duration-75',
      isActive
        ? 'bg-gradient-to-b from-[#f8c34a] to-[#e2a020] text-[#2a1810] shadow-[inset_2px_2px_0_#fff5b0,2px_2px_0_rgba(0,0,0,0.3)]'
        : 'bg-[#f6e8b4] text-[#2a1810] hover:bg-[#fff0c8]',
    ].join(' ')
  }

  const links = (onClick?: () => void) => (
    <nav className="flex flex-col gap-1.5">
      {items.map(({ id, label, emoji }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={onClick}
          className={linkClass(id)}
          style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, letterSpacing: 0.5, lineHeight: 1.4 }}
        >
          <span aria-hidden className="text-base leading-none">{emoji}</span>
          <span className="truncate flex-1">{label.toUpperCase()}</span>
          {active === id && <span className="text-[#c64b1b]">▶</span>}
        </a>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop — sticky pixel sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <div className="ms-pixel-panel p-3">
            <div
              className="text-center mb-2.5"
              style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#c64b1b', letterSpacing: 1 }}
            >
              📖 CHAPTERS
            </div>
            {links()}
          </div>
        </div>
      </aside>

      {/* Mobile — horizontal scrollable pill nav */}
      <div className="lg:hidden mb-6 overflow-x-auto">
        <div className="flex gap-2 px-1 pb-1" style={{ minWidth: 'max-content' }}>
          {items.map(({ id, label, emoji }) => (
            <a
              key={id}
              href={`#${id}`}
              className={[
                'flex items-center gap-1.5 px-3 py-2 border-2 border-[#1a0a04] shrink-0',
                active === id
                  ? 'bg-gradient-to-b from-[#f8c34a] to-[#e2a020] text-[#2a1810] shadow-[inset_2px_2px_0_#fff5b0,2px_2px_0_rgba(0,0,0,0.3)]'
                  : 'bg-[#f6e8b4] text-[#2a1810]',
              ].join(' ')}
              style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, letterSpacing: 0.5 }}
            >
              <span aria-hidden>{emoji}</span>
              <span>{label.toUpperCase()}</span>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
