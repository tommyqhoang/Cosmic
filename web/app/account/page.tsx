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
          <h1 className="ms-section-title" style={{ margin: 0 }}>
            My Account
          </h1>
          <p className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#4a3220' }}>
            Manage your ShinyMS account
          </p>
        </div>
      </div>

      {/* Ban notice */}
      {account.banned === 1 && (
        <div
          className="ms-pixel-panel p-4 mb-6"
          style={{ borderColor: '#c64b1b', background: '#fef2f2' }}
        >
          <p style={{ fontFamily: 'var(--ms-font-d)', fontSize: '10px', color: '#c64b1b' }}>Your account is banned.</p>
          {account.banreason && <p className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#4a3220' }}>Reason: {account.banreason}</p>}
          <p className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '16px', color: '#4a3220' }}>To appeal, contact an admin on Discord.</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Play CTA */}
        <div className="ms-pixel-panel p-4">
          <a
            href="https://play.shinyms.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ms-btn ms-btn-green"
            style={{ display: 'flex', width: '100%', justifyContent: 'center' }}
          >
            Jump back into the game →
          </a>
          <p className="text-center mt-3" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#4a3220' }}>
            Play instantly in your browser. No download needed.
          </p>
        </div>

        {/* Currency cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'NX Credit', value: (account.nxCredit ?? 0).toLocaleString() },
            { label: 'MaplePoints', value: (account.maplePoint ?? 0).toLocaleString() },
            { label: 'Vote Points', value: account.votepoints.toLocaleString() },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="ms-pixel-panel p-4 text-center"
            >
              <div
                className="mb-2 uppercase tracking-widest"
                style={{ fontFamily: 'var(--ms-font-d)', fontSize: '9px', color: '#4a3220' }}
              >
                {label}
              </div>
              <div style={{ fontFamily: 'var(--ms-font-d)', fontSize: '14px', color: '#2a1810' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="ms-pixel-panel overflow-hidden">
          <div
            className="px-5 py-3"
            style={{
              background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 50%, #3a2418 100%)',
              borderBottom: '3px solid #2a1810',
            }}
          >
            <h2 style={{ fontFamily: 'var(--ms-font-d)', fontSize: '11px', color: '#ffd96b', letterSpacing: '1px' }}>Account Info</h2>
          </div>
          <div>
            {[
              { label: 'Username', value: account.name },
              { label: 'Email', value: account.email ?? '—' },
              { label: 'Joined', value: new Date(account.createdat).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: 'Last Login', value: account.lastlogin ? new Date(account.lastlogin).toLocaleString() : '—' },
            ].map(({ label, value }, i) => (
              <div
                key={label}
                className="flex items-center justify-between px-5 py-3"
                style={{
                  backgroundColor: i % 2 === 0 ? 'var(--ms-panel-bg)' : '#f0dfb0',
                  borderBottom: '1px solid var(--ms-slot-shadow)',
                }}
              >
                <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#4a3220' }}>{label}</span>
                <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#2a1810' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Characters */}
        <div className="ms-pixel-panel overflow-hidden">
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 50%, #3a2418 100%)',
              borderBottom: '3px solid #2a1810',
            }}
          >
            <h2 style={{ fontFamily: 'var(--ms-font-d)', fontSize: '11px', color: '#ffd96b', letterSpacing: '1px' }}>Characters</h2>
            <span
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: '9px',
                backgroundColor: '#f8c34a',
                color: '#2a1810',
                border: '2px solid #3a2418',
                padding: '2px 6px',
                boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
              }}
            >
              {account.characters.length}
            </span>
          </div>
          {account.characters.length === 0 ? (
            <div className="px-5 py-10 text-center" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '20px', color: '#4a3220' }}>
              No characters yet.{" "}
              <a href="https://play.shinyms.com" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: '#c64b1b' }}>
                Launch the game →
              </a>
            </div>
          ) : (
            <div>
              {account.characters.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/character/${encodeURIComponent(c.name)}`}
                  className="flex flex-wrap items-center justify-between px-5 py-3 transition-colors hover:bg-[var(--ms-slot-hover)] gap-y-1"
                  style={{
                    backgroundColor: i % 2 === 0 ? 'var(--ms-panel-bg)' : '#f0dfb0',
                    borderBottom: '1px solid var(--ms-slot-shadow)',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: '#f8c34a',
                        border: '2px solid #3a2418',
                        fontFamily: 'var(--ms-font-d)',
                        fontSize: '10px',
                        color: '#2a1810',
                        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                      }}
                    >
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '18px', color: '#2a1810', fontWeight: 600 }}>{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span style={{ fontFamily: 'var(--ms-font-b)', fontSize: '16px', color: '#4a3220' }}>
                      Lv. <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: '10px', color: '#2a1810' }}>{c.level}</span>
                    </span>
                    <span className="hidden sm:inline" style={{ fontFamily: 'var(--ms-font-b)', fontSize: '16px', color: '#4a3220' }}>{getJobName(c.job)}</span>
                    <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: '12px', color: '#4a3220' }}>›</span>
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
