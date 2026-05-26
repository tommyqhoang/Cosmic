import Link from 'next/link'
import { getSocialLinks } from '@/lib/settings'
import { SOCIAL_PLATFORMS, type SocialId } from '@/lib/social'

// Brand glyphs for each social platform, keyed by platform id.
const SOCIAL_ICONS: Record<SocialId, React.ReactNode> = {
  youtube: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.51A3.02 3.02 0 00.5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 002.12 2.14c1.88.51 9.38.51 9.38.51s7.5 0 9.38-.51a3.02 3.02 0 002.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z" />
    </svg>
  ),
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 01-1.38-.9 3.7 3.7 0 01-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.95c-3.15 0-3.52.01-4.76.07-1.15.05-1.77.24-2.19.41-.55.21-.94.47-1.35.88-.41.41-.67.8-.88 1.35-.16.42-.36 1.04-.41 2.19-.06 1.24-.07 1.61-.07 4.76s.01 3.52.07 4.76c.05 1.15.25 1.77.41 2.19.21.55.47.94.88 1.35.41.41.8.67 1.35.88.42.16 1.04.36 2.19.41 1.24.06 1.61.07 4.76.07s3.52-.01 4.76-.07c1.15-.05 1.77-.25 2.19-.41.55-.21.94-.47 1.35-.88.41-.41.67-.8.88-1.35.16-.42.36-1.04.41-2.19.06-1.24.07-1.61.07-4.76s-.01-3.52-.07-4.76c-.05-1.15-.25-1.77-.41-2.19a3.63 3.63 0 00-.88-1.35 3.63 3.63 0 00-1.35-.88c-.42-.16-1.04-.36-2.19-.41-1.24-.06-1.61-.07-4.76-.07zm0 3.32a4.57 4.57 0 110 9.14 4.57 4.57 0 010-9.14zm0 7.54a2.97 2.97 0 100-5.94 2.97 2.97 0 000 5.94zm5.82-7.76a1.07 1.07 0 11-2.14 0 1.07 1.07 0 012.14 0z" />
    </svg>
  ),
  facebook: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  ),
}

const FOOTER_NAV: { heading: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    heading: 'Play',
    links: [
      { href: 'https://play.shinyms.com', label: 'Play Now', external: true },
      { href: '/register', label: 'Create Account' },
      { href: '/login', label: 'Web Login' },
      { href: '/guide', label: 'Getting Started' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { href: '/community', label: 'Community' },
      { href: '/rankings', label: 'Rankings' },
      { href: '/guilds', label: 'Guilds' },
      { href: '/vote', label: 'Vote for Rewards' },
      { href: '/news', label: 'News & Updates' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
  {
    heading: 'Server',
    links: [
      { href: '/status', label: 'Server Status' },
      { href: '/bosses', label: 'Bosses' },
      { href: '/drops', label: 'Drop Search' },
      { href: '/characters', label: 'Characters' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/terms', label: 'Terms of Service' },
      { href: '/privacy', label: 'Privacy Policy' },
    ],
  },
]

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const className = 'text-sm transition-colors duration-150 hover:text-[var(--primary)]'
  const style = { color: 'var(--foreground-muted)' }
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
      {label}
    </a>
  ) : (
    <Link href={href} className={className} style={style}>
      {label}
    </Link>
  )
}

export default async function Footer() {
  const year = new Date().getFullYear()
  const social = await getSocialLinks()
  const socialLinks = SOCIAL_PLATFORMS.filter((p) => social[p.id])
  return (
    <footer style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-raised)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand + Play CTA */}
          <div className="col-span-2 lg:col-span-2">
            <p className="font-display font-bold text-lg" style={{ color: 'var(--navy)', letterSpacing: '0.06em' }}>
              ShinyMS
            </p>
            <p className="text-sm mt-2 max-w-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              A free, nostalgic MapleStory v83 private server. Play instantly in your browser — no download, no pay-to-win.
            </p>

            <a
              href="https://play.shinyms.com"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--accent)', color: '#fff', boxShadow: '0 2px 14px rgba(200,154,46,0.3)' }}
            >
              Play Now →
            </a>

            {/* Discord */}
            <div className="mt-5">
              <a
                href="https://discord.gg/jKueJFAErs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150 hover:text-[var(--primary)]"
                style={{ color: 'var(--foreground-muted)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join our Discord
              </a>
            </div>

            {/* Social media — only rendered for links the admin has set */}
            {socialLinks.length > 0 && (
              <div className="mt-5 flex items-center gap-3">
                {socialLinks.map((p) => (
                  <a
                    key={p.id}
                    href={social[p.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={p.label}
                    title={p.label}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-150 hover:scale-105"
                    style={{ color: 'var(--foreground-muted)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                  >
                    {SOCIAL_ICONS[p.id]}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Nav columns */}
          {FOOTER_NAV.map(({ heading, links }) => (
            <nav key={heading} className="flex flex-col gap-3">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--foreground-subtle)' }}>
                {heading}
              </p>
              {links.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          ))}
        </div>

        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
            © {year} ShinyMS — Fan-made server for nostalgic purposes.
          </p>
          <p className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>
            Not affiliated with or endorsed by Nexon. MapleStory is a trademark of Nexon.
          </p>
        </div>
      </div>
    </footer>
  )
}
