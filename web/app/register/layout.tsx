import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a free ShinyMS account and start playing MapleStory v83 in minutes. No credit card required.',
  alternates: { canonical: 'https://shinyms.com/register' },
  openGraph: { url: 'https://shinyms.com/register', title: 'Create Free Account | ShinyMS', description: 'Join ShinyMS for free and start your MapleStory v83 adventure.' },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
