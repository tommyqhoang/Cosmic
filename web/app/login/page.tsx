'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthBackdrop from '@/components/maple/AuthBackdrop'
import Sprite from '@/components/maple/Sprite'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { name, password, redirect: false })
    if (result?.error) {
      setLoading(false)
      setError('Invalid username or password.')
    } else {
      // Return to ?callbackUrl=… when it's a safe internal path (e.g. /vote),
      // otherwise home. The startsWith('//') check blocks open redirects.
      const cb = new URLSearchParams(window.location.search).get('callbackUrl')
      const dest = cb && cb.startsWith('/') && !cb.startsWith('//') ? cb : '/'
      router.push(dest)
      router.refresh()
    }
  }

  return (
    <AuthBackdrop>
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--surface)',
            border: '2px solid #2a4a73',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.7), 0 16px 40px -12px rgba(26,58,92,0.5)',
          }}
        >
          {/* Logo mark */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <Sprite src="/maple/mobs/orange-mushroom.gif" alt="" height={56} anim="hop" grounded={false} />
            </div>
            <div className="font-display font-bold text-base mb-1" style={{ color: 'var(--navy)', letterSpacing: '0.04em' }}>
              ShinyMS
            </div>
            <h1 className="text-xl font-bold font-display" style={{ color: 'var(--foreground)' }}>Welcome back</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
              Sign in to your account
            </p>
          </div>

          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm mb-5"
              style={{ backgroundColor: 'var(--destructive-subtle)', color: 'var(--destructive)', border: '1px solid var(--destructive-border)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                Username
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-150"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--foreground)',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                placeholder="Your username"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-150"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--foreground)',
                  outline: 'none',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 mt-1"
              style={{
                backgroundColor: loading ? 'var(--primary-hover)' : 'var(--primary)',
                color: '#fff',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--foreground-subtle)' }}>
            No account?{' '}
            <Link href="/register" className="font-semibold" style={{ color: 'var(--primary)' }}>
              Register here
            </Link>
          </p>
        </div>
    </AuthBackdrop>
  )
}
