import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import ServerStatusWidget from '@/components/ui/ServerStatusWidget'
import ServerClock from '@/components/ui/ServerClock'
import HomeAnnouncements from '@/components/posts/HomeAnnouncements'
import HeroScene from '@/components/maple/HeroScene'
import Sprite from '@/components/maple/Sprite'
import MapleWindow from '@/components/maple/MapleWindow'
import SmegaTicker from '@/components/maple/SmegaTicker'
import NewsletterSignup from '@/components/NewsletterSignup'
import { recentSmegas } from '@/lib/community'
import type { Metadata } from 'next'

// Render fresh on every request. The homepage shows live announcements +
// server status; as a static/ISR page its prefetched snapshot lingered in the
// client Router Cache (static staleTime = 5 min), so logged-in users soft-
// navigating to "/" saw a stale (sometimes empty) announcements list until a
// hard refresh. Dynamic rendering gives the client cache a 0s staleTime, so
// navigations and refreshes always reflect current posts.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  alternates: { canonical: 'https://shinyms.com' },
}

// Structured data is split across two graphs:
//   • VideoGame + Organization — entity grounding for search & generative engines (GEO)
//   • FAQPage — answer-engine optimization (AEO); the Q&A mirrors real homepage copy.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoGame',
  name: 'ShinyMS',
  url: 'https://shinyms.com',
  description: 'ShinyMS is a free MapleStory v83 private server with 7× EXP, 5× Meso & 3× Drop rates, playable instantly in your browser with no download.',
  genre: ['MMORPG', 'Role-playing game'],
  gamePlatform: ['PC', 'Browser'],
  applicationCategory: 'Game',
  operatingSystem: ['Windows', 'macOS', 'Linux'],
  inLanguage: 'en',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
  publisher: {
    '@type': 'Organization',
    name: 'ShinyMS',
    url: 'https://shinyms.com',
    sameAs: ['https://discord.gg/jKueJFAErs'],
  },
}

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is ShinyMS free to play?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. ShinyMS is completely free to play with no pay-to-win mechanics. Everything is earned in-game — there is no cash shop power.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to download anything to play ShinyMS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No download or installer is required. You can play MapleStory v83 instantly in your browser on Windows, macOS, or Linux — just create a free account and click Play.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are the rates on ShinyMS?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ShinyMS runs balanced rates of 7× EXP, 5× Meso, and 3× Drop on the classic GMS v83 version of MapleStory.',
      },
    },
    {
      '@type': 'Question',
      name: 'What version of MapleStory does ShinyMS run?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'ShinyMS runs the nostalgic GMS v83 version, preserving the classic towns, jobs, party quests, and bosses from the golden era of MapleStory.',
      },
    },
  ],
}

async function getPosts() {
  return prisma.cmsPost.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { author: { select: { name: true } } },
    take: 10,
  }).catch(() => [])
}

const SERVER_STATS = [
  { label: 'Version', value: 'v83 GMS' },
  { label: 'EXP Rate', value: '7×' },
  { label: 'Meso Rate', value: '5×' },
  { label: 'Drop Rate', value: '3×' },
]

const FEATURES = [
  {
    title: 'Play Instantly in Your Browser',
    desc: 'No download, no installer, no patch. Click Play and you are in Maple World within seconds — on any machine.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18" />
      </svg>
    ),
  },
  {
    title: 'Fair Rates, Zero Pay-to-Win',
    desc: 'Balanced 7× EXP, 5× Meso & 3× Drop. Everything is earned in-game — no cash shop power, ever.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M5 7h14M7 7l-3 6a3 3 0 006 0L7 7zM17 7l-3 6a3 3 0 006 0l-3-6z" />
      </svg>
    ),
  },
  {
    title: 'Windows, Mac & Linux',
    desc: 'One server, every platform. The same nostalgic v83 experience whether you are on a laptop, desktop or anything in between.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    title: 'A Living Community',
    desc: 'Active players, regular events, guild rankings and a friendly Discord. Adventure with old friends and meet new ones.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
]

