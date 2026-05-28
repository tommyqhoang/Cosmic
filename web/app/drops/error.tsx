'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="ms-pixel-panel px-8 py-8 text-center max-w-sm">
        <div style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#c64b1b', letterSpacing: 1, marginBottom: 12 }}>
          SOMETHING WENT WRONG
        </div>
        <p style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#4a3220', marginBottom: 16 }}>
          Could not load this page. Please try again.
        </p>
        <button onClick={reset} className="ms-btn ms-btn-sm">
          Try again
        </button>
      </div>
    </div>
  )
}
