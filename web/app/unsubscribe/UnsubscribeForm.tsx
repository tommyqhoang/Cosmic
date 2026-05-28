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
      <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#c03a2b' }}>
        This unsubscribe link is invalid or incomplete. Please use the link from the bottom of one of our emails.
      </p>
    )
  }

  if (status === 'done') {
    return (
      <div className="text-center">
        <p
          className="mb-4"
          style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#5a4a30' }}
        >
          You&rsquo;ve been unsubscribed. You won&rsquo;t receive any more announcement emails from ShinyMS.
        </p>
        <Link
          href="/"
          className="ms-btn ms-btn-sm"
          style={{ textDecoration: 'none', display: 'inline-block' }}
        >
          Back to homepage →
        </Link>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p
        className="mb-5"
        style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#5a4a30' }}
      >
        Unsubscribe from ShinyMS announcement emails? You can re-subscribe any time from the homepage.
      </p>
      {error && (
        <p className="mb-4" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#c03a2b' }}>
          {error}
        </p>
      )}
      <button
        onClick={unsubscribe}
        disabled={status === 'loading'}
        className="ms-btn"
        style={{
          opacity: status === 'loading' ? 0.6 : 1,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
        }}
      >
        {status === 'loading' ? 'Unsubscribing…' : 'Unsubscribe'}
      </button>
    </div>
  )
}
