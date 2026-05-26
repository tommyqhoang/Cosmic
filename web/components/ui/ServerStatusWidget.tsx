'use client'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ServerStatusWidget() {
  const { data, isLoading } = useSWR<{ online: boolean; players: number }>(
    '/api/server/status',
    fetcher,
    { refreshInterval: 30_000 }
  )

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Checking…</span>
      </div>
    )
  }

  const online = data?.online ?? false
  const players = data?.players ?? 0

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={online ? 'animate-pulse-dot' : ''}
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: online ? '#4ade80' : '#f87171',
          boxShadow: online ? '0 0 6px #4ade80' : 'none',
        }}
      />
      <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
        {online ? (
          <>
            <span style={{ color: '#86efac' }}>Online</span>
            {' — '}
            <span className="font-mono font-bold" style={{ color: '#ffffff' }}>{players}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}> player{players !== 1 ? 's' : ''}</span>
          </>
        ) : (
          <span style={{ color: '#fca5a5' }}>Server offline</span>
        )}
      </span>
    </div>
  )
}
