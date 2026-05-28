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
        className="w-full max-w-sm mx-auto"
        style={{
          background: 'linear-gradient(to bottom, #f8efd0 0%, #e8dcc0 100%)',
          border: '3px solid #5a3e2a',
          boxShadow: 'inset 0 0 0 2px #fff, 4px 4px 0 rgba(0,0,0,0.25)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Pixel title bar like NPC box */}
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{
            background: 'linear-gradient(to bottom, #3a5a8a 0%, #2a4060 100%)',
            borderBottom: '2px solid #5a3e2a',
          }}
        >
          <Sprite
            src="/maple/items/maple-leaf.png"
            alt=""
            height={16}
            grounded={false}
          />
          <span
            style={{
              fontFamily: 'var(--ms-font-d)',
              fontSize: 10,
              color: '#fff8d8',
              letterSpacing: 1,
            }}
          >
            EMAIL PREFERENCES
          </span>
        </div>

        <div className="px-5 py-6 text-center">
          <div className="flex justify-center mb-3">
            <Sprite
              src="/maple/mobs/red-snail.gif"
              alt=""
              height={48}
              anim="hop"
              grounded={false}
            />
          </div>
          <h1
            style={{
              fontFamily: 'var(--ms-font-d)',
              fontSize: 12,
              color: '#3a2418',
              letterSpacing: 1,
              margin: '0 0 8px',
            }}
          >
            ShinyMS
          </h1>
          <p
            style={{
              fontFamily: 'var(--ms-font-b)',
              fontSize: 20,
              color: '#5a4a30',
              margin: '0 0 12px',
            }}
          >
            Email Preferences
          </p>
          <UnsubscribeForm token={token} />
        </div>
      </div>
    </AuthBackdrop>
  )
}
