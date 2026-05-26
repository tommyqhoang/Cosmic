'use client'
import { useState } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function UnsubscribeForm({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  async function unsubscribe() {
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? 'Could not unsubscribe. Please try again.')
        setStatus('error')
        return
      }
      setStatus('done')
    } catch {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (!token) {
    return (
      <p className="text-sm" style={{ color: 'var(--destructive)' }}>
        This unsubscribe link is invalid or incomplete. Please use the link from the bottom of one of our emails.
      </p>
    )
  }

  if (status === 'done') {
    return (
      <div className="text-center">
        <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
          You&rsquo;ve been unsubscribed. You won&rsquo;t receive any more announcement emails from ShinyMS.
        </p>
        <Link href="/" className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
          Back to homepage →
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-sm mb-5" style={{ color: 'var(--foreground-muted)' }}>
        Unsubscribe from ShinyMS announcement emails? You can re-subscribe any time from the homepage.
      </p>
      {error && (
        <p className="text-sm mb-4" style={{ color: 'var(--destructive)' }}>{error}</p>
      )}
      <button
        onClick={unsubscribe}
        disabled={status === 'loading'}
        className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-150"
        style={{
          backgroundColor: 'var(--destructive)',
          color: '#fff',
          opacity: status === 'loading' ? 0.6 : 1,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? 'Unsubscribing…' : 'Unsubscribe'}
      </button>
    </div>
  )
}