const OFFERS = [
  {
    title: 'Jobs',
    desc: 'Every classic v83 class',
    icon: <path d="M14.5 3l-1 4 4-1m-3-3L4 14.5 9.5 20 20 9.5 14.5 3zM7 12l5 5" />,
  },
  {
    title: 'Party Quests',
    desc: 'Run the classic PQs',
    icon: <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />,
  },
  {
    title: 'Commands',
    desc: 'Handy @ shortcuts',
    icon: <path d="M4 17l6-6-6-6M12 19h8" />,
  },
  {
    title: 'Rebirths',
    desc: 'Reset and grow stronger',
    icon: <path d="M23 4v6h-6M1 20v-6h6M3.5 9a9 9 0 0114.85-3.36L23 10M1 14l4.65 4.36A9 9 0 0020.5 15" />,
  },
  {
    title: 'Free Market',
    desc: 'Trade with other players',
    icon: <path d="M3 6h18l-2 13H5L3 6zM3 6L2 2H0M16 10a4 4 0 01-8 0" />,
  },
  {
    title: 'Bossing',
    desc: 'Zakum, Horntail & more',
    icon: <path d="M12 2l2.5 5 5.5.8-4 3.9.95 5.5L12 19.8 7.1 22.2 8 16.7l-4-3.9 5.5-.8L12 2z" />,
  },
  {
    title: 'Henesys Hub',
    desc: 'Hang out with the community',
    icon: <path d="M3 11l9-8 9 8M5 9.5V21h14V9.5M9 21v-6h6v6" />,
  },
  {
    title: 'NX Items',
    desc: 'Cosmetics & gear',
    icon: <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6zM3 6h18M16 10a4 4 0 01-8 0" />,
  },
  {
    title: 'Teleporter',
    desc: 'Fast travel anywhere',
    icon: <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />,
  },
  {
    title: 'Voting Rewards',
    desc: 'Earn NX by voting',
    icon: <path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7L9 3.5A2.12 2.12 0 1112 4a2.12 2.12 0 113-.5L12 7z" />,
  },
  {
    title: 'Pets',
    desc: 'Hatch, raise & equip pets',
    icon: <path d="M11 14c-3 0-5 2-5 4.5a2.5 2.5 0 005 0c0 2.5 2 .5 2-1.5M4.5 9.5a1.5 2 0 102 0 1.5 2 0 10-2 0zM10 6a1.5 2 0 102 0 1.5 2 0 10-2 0zM15.5 9.5a1.5 2 0 102 0 1.5 2 0 10-2 0z" />,
  },
  {
    title: 'Scrolling',
    desc: 'Enhance your gear',
    icon: <path d="M8 3H6a2 2 0 00-2 2v14a2 2 0 002 2h2M16 3h2a2 2 0 012 2v14a2 2 0 01-2 2h-2M8 7h8M8 12h8M8 17h5" />,
  },
  {
    title: 'Gachapon',
    desc: 'Spin tickets for rare prizes',
    icon: <><path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" /><circle cx="12" cy="9" r="3" /><path d="M9 16h6" /></>,
  },
  {
    title: 'Alliance',
    desc: 'Unite guilds under one banner',
    icon: <><path d="M5 22V4" /><path d="M5 4h13l-2.5 4L18 12H5" /></>,
  },
  {
    title: 'Family',
    desc: 'Mentor juniors for bonus EXP',
    icon: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0111 0" /><circle cx="17" cy="10" r="2" /><path d="M15.2 20a3.5 3.5 0 014.8-3.2" /></>,
  },
  {
    title: 'Marriage',
    desc: 'Wed and quest together',
    icon: <><circle cx="9.5" cy="14" r="4.5" /><circle cx="14.5" cy="14" r="4.5" /><path d="M12 4l1.8 2.5h-3.6L12 4z" /></>,
  },
  {
    title: 'Medals',
    desc: 'Earn titles and medals',
    icon: <><path d="M8 3l2.5 6M16 3l-2.5 6" /><circle cx="12" cy="15" r="6" /><path d="M12 12.6l.85 1.7 1.9.28-1.37 1.34.32 1.88L12 17.6l-1.7.9.32-1.88-1.37-1.34 1.9-.28z" /></>,
  },
  {
    title: 'Monster Book',
    desc: 'Collect cards from every mob',
    icon: <><path d="M12 6.5C10.5 5 8 4 4 4v14c4 0 6.5 1 8 2.5 1.5-1.5 4-2.5 8-2.5V4c-4 0-6.5 1-8 2.5z" /><path d="M12 6.5v14" /></>,
  },
]

