'use client'

import { useEffect, useState } from 'react'

export type TocItem = { id: string; label: string; emoji: string }

export default function GuideToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry nearest the top of the viewport that is intersecting.
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

  const links = (onClick?: () => void) => (
    <nav className="flex flex-col gap-0.5">
      {items.map(({ id, label, emoji }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={onClick}
          data-active={active === id}
          className="guide-toc-link flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-r-md text-sm"
          style={{ color: active === id ? undefined : 'var(--foreground-muted)' }}
        >
          <span aria-hidden className="text-base leading-none">{emoji}</span>
          <span className="truncate">{label}</span>
        </a>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop — sticky sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <div
            className="rounded-2xl p-4"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 6px rgba(28,21,39,0.05)',
            }}
          >
            <p className="guide-kicker mb-3 px-3">📚 Contents</p>
            {links()}
          </div>
        </div>
      </aside>

      {/* Mobile — collapsible jump menu */}
      <div
        className="lg:hidden sticky top-16 z-30 mb-6 rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'rgba(254,249,240,0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
          style={{ color: 'var(--foreground)' }}
        >
          <span className="flex items-center gap-2">📚 Jump to section</span>
          <svg
            width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="px-2 pb-3 pt-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {links(() => setOpen(false))}
          </div>
        )}
      </div>
    </>
  )
}
