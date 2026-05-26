'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to the server console (Railway captures stdout); never shown to the client.
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm opacity-70">An unexpected error occurred. Please try again.</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150"
        style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)' }}
      >
        Try again
      </button>
    </div>
  )
}
