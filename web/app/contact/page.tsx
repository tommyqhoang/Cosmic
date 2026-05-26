import type { Metadata } from 'next'
import Link from 'next/link'
import MapleWindow from '@/components/maple/MapleWindow'
import Sprite from '@/components/maple/Sprite'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the ShinyMS team — general inquiries, ban appeals, feature requests, and bug reports. We read every message.',
  alternates: { canonical: 'https://shinyms.com/contact' },
  openGraph: {
    url: 'https://shinyms.com/contact',
    title: 'Contact ShinyMS',
    description: 'Reach the ShinyMS team: inquiries, ban appeals, feature requests, and bug reports.',
  },
}

const cardStyle = {
  backgroundColor: 'var(--surface)',
  border: '1px solid var(--border)',
  boxShadow: '0 1px 6px rgba(28,21,39,0.05)',
} as const

const EXPECT = [
  { emoji: '👀', title: 'We read every message', text: 'A real person on the team reviews each submission — no auto-responders.' },
  { emoji: '📧', title: 'Replies come by email', text: 'Make sure the email you enter is correct; that’s how we follow up.' },
  { emoji: '⚖️', title: 'Appeals are reviewed fairly', text: 'Ban appeals go straight to staff. Be honest and include any proof you have.' },
]

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Sprite src="/maple/mobs/blue-snail.gif" alt="" height={56} anim="hop" grounded={false} className="hidden sm:block shrink-0" />
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>
            Contact Us
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
            Pick the option that fits best and we’ll get back to you by email.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
        {/* Form */}
        <MapleWindow title="Send us a message" bodyClassName="p-5 sm:p-6">
          <ContactForm />
        </MapleWindow>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4">
          {/* Discord CTA */}
          <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)' }}>
            <h2 className="font-display font-bold text-base mb-1" style={{ color: '#fff' }}>💬 Prefer Discord?</h2>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
              For quick questions, the fastest way to reach us — and the rest of the community — is our Discord server.
            </p>
            <a
              href="https://discord.gg/jKueJFAErs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Join our Discord →
            </a>
          </div>

          {/* What to expect */}
          <div className="rounded-2xl p-5" style={cardStyle}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: 'var(--foreground)' }}>What to expect</h2>
            <ul className="flex flex-col gap-3">
              {EXPECT.map((e) => (
                <li key={e.title} className="flex gap-3">
                  <span aria-hidden className="text-lg shrink-0">{e.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>{e.title}</div>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--foreground-muted)' }}>{e.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Before you write */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--primary-subtle)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="font-semibold text-sm mb-2" style={{ color: 'var(--primary)' }}>Before you write</h2>
            <p className="text-xs mb-3" style={{ color: 'var(--foreground-muted)' }}>
              Your question may already be answered — check these first.
            </p>
            <div className="flex flex-col gap-1.5 text-sm">
              <Link href="/guide" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>📖 Player Guide & FAQ</Link>
              <Link href="/status" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>📡 Server Status</Link>
              <Link href="/privacy" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>🔒 Privacy Policy</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
