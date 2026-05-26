import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your ShinyMS account to manage your characters and settings.',
  robots: { index: false, follow: false },
  alternates: { canonical: 'https://shinyms.com/login' },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
