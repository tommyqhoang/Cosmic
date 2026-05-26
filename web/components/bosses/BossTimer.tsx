'use client'
import { useEffect, useState } from 'react'

type Props = {
  period: 'daily' | 'weekly'
}

function getNextReset(period: 'daily' | 'weekly'): Date {
  const now = new Date()
  const next = new Date(now)
  next.setHours(0, 0, 0, 0)

  if (period === 'daily') {
    if (now >= next) next.setDate(next.getDate() + 1)
  } else {
    const day = now.getDay()
    const daysUntilMonday = day === 0 ? 1 : 8 - day
    next.setDate(next.getDate() + daysUntilMonday)
  }
  return next
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Resetting…'
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1_000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function BossTimer({ period }: Props) {
  const [countdown, setCountdown] = useState('')

  useEffect(() => {
    function tick() {
      const now = Date.now()
      const next = getNextReset(period).getTime()
      setCountdown(formatCountdown(next - now))
    }
    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [period])

  return (
    <span className="font-mono text-xs font-bold" style={{ color: 'var(--foreground-subtle)' }}>
      {countdown || '—'}
    </span>
  )
}
