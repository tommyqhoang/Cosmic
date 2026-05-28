'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/guide', label: 'Guide' },
  { href: '/community', label: 'Highlights' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/vote', label: 'Vote' },
]

export default function Header() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: serverStatus } = useSWR<{ online: boolean; players: number }>(
    '/api/server/status',
    fetcher,
    { refreshInterval: 30_000 },
  )
  const online = serverStatus?.online ?? null
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: 'linear-gradient(to bottom, #3a2418 0%, #1a0a04 100%)',
        borderBottom: '3px solid #f8c34a',
        boxShadow: '0 4px 0 rgba(0,0,0,0.4)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-[52px]">
        {/* Brand */}
        <Link href="/" className="shrink-0 flex items-center gap-2 no-underline">
          <Image
            src="/maple/items/maple-leaf.png"
            alt=""
            width={28}
            height={28}
            className="sprite-grounded"
            style={{ imageRendering: 'pixelated' }}
          />
          <span
            style={{
              fontFamily: 'var(--ms-font-d)',
              fontSize: 14,
              color: '#f8c34a',
              textShadow: '2px 2px 0 #1a0a04',
              letterSpacing: 1,
              lineHeight: 1,
            }}
          >
            SHINY<span style={{ color: '#fff8d8' }}>MS</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 ml-5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 no-underline"
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 10,
                color: isActive(item.href) ? '#f8c34a' : '#fff8d8',
                letterSpacing: 1,
                border: isActive(item.href) ? '2px solid #f8c34a' : '2px solid transparent',
                background: isActive(item.href) ? 'rgba(248,195,74,0.2)' : 'transparent',
                transition: 'all 120ms',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <span
            className="inline-flex items-center gap-1.5"
            style={{
              fontFamily: 'var(--ms-font-d)',
              fontSize: 9,
              color: online === false ? '#f87171' : '#88f078',
              padding: '4px 10px',
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${online === false ? '#7a1818' : '#2e7a18'}`,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: online === false ? '#f87171' : '#88f078',
                boxShadow: online !== false ? '0 0 6px #88f078' : 'none',
                display: 'inline-block',
                animation: online !== false ? 'pulse-dot 2s infinite' : 'none',
              }}
            />
            {online === false ? 'OFFLINE' : 'ONLINE'}
          </span>

          {session ? (
            <>
              {(session.user as { webadmin?: number })?.webadmin === 1 && (
                <Link
                  href="/admin/dashboard"
                  className="ms-btn ms-btn-sm"
                  style={{ background: 'linear-gradient(to bottom, #ffe086 0%, #f8c34a 45%, #e2a020 100%)', color: '#2a1810' }}
                >
                  Admin
                </Link>
              )}
              <Link href="/account" className="ms-btn ms-btn-sm">
                {session.user?.name}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="ms-btn ms-btn-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="ms-btn ms-btn-sm">
                LOGIN
              </Link>
              <a
                href="https://play.shinyms.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ms-btn ms-btn-sm ms-btn-green"
              >
                ▶ PLAY
              </a>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-3"
          style={{ color: '#fff8d8' }}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-4 py-3 flex flex-col gap-1"
          style={{
            background: 'linear-gradient(to bottom, #3a2418 0%, #1a0a04 100%)',
            borderTop: '2px solid #f8c34a',
          }}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2.5 no-underline"
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 10,
                color: isActive(item.href) ? '#f8c34a' : '#fff8d8',
                letterSpacing: 1,
                border: isActive(item.href) ? '2px solid #f8c34a' : '2px solid transparent',
                background: isActive(item.href) ? 'rgba(248,195,74,0.2)' : 'transparent',
              }}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 flex flex-col gap-2" style={{ borderTop: '1px dashed #4a3220' }}>
            {session ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-2.5 no-underline"
                  style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#fff8d8' }}
                >
                  {session.user?.name}
                </Link>
                {(session.user as { webadmin?: number })?.webadmin === 1 && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 no-underline"
                    style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#f8c34a' }}
                  >
                    Admin Panel
                  </Link>
                )}
                <a
                  href="https://play.shinyms.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="ms-btn ms-btn-sm ms-btn-green"
                  style={{ justifyContent: 'center' }}
                >
                  ▶ PLAY
                </a>
                <button
                  onClick={() => { signOut({ callbackUrl: '/' }); setMenuOpen(false) }}
                  className="ms-btn ms-btn-sm"
                  style={{ justifyContent: 'center' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="ms-btn ms-btn-sm" style={{ justifyContent: 'center' }}>
                  LOGIN
                </Link>
                <a
                  href="https://play.shinyms.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-btn ms-btn-sm ms-btn-green"
                  style={{ justifyContent: 'center' }}
                >
                  ▶ PLAY
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
