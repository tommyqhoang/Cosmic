import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { getJobName } from '@/lib/jobs'
import Link from 'next/link'
import ChangePasswordForm from '@/components/account/ChangePasswordForm'
import Sprite from '@/components/maple/Sprite'
import type { Metadata } from 'next'

// Private, auth-gated page — give it a unique title like every other route, but
// keep it out of search results.
export const metadata: Metadata = {
  title: 'My Account',
  description: 'Manage your ShinyMS account, characters, and vote rewards.',
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const account = await prisma.account.findUnique({
    where: { name: session.user.name! },
    select: {
      name: true, email: true, banned: true, banreason: true,
      createdat: true, lastlogin: true,
      nxCredit: true, maplePoint: true, votepoints: true,
      characters: {
        where: { gm: 0 },
        orderBy: { level: 'desc' },
        take: 10,
        select: { id: true, name: true, level: true, job: true },
      },
    },
  }).catch(() => null)
  if (!account) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Page title */}
      <div className="mb-8 flex items-center gap-3">
        <Sprite src="/maple/mobs/snail.gif" alt="" height={56} anim="hop" grounded={false} className="shrink-0" />
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>
            My Account
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
            Manage your ShinyMS account
          </p>
        </div>
      </div>

      {/* Ban notice */}
      {account.banned === 1 && (
        <div
          className="rounded-xl p-4 mb-6 text-sm"
          style={{ backgroundColor: 'var(--destructive-subtle)', border: '1px solid var(--destructive-border)', color: 'var(--destructive)' }}
        >
          <p className="font-semibold">Your account is banned.</p>
          {account.banreason && <p className="mt-1 opacity-80">Reason: {account.banreason}</p>}
          <p className="mt-1 opacity-70">To appeal, contact an admin on Discord.</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Play CTA */}
        <a
          href="https://play.shinyms.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl p-4 flex items-center justify-between gap-4 transition-all duration-150 hover:scale-[1.01]"
          style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)' }}
        >
          <div>
            <p className="font-display font-bold text-sm" style={{ color: '#fff', letterSpacing: '0.03em' }}>Jump back into the game →</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>Play instantly in your browser. No download needed.</p>
          </div>
        </a>

        {/* Currency cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'NX Credit', value: (account.nxCredit ?? 0).toLocaleString() },
            { label: 'MaplePoints', value: (account.maplePoint ?? 0).toLocaleString() },
            { label: 'Vote Points', value: account.votepoints.toLocaleString() },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl p-4 text-center"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,21,39,0.05)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--foreground-subtle)' }}>
                {label}
              </div>
              <div className="font-mono font-bold text-xl" style={{ color: 'var(--primary)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,21,39,0.05)' }}
        >
          <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Account Info</h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {[
              { label: 'Username', value: account.name },
              { label: 'Email', value: account.email ?? '—' },
              { label: 'Joined', value: new Date(account.createdat).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: 'Last Login', value: account.lastlogin ? new Date(account.lastlogin).toLocaleString() : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3.5">
                <span className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>{label}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Characters */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,21,39,0.05)' }}
        >
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Characters</h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}>
              {account.characters.length}
            </span>
          </div>
          {account.characters.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm" style={{ color: 'var(--foreground-subtle)' }}>
              No characters yet.{" "}
              <a href="https://play.shinyms.com" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                Launch the game →
              </a>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
              {account.characters.map(c => (
                <Link
                  key={c.id}
                  href={`/character/${encodeURIComponent(c.name)}`}
                  className="flex items-center justify-between px-5 py-3.5 hover-row"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
                      Lv. <span className="font-mono font-bold" style={{ color: 'var(--foreground-muted)' }}>{c.level}</span>
                    </span>
                    <span className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>{getJobName(c.job)}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'var(--foreground-subtle)', opacity: 0.5 }}>
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  )
}
