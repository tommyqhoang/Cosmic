import type { Metadata } from 'next'
import { Geist, Geist_Mono, Fredoka, Press_Start_2P, VT323, Pixelify_Sans } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Providers from '@/components/layout/Providers'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })
const fredoka = Fredoka({
  subsets: ['latin'],
  variable: '--font-fredoka',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})
const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-press-start-2p',
  display: 'swap',
})
const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323',
  display: 'swap',
})
const pixelifySans = Pixelify_Sans({
  subsets: ['latin'],
  variable: '--font-pixelify-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://shinyms.com'),
  title: {
    default: 'ShinyMS — Free MapleStory v83 Private Server',
    template: '%s | ShinyMS',
  },
  description: 'ShinyMS is a free MapleStory v83 private server. Relive the golden era of MapleStory — no pay-to-win, no download, just pure nostalgia.',
  keywords: [
    'MapleStory private server', 'MapleStory v83', 'ShinyMS', 'free MMORPG',
    'MapleStory GMS', 'old MapleStory', 'nostalgia MapleStory', 'maplestory 2025',
    'private server free to play', 'low rate maplestory',
  ],
  authors: [{ name: 'ShinyMS', url: 'https://shinyms.com' }],
  creator: 'ShinyMS',
  publisher: 'ShinyMS',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://shinyms.com',
    siteName: 'ShinyMS',
    title: 'ShinyMS — Free MapleStory v83 Private Server',
    description: 'ShinyMS is a free MapleStory v83 private server. Relive the golden era — no pay-to-win, no download.',
    images: [{ url: '/shinyms-logo.png', width: 1254, height: 1254, alt: 'ShinyMS — MapleStory v83 Private Server' }],
  },
  twitter: {
    card: 'summary',
    title: 'ShinyMS — Free MapleStory v83 Private Server',
    description: 'Free MapleStory v83 private server. No pay-to-win, no download — play instantly in your browser.',
    images: ['/shinyms-logo.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
  alternates: {
    canonical: 'https://shinyms.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${fredoka.variable} ${pressStart2P.variable} ${vt323.variable} ${pixelifySans.variable} h-full`}>
      <body
        className="min-h-screen flex flex-col antialiased"
        style={{
          background:
            'linear-gradient(to bottom, #7ec4f5 0%, #7ec4f5 35%, #b8e0fa 35%, #b8e0fa 60%, #6ab84a 60%, #6ab84a 75%, #3d7a2e 75%, #c79858 78%, #8b5e2a 100%)',
          backgroundAttachment: 'fixed',
          color: 'var(--foreground)',
        }}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
