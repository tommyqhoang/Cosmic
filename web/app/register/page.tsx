'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Turnstile from '@/components/Turnstile'
import AuthBackdrop from '@/components/maple/AuthBackdrop'
import Sprite from '@/components/maple/Sprite'

type Field = 'name' | 'password' | 'confirm' | 'email' | 'birthday'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<Record<Field, string>>({
    name: '', password: '', confirm: '', email: '', birthday: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const captchaRequired = Boolean(TURNSTILE_SITE_KEY)
  const canSubmit = agreed && (!captchaRequired || captchaToken !== '') && !loading

  const update = (field: Field, value: string) => setForm(f => ({ ...f, [field]: value }))

  const inputStyle = {
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--foreground)',
    outline: 'none',
  }
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'var(--primary)')
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.currentTarget.style.borderColor = 'var(--border)')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (!agreed) { setError('You must agree to the Terms of Service and Privacy Policy.'); return }
    if (captchaRequired && !captchaToken) { setError('Please complete the captcha.'); return }
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, password: form.password, email: form.email, birthday: form.birthday, captchaToken }),
      })
      // The error path can return a non-JSON body (e.g. a 500 HTML page or an
      // empty 429), so parse defensively instead of letting res.json() throw.
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? 'Registration failed. Please try again.')
        return
      }

      // Account created — sign in. If sign-in fails (e.g. rate-limited), keep the
      // user on this page with a clear message rather than navigating home logged out.
      const signInResult = await signIn('credentials', {
        name: form.name,
        password: form.password,
        redirect: false,
      })
      if (signInResult?.error) {
        setError('Account created, but automatic sign-in failed. Please sign in manually.')
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthBackdrop>
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--surface)',
            border: '2px solid #2a4a73',
            boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.7), 0 16px 40px -12px rgba(26,58,92,0.5)',
          }}
        >
          <div className="text-center mb-6">
            <div className="flex justify-center mb-2">
              <Sprite src="/maple/mobs/slime.gif" alt="" height={52} anim="hop" grounded={false} />
            </div>
            <div className="font-display font-bold text-base mb-1" style={{ color: 'var(--navy)', letterSpacing: '0.04em' }}>
              ShinyMS
            </div>
            <h1 className="text-xl font-bold font-display" style={{ color: 'var(--foreground)' }}>Create Account</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
              Join for free — jump straight into the game in your browser
            </p>
          </div>

          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm mb-5"
              style={{ backgroundColor: 'var(--destructive-subtle)', color: 'var(--destructive)', border: '1px solid var(--destructive-border)' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {([
              { field: 'name' as Field, label: 'Username', type: 'text', placeholder: '4–13 characters', extra: { minLength: 4, maxLength: 13, autoFocus: true } },
              { field: 'password' as Field, label: 'Password', type: 'password', placeholder: 'Min. 6 characters', extra: { minLength: 6 } },
              { field: 'confirm' as Field, label: 'Confirm Password', type: 'password', placeholder: '', extra: {} },
              { field: 'email' as Field, label: 'Email', type: 'email', placeholder: 'you@example.com', extra: { required: true } },
              { field: 'birthday' as Field, label: 'Birthday', type: 'date', placeholder: '', extra: { required: true } },
            ] as const).map(({ field, label, type, placeholder, extra }) => (
              <div key={field}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={e => update(field, e.target.value)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder={placeholder}
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-150"
                  style={inputStyle}
                  required
                  {...extra}
                />
              </div>
            ))}

            {/* Terms agreement */}
            <label className="flex items-start gap-2.5 text-sm cursor-pointer" style={{ color: 'var(--foreground-muted)' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                required
                className="mt-0.5 shrink-0"
                style={{ accentColor: 'var(--primary)' }}
              />
              <span>
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" target="_blank" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>Privacy Policy</Link>.
              </span>
            </label>

            {/* CAPTCHA — account creation only (login is protected by rate limiting) */}
            {captchaRequired && TURNSTILE_SITE_KEY && (
              <Turnstile siteKey={TURNSTILE_SITE_KEY} onToken={setCaptchaToken} />
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-150 mt-1"
              style={{
                backgroundColor: canSubmit ? 'var(--primary)' : 'var(--primary-hover)',
                color: '#fff',
                opacity: canSubmit ? 1 : 0.6,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--foreground-subtle)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold" style={{ color: 'var(--primary)' }}>
              Sign in
            </Link>
          </p>
        </div>
    </AuthBackdrop>
  )
}
