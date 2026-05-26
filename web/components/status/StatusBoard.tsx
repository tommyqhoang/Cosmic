'use client'
import useSWR from 'swr'
import { WORLDS, FLAG_LABEL } from '@/lib/worlds'

type Status = { online: boolean; players: number; ts: number }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const ONLINE = '#4ade80'
const OFFLINE = '#f87171'

function relativeTime(ts: number): string {
  const secs = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (secs < 5) return 'just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.round(secs / 60)
  return `${mins}m ago`
}

function Dot({ online, big = false }: { online: boolean; big?: boolean }) {
  const size = big ? 12 : 8
  return (
    <span
      className={online ? 'animate-pulse-dot' : ''}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: online ? ONLINE : OFFLINE,
        boxShadow: online ? `0 0 6px ${ONLINE}` : 'none',
      }}
    />
  )
}

export default function StatusBoard({ compact = false }: { compact?: boolean }) {
  const { data, isLoading, error } = useSWR<Status>('/api/server/status', fetcher, {
    refreshInterval: 30_000,
  })

  const online = data?.online ?? false
  const players = data?.players ?? 0

  return (
    <div className="flex flex-col gap-4">
      {/* Overall banner */}
      <div
        className="rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
        style={{
          backgroundColor: online ? 'var(--success-subtle)' : 'var(--destructive-subtle)',
          border: `1px solid ${online ? 'var(--success-border, #a7d4bc)' : 'var(--destructive-border)'}`,
        }}
      >
        <div className="flex items-center gap-3">
          <Dot online={online} big />
          <div>
            <p className="text-base font-bold" style={{ color: online ? 'var(--success)' : 'var(--destructive)' }}>
              {isLoading ? 'Checking…' : online ? 'Server Online' : 'Server Offline'}
            </p>
            <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
              {error
                ? 'Could not reach the status service.'
                : online
                  ? 'Login server reachable — come on in!'
                  : 'The server is currently down. Check back soon.'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono font-bold text-2xl" style={{ color: online ? 'var(--success)' : 'var(--foreground-subtle)' }}>
            {players}
          </p>
          <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
            player{players !== 1 ? 's' : ''} online
            {data?.ts ? ` · updated ${relativeTime(data.ts)}` : ''}
          </p>
        </div>
      </div>

      {/* Worlds & channels */}
      <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2'}`}>
        {WORLDS.map((world) => {
          const flag = FLAG_LABEL[world.flag]
          return (
            <div
              key={world.id}
              className="rounded-xl p-4"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dot online={online} />
                  <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
                    {world.name}
                  </span>
                  {flag && (
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-foreground)' }}
                    >
                      {flag}
                    </span>
                  )}
                </div>
                <span className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                  {world.channels} channel{world.channels !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: world.channels }, (_, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 text-xs font-medium rounded-md px-2 py-1"
                    style={{
                      backgroundColor: online ? 'var(--success-subtle)' : 'var(--surface-subtle)',
                      color: online ? 'var(--success)' : 'var(--foreground-subtle)',
                      border: `1px solid ${online ? 'var(--success-border, #a7d4bc)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    <Dot online={online} />
                    CH{i + 1}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
        Player counts are server-wide; per-channel populations aren’t reported yet. Status refreshes every 30 seconds.
      </p>
    </div>
  )
}
