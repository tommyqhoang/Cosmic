'use client'
import { useState, useEffect } from 'react'

// Live server clock in US Central time so players know when scheduled events
// fire. America/Chicago tracks DST automatically (shows CST in winter, CDT in
// summer); the abbreviation is rendered alongside the time so it's never wrong.
function formatCentral(): string {
  const now = new Date()
  const date = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(now)
  const time = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(now)
  return `${date} · ${time}`
}

export default function ServerClock() {
  // Render nothing time-specific until mounted to avoid a hydration mismatch.
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => setTime(formatCentral())
    // Defer the first update out of the effect body, then tick every 15s.
    queueMicrotask(tick)
    const id = setInterval(tick, 15_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex items-center gap-2" title="Server time (US Central) — use this for events">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.7)' }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
        {time ? (
          <span className="font-mono font-bold" style={{ color: '#ffffff' }}>{time}</span>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>—</span>
        )}
      </span>
    </div>
  )
}
