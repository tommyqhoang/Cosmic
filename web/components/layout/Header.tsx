'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

type NavLink = { href: string; label: string }
type NavGroup = { label: string; children: NavLink[] }
type NavItem = NavLink | NavGroup

// Flat top-level items plus category dropdowns — keeps the bar to 6 targets
// instead of 9. Groups collapse into accordions on mobile.
const NAV: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/guide', label: 'Guide' },
  {
    label: 'Server',
    children: [
      { href: '/status', label: 'Server Status' },
      { href: '/rankings', label: 'Rankings' },
      { href: '/guilds', label: 'Guilds' },
      { href: '/bosses', label: 'Bosses' },
      { href: '/drops', label: 'Drop Search' },
    ],
  },
  {
    label: 'Community',
    children: [
      { href: '/community', label: 'Highlights' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
  { href: '/vote', label: 'Vote' },
]

const isGroup = (item: NavItem): item is NavGroup => 'children' in item

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// Desktop dropdown: opens on hover and on click/keyboard; closes on mouse-leave,
// outside-click, Escape, and route change.
function NavDropdown({ group, isActive }: { group: NavGroup; isActive: (href: string) => boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const groupActive = group.children.some((c) => isActive(c.href))

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 inline-flex items-center gap-1"
        style={{
          color: groupActive || open ? 'var(--primary)' : 'var(--foreground-muted)',
          backgroundColor: groupActive ? 'var(--primary-subtle)' : 'transparent',
        }}
      >
        {group.label}
        <Caret open={open} />
      </button>
      {open && (
        // pt-1.5 bridges the gap to the button so hover doesn't drop the menu.
        <div role="menu" className="absolute left-0 top-full pt-1.5 min-w-[180px] z-50">
          <div
            className="rounded-xl py-1.5"
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 28px -8px rgba(28,21,39,0.25)',
            }}
          >
            {group.children.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm font-medium transition-colors duration-150"
                style={{
                  color: isActive(c.href) ? 'var(--primary)' : 'var(--foreground-muted)',
                  backgroundColor: isActive(c.href) ? 'var(--primary-subtle)' : 'transparent',
                }}
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Mobile accordion section for a nav group.
function MobileGroup({
  group, isActive, onNavigate,
}: { group: NavGroup; isActive: (href: string) => boolean; onNavigate: () => void }) {
  const [open, setOpen] = useState(group.children.some((c) => isActive(c.href)))
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium"
        style={{ color: 'var(--foreground-muted)' }}
      >
        {group.label}
        <Caret open={open} />
      </button>
      {open && (
        <div className="ml-3 flex flex-col gap-0.5 pl-2" style={{ borderLeft: '1px solid var(--border)' }}>
          {group.children.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              onClick={onNavigate}
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{ color: isActive(c.href) ? 'var(--primary)' : 'var(--foreground-muted)' }}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const close = () => setMenuOpen(false)
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: 'rgba(254,249,240,0.9)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 transition-opacity duration-150 hover:opacity-80"
        >
          <Image
            src="/shinyms-logo.png"
            alt="ShinyMS"
            width={120}
            height={40}
            sizes="120px"
            style={{ objectFit: 'contain', height: '40px', width: 'auto' }}
            preload
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV.map((item) =>
            isGroup(item) ? (
              <NavDropdown key={item.label} group={item} isActive={isActive} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150"
                style={{
                  color: isActive(item.href) ? 'var(--primary)' : 'var(--foreground-muted)',
                  backgroundColor: isActive(item.href) ? 'var(--primary-subtle)' : 'transparent',
                }}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {session ? (
            <>
              {(session.user as { webadmin?: number })?.webadmin === 1 && (
                <Link
                  href="/admin/dashboard"
                  className="px-2.5 py-1 text-xs font-bold rounded-md"
                  style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-foreground)', border: '1px solid var(--accent)', opacity: 0.9 }}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150"
                style={{ color: 'var(--foreground-muted)' }}
              >
                {session.user?.name}
              </Link>
              <a
                href="https://play.shinyms.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-150"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                Play Now →
              </a>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150"
                style={{ color: 'var(--foreground-muted)', border: '1px solid var(--border)' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-150"
                style={{ color: 'var(--foreground-muted)' }}
              >
                Web Login
              </Link>
              <a
                href="https://play.shinyms.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-150"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                Play Now →
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg"
          style={{ color: 'var(--foreground-muted)' }}
          onClick={() => setMenuOpen(v => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 flex flex-col gap-0.5" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface)' }}>
          {NAV.map((item) =>
            isGroup(item) ? (
              <MobileGroup key={item.label} group={item} isActive={isActive} onNavigate={close} />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="px-3 py-2.5 rounded-lg text-sm font-medium"
                style={{ color: isActive(item.href) ? 'var(--primary)' : 'var(--foreground-muted)' }}
              >
                {item.label}
              </Link>
            ),
          )}
          <div className="mt-2 pt-2 flex flex-col gap-0.5" style={{ borderTop: '1px solid var(--border)' }}>
            {session ? (
              <>
                <Link href="/account" onClick={close} className="px-3 py-2.5 text-sm font-medium rounded-lg" style={{ color: 'var(--foreground-muted)' }}>
                  My Account · {session.user?.name}
                </Link>
                {(session.user as { webadmin?: number })?.webadmin === 1 && (
                  <Link href="/admin/dashboard" onClick={close} className="px-3 py-2.5 text-sm font-medium rounded-lg" style={{ color: 'var(--accent-foreground)' }}>
                    Admin Panel
                  </Link>
                )}
                <a
                  href="https://play.shinyms.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="px-3 py-2.5 text-sm font-semibold rounded-lg text-center"
                  style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                >
                  Play Now →
                </a>
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); close() }}
                  className="text-left px-3 py-2.5 text-sm font-medium rounded-lg"
                  style={{ color: 'var(--foreground-muted)' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={close} className="px-3 py-2.5 text-sm font-medium rounded-lg" style={{ color: 'var(--foreground-muted)' }}>
                  Web Login
                </Link>
                <a
                  href="https://play.shinyms.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 text-sm font-semibold rounded-lg text-center mt-1"
                  style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                >
                  Play Now →
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
