'use client'
import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SectionBanner from '@/components/maple/SectionBanner'
import NpcBox from '@/components/maple/NpcBox'
import Sprite from '@/components/maple/Sprite'

const CLOUDS = [
  { top: '14%', size: 84, dur: 50, delay: 0, op: 0.9 },
  { top: '30%', size: 54, dur: 40, delay: -16, op: 0.7 },
  { top: '9%', size: 64, dur: 58, delay: -30, op: 0.8 },
]

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shinyms.last-user')
      if (saved) setName(saved)
    } catch (e) {}
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !password) {
      setError('Enter your username and password.')
      return
    }
    setLoading(true)
    const result = await signIn('credentials', { name, password, redirect: false })
    if (result?.error) {
      setLoading(false)
      setError('Invalid username or password.')
    } else {
      try {
        if (remember) localStorage.setItem('shinyms.last-user', name)
        else localStorage.removeItem('shinyms.last-user')
      } catch (e) {}
      const cb = new URLSearchParams(window.location.search).get('callbackUrl')
      const dest = cb && cb.startsWith('/') && !cb.startsWith('//') ? cb : '/'
      router.push(dest)
      router.refresh()
    }
  }

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontFamily: 'var(--ms-font-b)',
    fontSize: 20,
    background: '#fff8e0',
    border: '3px solid #2a1810',
    boxShadow: 'inset 2px 2px 0 #b89460',
    color: '#2a1810',
    outline: 'none',
  }

  return (
    <div
      className="relative min-h-[88vh] flex flex-col items-center justify-center px-4 py-16 sm:py-20 overflow-hidden"
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

      {/* Floating sprites */}
      <div className="absolute" style={{ top: 24, left: '8%' }}>
        <Sprite src="/maple/mobs/orange-mushroom.gif" alt="" height={56} anim="bob" />
      </div>
      <div className="absolute" style={{ top: 70, right: '10%' }}>
        <Sprite src="/maple/mobs/slime.gif" alt="" height={48} anim="hop" delay={400} />
      </div>
      <div className="absolute" style={{ top: 140, left: '72%' }}>
        <Sprite src="/maple/mobs/snail.gif" alt="" height={36} anim="bob" flip delay={800} />
      </div>

      {/* Sparkles */}
      <span className="ms-sparkle" style={{ top: 50, left: '40%' }}>✦</span>
      <span className="ms-sparkle" style={{ top: 120, left: '70%', animationDelay: '0.5s' }}>✦</span>
      <span className="ms-sparkle" style={{ top: 30, left: '25%', animationDelay: '1.2s', fontSize: 12 }}>✦</span>
      <span className="ms-sparkle" style={{ top: 180, left: '15%', animationDelay: '0.8s', fontSize: 14 }}>✦</span>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md lg:max-w-lg flex flex-col items-center gap-5">
        {/* Hero */}
        <div className="text-center px-2">
          <SectionBanner>WELCOME BACK</SectionBanner>
          <h1 className="ms-hero-title" style={{ fontSize: 'clamp(22px, 3.6vw, 38px)' }}>
            Sign in
          </h1>
          <div className="mt-3 mb-2">
            <span className="ms-hero-sub">
              Your characters, mesos and hair colours are exactly where you parked them.
            </span>
          </div>
        </div>

        {/* Login form inside NPC box */}
        <NpcBox title="SIGN IN TO SHINYMS" npcName="Login Officer" npcCls="bishop">
          <p style={{ marginBottom: 12, fontFamily: 'var(--ms-font-b)', fontSize: 20, lineHeight: 1.3 }}>
            Sign in with your ShinyMS account. Same credentials for the website and the game.
          </p>

          {error && (
            <div
              style={{
                marginBottom: 12,
                padding: '10px 14px',
                background: '#ffe8e0',
                border: '3px solid #c64b1b',
                fontFamily: 'var(--ms-font-b)',
                fontSize: 18,
                color: '#8a1818',
                boxShadow: '3px 3px 0 rgba(0,0,0,0.25)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label
                className="block mb-1.5"
                style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, letterSpacing: 1, color: '#4a3220' }}
              >
                USERNAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your username"
                autoFocus
                maxLength={13}
                required
                className="w-full min-h-[44px]"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                className="flex items-center justify-between mb-1.5"
                style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, letterSpacing: 1, color: '#4a3220' }}
              >
                <span>PASSWORD</span>
                <span
                  className="cursor-pointer select-none"
                  style={{
                    fontFamily: 'var(--ms-font-b)',
                    fontSize: 16,
                    color: '#c64b1b',
                    textDecoration: 'underline dotted',
                  }}
                  onClick={() => setShowPwd((s) => !s)}
                >
                  {showPwd ? '🙈 hide' : '👁 show'}
                </span>
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full min-h-[44px]"
                style={inputStyle}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label
                className="flex items-center gap-2 cursor-pointer select-none"
                style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#4a3220' }}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="min-h-[20px] min-w-[20px] cursor-pointer"
                  style={{ accentColor: '#c64b1b' }}
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="select-none"
                style={{
                  fontFamily: 'var(--ms-font-b)',
                  fontSize: 18,
                  color: '#c64b1b',
                  textDecoration: 'underline dotted',
                }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ms-btn ms-btn-green min-h-[44px] justify-center mt-1"
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
            >
              {loading ? '⏳ SIGNING IN…' : '▶ SIGN IN'}
            </button>
          </form>
        </NpcBox>

        {/* Register link */}
        <div
          className="text-center"
          style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: '#2a1810' }}
        >
          No account yet?{' '}
          <Link
            href="/register"
            style={{ color: '#c64b1b', fontWeight: 700, textDecoration: 'underline dotted' }}
          >
            Create one →
          </Link>
        </div>
      </div>

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
