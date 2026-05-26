import type { Metadata } from 'next'
import { Geist, Geist_Mono, Fredoka } from 'next/font/google'
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

export const metadata: Metadata = {
  metadataBase: new URL('https://shinyms.com'),
  title: {
    default: 'ShinyMS — Free MapleStory v83 Private Server',
    template: '%s | ShinyMS',
  },
  description: 'ShinyMS is a free MapleStory v83 private server with 7× EXP, 5× Meso & 3× Drop rates. Relive the golden era of MapleStory — no pay-to-win, just pure nostalgia.',
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
    description: 'ShinyMS is a free MapleStory v83 private server with 7× EXP, 5× Meso & 3× Drop rates. Relive the golden era — no pay-to-win.',
    images: [{ url: '/shinyms-logo.png', width: 1254, height: 1254, alt: 'ShinyMS — MapleStory v83 Private Server' }],
  },
  twitter: {
    card: 'summary',
    title: 'ShinyMS — Free MapleStory v83 Private Server',
    description: 'Free MapleStory v83 private server. 7× EXP, 5× Meso & 3× Drop, no pay-to-win.',
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
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${fredoka.variable} h-full`}>
      <body className="min-h-screen flex flex-col antialiased" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
