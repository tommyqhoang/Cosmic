import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Card, CardHeader, PageHeader, Badge, EmptyState, Button } from '@/components/admin/ui'
import StatusBoard from '@/components/status/StatusBoard'

async function getStats() {
  const host = process.env.GAME_SERVER_HOST ?? 'localhost'
  const port = Number(process.env.GAME_LOGIN_PORT ?? 8484)

  const [totalAccounts, bannedAccounts, players, subscribers, recentAccounts, tcpOnline] = await Promise.all([
    prisma.account.count().catch(() => 0),
    prisma.account.count({ where: { banned: 1 } }).catch(() => 0),
    prisma.account.count({ where: { loggedin: 2 } }).catch(() => 0),
    prisma.cmsSubscriber.count({ where: { active: true } }).catch(() => 0),
    prisma.account.findMany({
      orderBy: { createdat: 'desc' },
      take: 8,
      select: { id: true, name: true, createdat: true, banned: true },
    }).catch(() => []),
    // Reachability probe must match the one in /api/server/status so
    // the dashboard stat card and the StatusBoard agree.
    import('@/lib/server-check').then(m => m.checkServerOnline(host, port)).catch(() => false),
  ])

  const online = tcpOnline || players > 0

  return { totalAccounts, bannedAccounts, online, players, subscribers, recentAccounts }
}

const icons = {
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  online: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
    </svg>
  ),
  banned: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  ),
  server: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  mail: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
    </svg>
  ),
}

export default async function AdminDashboardPage() {
  const { totalAccounts, bannedAccounts, online, players, subscribers, recentAccounts } = await getStats()

  const stats = [
    { label: 'Total Accounts', value: totalAccounts.toLocaleString(), icon: icons.users, color: 'var(--primary)', subtle: 'var(--primary-subtle)' },
    { label: 'Online Now', value: String(players), icon: icons.online, color: online ? 'var(--success)' : 'var(--foreground-subtle)', subtle: online ? 'var(--success-subtle)' : 'var(--surface-subtle)' },
    { label: 'Subscribers', value: subscribers.toLocaleString(), icon: icons.mail, color: 'var(--accent-hover)', subtle: 'var(--accent-subtle)' },
    { label: 'Banned', value: String(bannedAccounts), icon: icons.banned, color: bannedAccounts > 0 ? 'var(--destructive)' : 'var(--foreground-subtle)', subtle: bannedAccounts > 0 ? 'var(--destructive-subtle)' : 'var(--surface-subtle)' },
    { label: 'Server', value: online ? 'Online' : 'Offline', icon: icons.server, color: online ? 'var(--success)' : 'var(--destructive)', subtle: online ? 'var(--success-subtle)' : 'var(--destructive-subtle)' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" subtitle="Server overview at a glance" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon, color, subtle }) => (
          <Card key={label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--foreground-subtle)' }}>{label}</span>
              <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: subtle, color }}>{icon}</span>
            </div>
            <div className="font-mono font-bold text-2xl" style={{ color }}>{value}</div>
          </Card>
        ))}
      </div>

      {/* Server status */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Server Status"
          action={
            <Link href="/status" target="_blank" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Public page →
            </Link>
          }
        />
        <div className="p-5">
          <StatusBoard compact />
        </div>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="p-4 flex items-center gap-4">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Manage Users</p>
            <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>Search, ban, mute and review accounts</p>
          </div>
          <Link href="/admin/users" className="shrink-0">
            <Button size="sm" variant="secondary">Open →</Button>
          </Link>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-foreground)' }} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Manage Posts</p>
            <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>Publish news, changelogs and alerts</p>
          </div>
          <Link href="/admin/posts" className="shrink-0">
            <Button size="sm" variant="secondary">Open →</Button>
          </Link>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <span className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>View Site</p>
            <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>Open the public homepage</p>
          </div>
          <Link href="/" target="_blank" className="shrink-0">
            <Button size="sm" variant="secondary">Open →</Button>
          </Link>
        </Card>
      </div>

      {/* Recent accounts */}
      <Card className="overflow-hidden">
        <CardHeader
          title="Recent Registrations"
          action={
            <Link href="/admin/users" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              View all →
            </Link>
          }
        />
        {recentAccounts.length === 0 ? (
          <EmptyState title="No accounts yet" hint="New registrations will appear here." />
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {recentAccounts.map((acc) => (
              <li key={acc.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }} aria-hidden="true">
                    {acc.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{acc.name}</span>
                  {acc.banned === 1 && <Badge tone="danger">Banned</Badge>}
                </div>
                <time className="text-xs shrink-0" style={{ color: 'var(--foreground-subtle)' }} dateTime={new Date(acc.createdat).toISOString()}>
                  {new Date(acc.createdat).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