// Iconic v83 mobs for the "Maple World" parade — sprites served from our
// local pack (public/maple/mobs). Heights tuned so the lineup reads evenly.
const MONSTERS = [
  { src: '/maple/mobs/snail.gif', name: 'Snail', h: 44, anim: 'bob' as const },
  { src: '/maple/mobs/orange-mushroom.gif', name: 'Orange Mushroom', h: 64, anim: 'hop' as const },
  { src: '/maple/mobs/slime.gif', name: 'Slime', h: 56, anim: 'hop' as const },
  { src: '/maple/mobs/pig.gif', name: 'Pig', h: 60, anim: 'bob' as const },
  { src: '/maple/mobs/ribbon-pig.gif', name: 'Ribbon Pig', h: 60, anim: 'bob' as const },
  { src: '/maple/mobs/stump.gif', name: 'Stump', h: 58, anim: 'sway' as const },
  { src: '/maple/mobs/mano.gif', name: 'Mano', h: 76, anim: 'hop' as const },
  { src: '/maple/mobs/mushmom.gif', name: 'Mushmom', h: 80, anim: 'bob' as const },
]

// Endgame bosses for the "test your might" callout band.
const BOSSES = [
  { src: '/maple/mobs/king-slime.gif', name: 'King Slime', h: 84 },
  { src: '/maple/mobs/balrog.gif', name: 'Crimson Balrog', h: 96 },
  { src: '/maple/mobs/zakum.gif', name: 'Zakum', h: 120 },
]

const STEPS = [
  { n: '1', title: 'Create a free account', desc: 'Pick a username and password. It takes about thirty seconds — no email verification hoops.' },
  { n: '2', title: 'Hit Play Now', desc: 'Launch the game straight in your browser. Nothing to install, nothing to configure.' },
  { n: '3', title: 'Start your adventure', desc: 'Choose your class, leave Maple Island and dive back into the world you remember.' },
]

const TESTIMONIALS = [
  {
    quote: 'I have not played MapleStory since high school. Being able to just click a link and be back in Henesys — no launcher, no patching — genuinely got me emotional.',
    name: 'Reqei',
    detail: 'Night Lord · Lv. 142',
    avatar: '/maple/avatars/nightlord.png',
  },
  {
    quote: 'The rates feel exactly right. Fast enough that I can actually progress after work, slow enough that hitting a new level still means something.',
    name: 'Aelith',
    detail: 'Bishop · Lv. 120',
    avatar: '/maple/avatars/bishop.png',
  },
  {
    quote: 'Playing on my Mac with zero setup was the selling point. The community is small but kind, and the events keep me logging in every week.',
    name: 'Borin',
    detail: 'Hero · Lv. 155',
    avatar: '/maple/avatars/hero.png',
  },
]

const QUICK_LINKS = [
  {
    href: '/rankings',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
      </svg>
    ),
    title: 'Rankings',
    desc: 'Top players by level & class',
  },
  {
    href: 'https://play.shinyms.com',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 3l14 9-14 9V3z"/>
      </svg>
    ),
    title: 'Play Now',
    desc: 'Launch the game in your browser',
  },
  {
    href: '/vote',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
    title: 'Vote',
    desc: 'Vote to earn NX rewards',
  },
]

