'use client'
import { useState } from 'react'

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setMessage(data?.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('done')
      setEmail('')
    } catch {
      setMessage('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)', borderTop: '1px solid var(--border)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
        <p className="font-display font-bold text-sm mb-3" style={{ color: 'var(--accent)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Stay in the loop
        </p>
        <h2 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: '#fff' }}>
          Get ShinyMS updates by email
        </h2>
        <p className="text-base leading-relaxed mb-8 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Be the first to know about events, updates and maintenance. No spam — just announcements, and you can unsubscribe any time.
        </p>

        {status === 'done' ? (
          <div
            className="inline-flex items-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            🎉 You&rsquo;re subscribed! Check your inbox to confirm.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 rounded-lg px-4 py-3 text-sm outline-none"
              style={{ backgroundColor: '#fff', color: 'var(--foreground)', border: '1px solid rgba(255,255,255,0.4)' }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="rounded-lg px-6 py-3 text-sm font-bold transition-all duration-150 hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--accent)',
                color: '#fff',
                opacity: status === 'loading' ? 0.6 : 1,
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-sm mt-4" style={{ color: '#ffd1d1' }}>{message}</p>
        )}
      </div>
    </section>
  )
}
