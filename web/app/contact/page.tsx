import type { Metadata } from 'next'
import Link from 'next/link'
import NpcBox from '@/components/maple/NpcBox'
import SectionBanner from '@/components/maple/SectionBanner'
import ContactForm from '@/components/contact/ContactForm'
import { getSocialLinks } from '@/lib/settings'

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

const EXPECT = [
  { icon: '👀', title: 'We read every message', text: 'A real person on the team reviews each submission — no auto-responders.' },
  { icon: '📧', title: 'Replies come by email', text: 'Make sure the email you enter is correct; that’s how we follow up.' },
  { icon: '⚖️', title: 'Appeals are reviewed fairly', text: 'Ban appeals go straight to staff. Be honest and include any proof you have.' },
]

export default async function ContactPage() {
  const social = await getSocialLinks()
  const discordUrl = social.discord || 'https://discord.gg/jKueJFAErs'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 relative">
      {/* Floating sprite decorations */}
      <img
        src="/maple/mobs/blue-snail.gif"
        alt=""
        className="sprite sprite-hop absolute -left-4 top-32 hidden lg:block"
        width={48}
        height={48}
        aria-hidden
      />
      <img
        src="/maple/mobs/pig.gif"
        alt=""
        className="sprite sprite-bob absolute -right-4 top-60 hidden lg:block"
        width={48}
        height={48}
        aria-hidden
      />
      <img
        src="/maple/mobs/red-snail.gif"
        alt=""
        className="sprite sprite-sway absolute left-8 bottom-20 hidden lg:block"
        width={40}
        height={40}
        aria-hidden
      />

      {/* Hero */}
      <div className="mb-8 text-center sm:text-left">
        <SectionBanner>Contact Us</SectionBanner>
        <h1 className="ms-hero-title">Send a message</h1>
        <p className="ms-hero-sub mt-3">Pick the option that fits best and we’ll get back to you by email.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start">
        {/* Form */}
        <NpcBox title="Send us a message" npcName="Maya">
          <div style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18 }}>
            <ContactForm />
          </div>
        </NpcBox>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5">
          {/* Discord CTA */}
          <div className="ms-pixel-panel p-0">
            <div
              className="px-4 py-3"
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 11,
                letterSpacing: 1,
                color: '#ffd96b',
                background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)',
                borderBottom: '3px solid var(--ms-npc-border-out)',
              }}
            >
              💬 Prefer Discord?
            </div>
            <div className="p-4" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: 'var(--ms-text)' }}>
              <p className="mb-4">For quick questions, the fastest way to reach us — and the rest of the community — is our Discord server.</p>
              <a
                href={discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ms-btn ms-btn-sm"
              >
                Join our Discord →
              </a>
            </div>
          </div>

          {/* What to expect */}
          <div className="ms-pixel-panel p-0">
            <div
              className="px-4 py-3"
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 11,
                letterSpacing: 1,
                color: '#ffd96b',
                background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)',
                borderBottom: '3px solid var(--ms-npc-border-out)',
              }}
            >
              What to expect
            </div>
            <ul className="flex flex-col gap-3 p-4">
              {EXPECT.map((e) => (
                <li key={e.title} className="flex gap-3" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: 'var(--ms-text)' }}>
                  <span aria-hidden className="text-lg shrink-0">{e.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--ms-font-d)', fontSize: 10, color: '#c64b1b', letterSpacing: 1 }}>{e.title}</div>
                    <p className="mt-0.5 leading-snug" style={{ color: '#4a3220' }}>{e.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Before you write */}
          <div className="ms-pixel-panel p-0">
            <div
              className="px-4 py-3"
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 11,
                letterSpacing: 1,
                color: '#ffd96b',
                background: 'linear-gradient(to bottom, #6a4830 0%, #4a3220 100%)',
                borderBottom: '3px solid var(--ms-npc-border-out)',
              }}
            >
              Before you write
            </div>
            <div className="p-4" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: 'var(--ms-text)' }}>
              <p className="mb-3" style={{ color: '#4a3220' }}>Your question may already be answered — check these first.</p>
              <div className="flex flex-col gap-2">
                <Link href="/guide" className="ms-btn ms-btn-sm">
                  📖 Player Guide &amp; FAQ
                </Link>
                <Link href="/status" className="ms-btn ms-btn-sm">
                  📡 Server Status
                </Link>
                <Link href="/privacy" className="ms-btn ms-btn-sm">
                  🔒 Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
