'use client'
import { useState, useMemo } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Turnstile from '@/components/Turnstile'
import AuthBackdrop from '@/components/maple/AuthBackdrop'
import SectionBanner from '@/components/maple/SectionBanner'
import NpcBox from '@/components/maple/NpcBox'

type Field = 'name' | 'password' | 'confirm' | 'email' | 'birthday'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

function passwordStrength(p: string) {
  let s = 0
  if (p.length >= 6) s++
  if (p.length >= 10) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/[0-9]/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s
}

const STRENGTH_LABEL = ['', 'Weak', 'OK', 'Good', 'Strong', 'Excellent']
const STRENGTH_COLOR = ['#8a6f3c', '#c64b1b', '#e2a020', '#c08820', '#4caf30', '#2e7a18']

function validateName(n: string) {
  if (!n) return ''
  if (n.length < 4) return 'Too short (4 min).'
  if (n.length > 13) return 'Too long (13 max).'
  if (!/^[a-zA-Z0-9_]+$/.test(n)) return 'Letters, numbers, _ only.'
  return ''
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<Record<Field, string>>({
    name: '', password: '', confirm: '', email: '', birthday: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0) // bump to remount/reset the widget
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [showPassword, setShowPassword] = useState(false)

  const captchaRequired = Boolean(TURNSTILE_SITE_KEY)
  const canSubmit = agreed && (!captchaRequired || captchaToken !== '') && !loading

  const update = (field: Field, value: string) => setForm(f => ({ ...f, [field]: value }))
  const blur = (field: Field) => setTouched(t => ({ ...t, [field]: true }))
  const resetCaptcha = () => {
    setCaptchaToken('')
    setCaptchaKey(k => k + 1)
  }

  const nameErr = useMemo(() => validateName(form.name), [form.name])
  const pwdScore = useMemo(() => passwordStrength(form.password), [form.password])
  const pwdErr = form.password && form.password.length < 6 ? 'Min. 6 characters.' : ''
  const confirmErr = form.confirm && form.confirm !== form.password ? 'Passwords do not match.' : ''
  const emailErr = form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? 'Check your email format.' : ''

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setTouched({ name: true, password: true, confirm: true, email: true, birthday: true })
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
        resetCaptcha() // Turnstile tokens are single-use — get a fresh one for retry.
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
        resetCaptcha()
        return
      }
      router.push('/')
      router.refresh()
    } catch {
      setError('Network error. Please check your connection and try again.')
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthBackdrop className="max-w-2xl">
      {/* Floating sprites */}
      <img
        src="/maple/mobs/slime.gif"
        alt=""
        className="sprite sprite-bob absolute pointer-events-none"
        style={{ top: 24, left: '6%', width: 56, height: 'auto', zIndex: 5 }}
      />
      <img
        src="/maple/mobs/pig.gif"
        alt=""
        className="sprite sprite-bob absolute pointer-events-none"
        style={{ top: 70, right: '8%', width: 48, height: 'auto', animationDelay: '0.4s', zIndex: 5 }}
      />
      <img
        src="/maple/mobs/orange-mushroom.gif"
        alt=""
        className="sprite sprite-hop absolute pointer-events-none"
        style={{ bottom: 100, left: '12%', width: 44, height: 'auto', animationDelay: '0.8s', zIndex: 5 }}
      />
      <img
        src="/maple/mobs/snail.gif"
        alt=""
        className="sprite sprite-bob absolute pointer-events-none"
        style={{ bottom: 110, right: '14%', width: 38, height: 'auto', animationDelay: '1.2s', zIndex: 5 }}
      />

      <div className="relative z-10 w-full flex flex-col items-center">
        {/* Hero */}
        <div className="text-center mb-6 px-4">
          <SectionBanner>WELCOME · NEW ADVENTURER</SectionBanner>
          <h1 className="ms-hero-title">Create your account</h1>
          <div className="mt-3 mb-6">
            <span className="ms-hero-sub">
              Pick a name. Pick a password. You&apos;re playing in thirty seconds.
            </span>
          </div>
        </div>

        {/* Form inside NPC box */}
        <div className="w-full px-4 pb-8">
          <NpcBox title="CREATE AN ACCOUNT" npcName="Maple Admin" npcCls="gm">
            <p className="mb-3" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 21, lineHeight: 1.3, color: 'var(--ms-text)' }}>
              Pick a name and password. You&apos;ll be in Henesys within thirty seconds.
              Free forever, no pay-to-win.
            </p>

            {error && (
              <div
                className="mb-3 px-4 py-2"
                style={{
                  background: '#fef2f2',
                  border: '2px solid #b91c1c',
                  color: '#b91c1c',
                  fontFamily: 'var(--ms-font-b)',
                  fontSize: 18,
                }}
              >
                ⚠ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Username */}
              <div>
                <label className="block mb-1" style={{ fontFamily: 'var(--ms-font-d)', fontSize: 11, letterSpacing: 1, color: '#2a1810' }}>
                  USERNAME <span className="opacity-70">({form.name.length}/13)</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value.replace(/\s/g, ''))}
                  onBlur={() => blur('name')}
                  placeholder="MapleHero42"
                  maxLength={13}
                  autoFocus
                  required
                  className="w-full min-h-[44px] px-3 py-2"
                  style={{
                    fontFamily: 'var(--ms-font-b)',
                    fontSize: 20,
                    background: '#fff8d8',
                    border: '2px solid #2a1810',
                    color: '#2a1810',
                    boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.1)',
                    outline: 'none',
                  }}
                />
                {touched.name && nameErr && (
                  <div className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#c64b1b' }}>
                    ⚠ {nameErr}
                  </div>
                )}
              </div>

              {/* Password + Confirm */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1" style={{ fontFamily: 'var(--ms-font-d)', fontSize: 11, letterSpacing: 1, color: '#2a1810' }}>
                    PASSWORD
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    onBlur={() => blur('password')}
                    placeholder="••••••••"
                    minLength={6}
                    required
                    className="w-full min-h-[44px] px-3 py-2"
                    style={{
                      fontFamily: 'var(--ms-font-b)',
                      fontSize: 20,
                      background: '#fff8d8',
                      border: '2px solid #2a1810',
                      color: '#2a1810',
                      boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.1)',
                      outline: 'none',
                    }}
                  />
                  {touched.password && pwdErr && (
                    <div className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#c64b1b' }}>
                      ⚠ {pwdErr}
                    </div>
                  )}
                  {form.password && (
                    <div className="mt-2">
                      <div style={{ display: 'flex', gap: 2, height: 8, border: '2px solid #1a0a04', background: '#1a0a04' }}>
                        {[1,2,3,4,5].map(i => (
                          <div
                            key={i}
                            className="flex-1"
                            style={{
                              background: i <= pwdScore ? STRENGTH_COLOR[pwdScore] : '#3a2418',
                            }}
                          />
                        ))}
                      </div>
                      <div className="mt-1" style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: STRENGTH_COLOR[pwdScore] }}>
                        {STRENGTH_LABEL[pwdScore]}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-1" style={{ fontFamily: 'var(--ms-font-d)', fontSize: 11, letterSpacing: 1, color: '#2a1810' }}>
                    CONFIRM{' '}
                    <span
                      className="cursor-pointer underline decoration-dotted"
                      style={{ color: '#c64b1b' }}
                      onClick={() => setShowPassword(s => !s)}
                    >
                      {showPassword ? '🙈 hide' : '👁 show'}
                    </span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => update('confirm', e.target.value)}
                    onBlur={() => blur('confirm')}
                    placeholder="repeat password"
                    required
                    className="w-full min-h-[44px] px-3 py-2"
                    style={{
                      fontFamily: 'var(--ms-font-b)',
                      fontSize: 20,
                      background: '#fff8d8',
                      border: '2px solid #2a1810',
                      color: '#2a1810',
                      boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.1)',
                      outline: 'none',
                    }}
                  />
                  {touched.confirm && confirmErr && (
                    <div className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#c64b1b' }}>
                      ⚠ {confirmErr}
                    </div>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1" style={{ fontFamily: 'var(--ms-font-d)', fontSize: 11, letterSpacing: 1, color: '#2a1810' }}>
                  EMAIL <span className="opacity-70">for password resets</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  onBlur={() => blur('email')}
                  placeholder="adventurer@maplemail.com"
                  required
                  className="w-full min-h-[44px] px-3 py-2"
                  style={{
                    fontFamily: 'var(--ms-font-b)',
                    fontSize: 20,
                    background: '#fff8d8',
                    border: '2px solid #2a1810',
                    color: '#2a1810',
                    boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.1)',
                    outline: 'none',
                  }}
                />
                {touched.email && emailErr && (
                  <div className="mt-1" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 18, color: '#c64b1b' }}>
                    ⚠ {emailErr}
                  </div>
                )}
              </div>

              {/* Birthday */}
              <div>
                <label className="block mb-1" style={{ fontFamily: 'var(--ms-font-d)', fontSize: 11, letterSpacing: 1, color: '#2a1810' }}>
                  BIRTHDAY
                </label>
                <input
                  type="date"
                  value={form.birthday}
                  onChange={e => update('birthday', e.target.value)}
                  onBlur={() => blur('birthday')}
                  required
                  className="w-full min-h-[44px] px-3 py-2"
                  style={{
                    fontFamily: 'var(--ms-font-b)',
                    fontSize: 20,
                    background: '#fff8d8',
                    border: '2px solid #2a1810',
                    color: '#2a1810',
                    boxShadow: 'inset 2px 2px 0 rgba(0,0,0,0.1)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: '#2a1810' }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  required
                  className="mt-1 shrink-0 min-w-[18px] min-h-[18px]"
                  style={{ accentColor: '#c64b1b' }}
                />
                <span>
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="font-semibold hover:underline" style={{ color: '#c64b1b' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" target="_blank" className="font-semibold hover:underline" style={{ color: '#c64b1b' }}>
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>

              {/* Captcha */}
              {captchaRequired && TURNSTILE_SITE_KEY && (
                <Turnstile key={captchaKey} siteKey={TURNSTILE_SITE_KEY} onToken={setCaptchaToken} />
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="ms-btn ms-btn-green w-full justify-center mt-1"
                style={{ opacity: canSubmit ? 1 : 0.6, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
              >
                {loading ? '⏳ CREATING…' : '+ CREATE ACCOUNT'}
              </button>

              <div className="text-center mt-2" style={{ fontFamily: 'var(--ms-font-b)', fontSize: 20, color: '#4a3220' }}>
                Already have one?{' '}
                <Link href="/login" className="font-bold hover:underline" style={{ color: '#c64b1b', textDecoration: 'underline dotted' }}>
                  Sign in →
                </Link>
              </div>
            </form>
          </NpcBox>
        </div>
      </div>
    </AuthBackdrop>
  )
}
