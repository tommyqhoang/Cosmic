import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import AdminShell from '@/components/admin/AdminShell'

// The admin console is auth-gated (proxy.ts) and disallowed in robots.txt;
// noindex is an extra guard so no admin URL is ever indexed if one leaks.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
