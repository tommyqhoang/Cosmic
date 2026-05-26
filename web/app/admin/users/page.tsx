'use client'
import { useState, useEffect, useCallback, Fragment } from 'react'
import Link from 'next/link'
import { getJobName, getJobClass, jobClassColors } from '@/lib/jobs'
import { Alert, Badge, Button, Card, Input, Spinner, PageHeader } from '@/components/admin/ui'
import Modal from '@/components/admin/Modal'

type Char = { id: number; name: string; level: number; job: number; world: number }

type User = {
  id: number
  name: string
  email: string | null
  banned: number
  banreason: string | null
  mute: number
  webadmin: number
  createdat: string
  lastlogin: string | null
  characters: Char[]
}

function formatLastLogin(value: string | null): string {
  if (!value) return 'Never'
  const d = new Date(value)
  if (isNaN(d.getTime())) return 'Never'
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [banTarget, setBanTarget] = useState<User | null>(null)
  const [banReason, setBanReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const reload = useCallback(() => setRefreshKey((k) => k + 1), [])
  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  useEffect(() => {
    let cancelled = false
    const t = setTimeout(() => {
      if (!cancelled) { setLoading(true); setError(null) }
      const url = search ? `/api/admin/users?search=${encodeURIComponent(search)}` : '/api/admin/users'
      fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error(`Failed to load users (${res.status})`)
          return res.json()
        })
        .then((data: User[]) => { if (!cancelled) { setUsers(data); setLoading(false) } })
        .catch((e: unknown) => { if (!cancelled) { setError(e instanceof Error ? e.message : 'Failed to load users'); setLoading(false) } })
    }, 300)
    return () => { cancelled = true; clearTimeout(t) }
  }, [search, refreshKey])

  async function userAction(url: string, body?: Record<string, unknown>): Promise<boolean> {
    try {
      const res = await fetch(url, body
        ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
        : { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Action failed')
        return false
      }
      return true
    } catch {
      setError('Action failed')
      return false
    }
  }

  async function banUser() {
    if (!banTarget) return
    if (!(await userAction(`/api/admin/users/${banTarget.id}/ban`, { reason: banReason }))) return
    setBanTarget(null)
    setBanReason('')
    reload()
  }

  const unbanUser = async (id: number) => { if (await userAction(`/api/admin/users/${id}/unban`)) reload() }
  const muteUser = async (id: number) => { if (await userAction(`/api/admin/users/${id}/mute`)) reload() }
  const unmuteUser = async (id: number) => { if (await userAction(`/api/admin/users/${id}/unmute`)) reload() }

  const COLS = ['User', 'Email', 'Characters', 'Joined', 'Last Login', 'Status', 'Actions']

  return (
    <div className="flex flex-col gap-6">
      {error && <Alert onDismiss={() => setError(null)}>{error}</Alert>}

      <PageHeader
        title="Users"
        subtitle={`${users.length} account${users.length !== 1 ? 's' : ''}`}
        actions={
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username or character…"
            aria-label="Search users"
            className="w-full sm:w-72"
          />
        }
      />

      {/* Ban modal */}
      {banTarget && (
        <Modal
          title={`Ban ${banTarget.name}?`}
          description="Provide a reason for the ban. The player will be unable to log in."
          onClose={() => { setBanTarget(null); setBanReason('') }}
        >
          <form onSubmit={(e) => { e.preventDefault(); banUser() }} className="flex flex-col gap-4">
            <Input
              autoFocus
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Ban reason…"
              aria-label="Ban reason"
              required
              maxLength={500}
            />
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => { setBanTarget(null); setBanReason('') }}>Cancel</Button>
              <Button type="submit" className="flex-1" style={{ backgroundColor: 'var(--destructive)', color: '#fff', border: '1px solid transparent' }}>Confirm Ban</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center"><Spinner label="Loading users" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ backgroundColor: 'var(--surface)' }}>
              <caption className="sr-only">Accounts and moderation actions</caption>
              <thead>
                <tr style={{ backgroundColor: 'var(--surface-subtle)', borderBottom: '1px solid var(--border)' }}>
                  {COLS.map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{ color: 'var(--foreground-subtle)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <Fragment key={user.id}>
                    <tr style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', backgroundColor: 'var(--surface)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }} aria-hidden="true">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{user.name}</div>
                            {user.webadmin === 1 && <span className="text-xs font-semibold" style={{ color: 'var(--accent-foreground)' }}>Admin</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--foreground-subtle)' }}>{user.email ?? '—'}</td>
                      <td className="px-4 py-3 text-xs">
                        {user.characters.length === 0 ? (
                          <span style={{ color: 'var(--foreground-subtle)' }}>—</span>
                        ) : (
                          <button
                            onClick={() => toggleExpand(user.id)}
                            aria-expanded={expanded.has(user.id)}
                            className="inline-flex items-center gap-1 font-medium transition-opacity hover:opacity-80"
                            style={{ color: 'var(--primary)' }}
                          >
                            {user.characters.length} char{user.characters.length !== 1 ? 's' : ''}
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" style={{ transform: expanded.has(user.id) ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9" /></svg>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--foreground-subtle)' }}>{new Date(user.createdat).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'var(--foreground-subtle)' }}>{formatLastLogin(user.lastlogin)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {user.banned === 1 && <Badge tone="danger">Banned</Badge>}
                          {user.mute === 1 && <Badge tone="warning">Muted</Badge>}
                          {user.banned === 0 && user.mute === 0 && <Badge tone="success">Active</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {user.banned === 1 ? (
                            <Button size="sm" variant="success" onClick={() => unbanUser(user.id)}>Unban</Button>
                          ) : (
                            <Button size="sm" variant="danger" onClick={() => { setBanTarget(user); setBanReason('') }}>Ban</Button>
                          )}
                          {user.mute === 1 ? (
                            <Button size="sm" variant="success" onClick={() => unmuteUser(user.id)}>Unmute</Button>
                          ) : (
                            <Button size="sm" variant="warning" onClick={() => muteUser(user.id)}>Mute</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expanded.has(user.id) && user.characters.length > 0 && (
                      <tr style={{ backgroundColor: 'var(--surface-subtle)' }}>
                        <td colSpan={COLS.length} className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {user.characters.map((ch) => {
                              const color = jobClassColors[getJobClass(ch.job)]
                              return (
                                <Link
                                  key={ch.id}
                                  href={`/character/${encodeURIComponent(ch.name)}`}
                                  className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-opacity hover:opacity-80"
                                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                                >
                                  <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{ch.name}</span>
                                  <span className="text-xs font-mono" style={{ color: 'var(--foreground-subtle)' }}>Lv.{ch.level}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${color}`}>{getJobName(ch.job)}</span>
                                </Link>
                              )
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={COLS.length} className="py-16 text-center text-sm" style={{ color: 'var(--foreground-subtle)' }}>No accounts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
