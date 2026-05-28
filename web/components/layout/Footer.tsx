import Link from 'next/link'
import Image from 'next/image'
import { getSocialLinks } from '@/lib/settings'

const FOOTER_NAV_BASE = [
  {
    heading: 'PLAY',
    links: [
      { href: 'https://play.shinyms.com', label: 'Play Now', external: true },
      { href: '/register', label: 'Create Account' },
      { href: '/login', label: 'Web Login' },
      { href: '/guide', label: 'Getting Started' },
    ],
  },
  {
    heading: 'SERVER',
    links: [
      { href: '/status', label: 'Status' },
      { href: '/bosses', label: 'Bosses' },
      { href: '/drops', label: 'Drops' },
      { href: '/characters', label: 'Characters' },
    ],
  },
  {
    heading: 'LEGAL',
    links: [
      { href: '/terms', label: 'Terms' },
      { href: '/privacy', label: 'Privacy' },
      { href: '/contact', label: 'Contact' },
    ],
  },
]

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  const style = {
    color: '#d8c08c',
    textDecoration: 'none',
    fontFamily: 'var(--ms-font-b)',
    fontSize: 20,
    display: 'block',
    padding: '2px 0',
  } as React.CSSProperties

  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}>
      {label}
    </a>
  ) : (
    <Link href={href} style={style}>
      {label}
    </Link>
  )
}

export default async function Footer() {
  const year = new Date().getFullYear()
  const social = await getSocialLinks()

  const communityLinks = [
    { href: '/community', label: 'Highlights' },
    { href: '/rankings', label: 'Rankings' },
    { href: '/guilds', label: 'Guilds' },
    { href: '/vote', label: 'Vote' },
    { href: '/news', label: 'News' },
    ...(social.discord ? [{ href: social.discord, label: 'Discord', external: true as const }] : []),
  ]

  const sections = [
    FOOTER_NAV_BASE[0],
    { heading: 'COMMUNITY', links: communityLinks },
    FOOTER_NAV_BASE[1],
    FOOTER_NAV_BASE[2],
  ]

  return (
    <footer
      style={{
        background: 'linear-gradient(to bottom, #3a2418 0%, #1a0a04 100%)',
        borderTop: '3px solid #f8c34a',
        color: '#d8c08c',
        padding: '30px 24px 24px',
        position: 'relative',
        zIndex: 2,
        marginTop: 60,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          }}
        >
          {/* Brand */}
          <div className="col-span-full sm:col-span-2">
            <h4
              style={{
                fontFamily: 'var(--ms-font-d)',
                fontSize: 11,
                color: '#f8c34a',
                letterSpacing: 1,
                margin: '0 0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Image
                src="/maple/items/maple-leaf.png"
                alt=""
                width={18}
                height={18}
                className="inline-block"
                style={{ imageRendering: 'pixelated' }}
              />
              SHINYMS
            </h4>
            <p
              style={{
                fontFamily: 'var(--ms-font-b)',
                fontSize: 19,
                color: '#d8c08c',
                lineHeight: 1.3,
                margin: '0 0 12px',
              }}
            >
              A free, nostalgic MapleStory v83 private server. Play instantly in your browser — no download, no pay-to-win.
            </p>
            <a
              href="https://play.shinyms.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ms-btn ms-btn-sm ms-btn-green"
            >
              ▶ PLAY NOW
            </a>
          </div>

          {sections.map(({ heading, links }) => (
            <div key={heading}>
              <h4
                style={{
                  fontFamily: 'var(--ms-font-d)',
                  fontSize: 11,
                  color: '#f8c34a',
                  letterSpacing: 1,
                  margin: '0 0 12px',
                }}
              >
                {heading}
              </h4>
              {links.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </div>
          ))}
        </div>

        <div
          className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{
            borderTop: '2px dashed #4a3220',
            fontFamily: 'var(--ms-font-b)',
            fontSize: 18,
            color: '#a89060',
          }}
        >
          <p>
            &copy; {year} ShinyMS — Fan-made server for nostalgic purposes.
          </p>
          <p>
            Not affiliated with or endorsed by Nexon. MapleStory is a trademark of Nexon.
          </p>
        </div>
      </div>
    </footer>
  )
}
