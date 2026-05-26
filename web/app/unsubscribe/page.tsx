import type { Metadata } from 'next'
import AuthBackdrop from '@/components/maple/AuthBackdrop'
import Sprite from '@/components/maple/Sprite'
import UnsubscribeForm from './UnsubscribeForm'

export const metadata: Metadata = {
  title: 'Unsubscribe',
  description: 'Unsubscribe from ShinyMS announcement emails.',
  robots: { index: false, follow: false },
}

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token = '' } = await searchParams

  return (
    <AuthBackdrop>
      <div
        className="rounded-2xl p-8 max-w-sm w-full"
        style={{
          backgroundColor: 'var(--surface)',
          border: '2px solid #2a4a73',
          boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.7), 0 16px 40px -12px rgba(26,58,92,0.5)',
        }}
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <Sprite src="/maple/mobs/red-snail.gif" alt="" height={52} anim="hop" grounded={false} />
          </div>
          <div className="font-display font-bold text-base mb-1" style={{ color: 'var(--navy)', letterSpacing: '0.04em' }}>
            ShinyMS
          </div>
          <h1 className="text-xl font-bold font-display" style={{ color: 'var(--foreground)' }}>Email Preferences</h1>
        </div>
        <UnsubscribeForm token={token} />
      </div>
    </AuthBackdrop>
  )
}