export default async function HomePage() {
  const [posts, smegas] = await Promise.all([getPosts(), recentSmegas(15)])

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      {/* ── Hero — daytime Maple World scene ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #2f74bd 0%, #4a8fce 45%, #79b4e2 78%, #a7d2ef 100%)',
        }}
      >
        <HeroScene />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-32 sm:pb-40 text-center">
          {/* Live status + server clock */}
          <div
            className="inline-flex items-center justify-center gap-3 sm:gap-4 mb-8 px-4 py-2 rounded-full flex-wrap backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(26,58,92,0.35)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <ServerStatusWidget />
            <span className="hidden sm:block" style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
            <ServerClock />
          </div>

          {/* Heading — bubbly outlined MapleStory wordmark */}
          <h1
            className="font-display font-bold leading-tight mb-4 maple-logo-text"
            style={{ fontSize: 'clamp(2.4rem, 6.5vw, 4.25rem)' }}
          >
            Welcome to <span className="maple-logo-accent">ShinyMS</span>
          </h1>
          <p
            className="text-lg sm:text-xl mb-8 max-w-xl mx-auto leading-relaxed font-medium"
            style={{ color: '#fff', textShadow: '0 1px 6px rgba(26,58,92,0.55)' }}
          >
            A nostalgic MapleStory v83 private server. Play instantly in your browser — no download, no install. Windows, Mac &amp; Linux.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://play.shinyms.com"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.03]"
              style={{ backgroundColor: 'var(--accent)', color: '#fff', boxShadow: '0 4px 0 #8a6512, 0 8px 18px rgba(26,58,92,0.35)' }}
            >
              ▶ Play Now
            </a>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.03]"
              style={{ backgroundColor: '#fff', color: 'var(--primary)', boxShadow: '0 4px 0 #b9c7d6, 0 8px 18px rgba(26,58,92,0.25)' }}
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live megaphone ticker (mirrors in-game smegas) ── */}
      <SmegaTicker smegas={smegas} />

      {/* ── Server stats ── */}
      <section style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ backgroundColor: 'var(--border)' }}>
            {SERVER_STATS.map(({ label, value }) => (
              <div key={label} className="px-6 py-4 text-center" style={{ backgroundColor: 'var(--surface)' }}>
                <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--foreground-subtle)' }}>
                  {label}
                </div>
                <div className="font-mono font-bold text-xl" style={{ color: 'var(--primary)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="guide-kicker mb-3">Why ShinyMS</p>
          <h2 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', color: 'var(--foreground)' }}>
            The MapleStory you remember, made effortless
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            Everything that made the golden era great — preserved, balanced and one click away.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="rounded-2xl p-6 hover-card"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,21,39,0.04)' }}
            >
              <div
                className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                style={{ backgroundColor: 'var(--primary-subtle)', color: 'var(--primary)' }}
              >
                {icon}
              </div>
              <h3 className="font-display font-bold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Gameplay screenshot showcase ── */}
      <section style={{ backgroundColor: 'var(--surface-subtle)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            {/* Copy */}
            <div className="order-2 lg:order-1">
              <p className="guide-kicker mb-3">A familiar world</p>
              <h2 className="font-display font-bold mb-4" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', color: 'var(--foreground)' }}>
                Step right back into Maple World
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--foreground-muted)' }}>
                The same hand-drawn towns, the same cozy mushroom houses, the same soundtrack you have not heard in years —
                running live in your browser, exactly as you left it.
              </p>
              <ul className="flex flex-col gap-3 mb-8">
                {['Classic v83 maps, jobs and monsters', 'Pixel-perfect sprites and original UI', 'Smooth, lag-free play right in the tab'].map((line) => (
                  <li key={line} className="flex items-center gap-3 text-sm" style={{ color: 'var(--foreground)' }}>
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0"
                      style={{ backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <a
                href="https://play.shinyms.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.02]"
                style={{ backgroundColor: 'var(--accent)', color: '#fff', boxShadow: '0 2px 16px rgba(200,154,46,0.3)' }}
              >
                Play Now →
              </a>
            </div>

            {/* In-game window — framed like a MapleStory UI panel, not a browser */}
            <div className="order-1 lg:order-2">
              <div className="maple-window">
                <div className="maple-window-title text-sm font-display">
                  <span aria-hidden>🍁</span>
                  Maple World — Live
                  <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ backgroundColor: '#5ee08a' }} />
                    Online
                  </span>
                </div>
                <div className="p-1.5">
                  <Image
                    src="/gameplay.jpeg"
                    alt="ShinyMS gameplay — a character exploring Maple Road with its iconic mushroom house"
                    width={960}
                    height={540}
                    sizes="(max-width: 768px) 100vw, 960px"
                    className="w-full h-auto block rounded-md"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Monsters of Maple World ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="maple-kicker-pill mb-4"><Sprite src="/maple/items/maple-leaf.png" alt="" height={16} anim="none" grounded={false} /> Old friends</p>
          <h2 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', color: 'var(--foreground)' }}>
            The faces you grew up with
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            From your very first snail to Henesys&rsquo; Mushmom — every classic v83 monster, exactly as you remember it.
          </p>
        </div>

        <MapleWindow title="Maple World Field Guide" icon={<span aria-hidden>🍄</span>}>
          <div className="flex flex-wrap items-end justify-center gap-x-8 gap-y-8 py-4">
            {MONSTERS.map((m, i) => (
              <div key={m.name} className="flex flex-col items-center gap-2 w-24">
                <div className="flex items-end" style={{ height: 84 }}>
                  <Sprite src={m.src} alt={m.name} height={m.h} anim={m.anim} delay={i * 220} />
                </div>
                <span className="text-xs font-semibold text-center" style={{ color: 'var(--foreground-muted)' }}>{m.name}</span>
              </div>
            ))}
          </div>
        </MapleWindow>
      </section>

      {/* ── Boss band ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a2438 0%, #2a1f3a 60%, #3a1f2e 100%)', borderTop: '1px solid var(--border)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(rgba(255,90,90,0.08) 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <p className="guide-kicker mb-3" style={{ color: '#e8a23a' }}>End game</p>
          <h2 className="font-display font-bold mb-3 maple-logo-text" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)' }}>
            Then test your might
          </h2>
          <p className="text-base leading-relaxed mb-12 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Gear up, rally a party and take on the bosses that defined the era.
          </p>
          <div className="flex flex-wrap items-end justify-center gap-x-12 gap-y-10">
            {BOSSES.map((b, i) => (
              <div key={b.name} className="flex flex-col items-center gap-3">
                <div className="flex items-end" style={{ height: 124 }}>
                  <Sprite src={b.src} alt={b.name} height={b.h} anim="bob" delay={i * 350} />
                </div>
                <span className="text-sm font-display font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What the server offers ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="guide-kicker mb-3">In the game</p>
          <h2 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', color: 'var(--foreground)' }}>
            Everything packed in
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            From your first party quest to endgame bossing — all the systems you loved, ready to go.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {OFFERS.map(({ title, desc, icon }) => (
            <div
              key={title}
              className="flex items-start gap-3 rounded-xl p-4 hover-card"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-hover)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {icon}
                </svg>
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold leading-tight" style={{ color: 'var(--foreground)' }}>{title}</div>
                <div className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--foreground-subtle)' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How to start ── */}
      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="guide-kicker mb-3">Get started</p>
          <h2 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', color: 'var(--foreground)' }}>
            Playing takes about a minute
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            No downloads, no waiting room. Three quick steps and you are back in the game.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="relative text-center px-4">
              <div
                className="font-display font-bold inline-flex items-center justify-center w-14 h-14 rounded-full mb-5 mx-auto"
                style={{
                  background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
                  color: '#fff',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 14px -4px rgba(26,58,92,0.5)',
                }}
              >
                {n}
              </div>
              <h3 className="font-display font-bold text-base mb-2" style={{ color: 'var(--foreground)' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-150 hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--primary)', color: '#fff', boxShadow: '0 2px 16px rgba(59,110,165,0.3)' }}
          >
            Create Free Account
          </Link>
          <Link
            href="/guide"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
          >
            Read the Guide
          </Link>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ backgroundColor: 'var(--surface-subtle)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="guide-kicker mb-3">From the community</p>
            <h2 className="font-display font-bold mb-3" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.25rem)', color: 'var(--foreground)' }}>
              Loved by returning Maplers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, detail, avatar }) => (
              <figure
                key={name}
                className="rounded-2xl p-6 flex flex-col"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,21,39,0.04)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--accent)" className="mb-4 opacity-80" aria-hidden="true">
                  <path d="M9.5 6C6.5 6 5 8.5 5 11v7h6v-7H7.5C7.5 9.5 8.3 8.5 9.5 8.5V6zm9 0c-3 0-4.5 2.5-4.5 5v7h6v-7h-3.5c0-1.5.8-2.5 2-2.5V6z" />
                </svg>
                <blockquote className="text-sm leading-relaxed flex-1 mb-5" style={{ color: 'var(--foreground)' }}>
                  &ldquo;{quote}&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <span
                    className="inline-flex items-end justify-center w-12 h-12 rounded-full shrink-0 overflow-hidden"
                    style={{ background: 'radial-gradient(circle at 50% 35%, #cfe6fb 0%, #a7d2ef 100%)', border: '1px solid var(--border)' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatar} alt={`${name}'s character`} className="sprite" style={{ height: 46, width: 'auto' }} draggable={false} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{name}</div>
                    <div className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>{detail}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Announcements */}
          <HomeAnnouncements posts={posts} />

          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Quick links */}
            <MapleWindow title="Quick Links" icon={<span aria-hidden>🔗</span>} bodyClassName="p-2">
              <div className="flex flex-col gap-1.5">
                {QUICK_LINKS.map(({ href, icon, title, desc }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 p-3 rounded-lg hover-row"
                  >
                    <span style={{ color: 'var(--primary)' }}>{icon}</span>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{title}</div>
                      <div className="text-xs" style={{ color: 'var(--foreground-subtle)' }}>{desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </MapleWindow>

            {/* Join CTA */}
            <div
              className="rounded-xl p-5 text-center"
              style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
              }}
            >
              <p className="font-display font-bold text-sm mb-1" style={{ color: '#fff', letterSpacing: '0.04em' }}>
                New to ShinyMS?
              </p>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Create a free account and jump straight into the game — no download needed.
              </p>
              <a
                href="https://play.shinyms.com"
                className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-[1.03]"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              >
                Play Now →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Newsletter signup ── */}
      <NewsletterSignup />
    </div>
  )
}
