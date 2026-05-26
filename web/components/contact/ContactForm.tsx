'use client'
import { useState } from 'react'
import Link from 'next/link'
import Turnstile from '@/components/Turnstile'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

type InquiryType = 'general' | 'appeal' | 'feature' | 'bug'

type FieldDef = {
  name: string
  label: string
  kind: 'text' | 'textarea' | 'select'
  placeholder?: string
  hint?: string
  maxLength?: number
  options?: { value: string; label: string }[]
}

const TYPES: { id: InquiryType; label: string; emoji: string; blurb: string }[] = [
  { id: 'general', label: 'General', emoji: '✉️', blurb: 'Advertising, partnerships, marketing, donations — anything else.' },
  { id: 'appeal', label: 'Ban Appeal', emoji: '⚖️', blurb: 'Think a ban was a mistake? Make your case.' },
  { id: 'feature', label: 'Feature Request', emoji: '✨', blurb: 'Pitch something you’d love to see in-game or on the site.' },
  { id: 'bug', label: 'Bug Report', emoji: '🐛', blurb: 'Something broken? Help us track it down.' },
]

const PROOF_HINT = 'Paste links only (Imgur, YouTube, Streamable…). We can’t accept file uploads here.'

const FIELDS: Record<InquiryType, FieldDef[]> = {
  general: [
    {
      name: 'subtype', label: 'What’s this about?', kind: 'select',
      options: [
        { value: 'advertisement', label: 'Advertisement' },
        { value: 'job', label: 'Job Application' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'donation', label: 'Donation' },
        { value: 'other', label: 'Other' },
      ],
    },
    { name: 'message', label: 'Message', kind: 'textarea', maxLength: 1500, placeholder: 'Tell us what you have in mind…' },
  ],
  appeal: [
    { name: 'username', label: 'In-game username', kind: 'text', maxLength: 13, placeholder: 'The banned account name' },
    { name: 'reason', label: 'Why should the ban be lifted?', kind: 'textarea', maxLength: 1500, placeholder: 'Explain what happened…' },
    { name: 'proof', label: 'Proof', kind: 'textarea', maxLength: 1500, placeholder: 'https://…', hint: PROOF_HINT },
  ],
  feature: [
    { name: 'featureName', label: 'Feature name', kind: 'text', maxLength: 100, placeholder: 'A short title for the idea' },
    { name: 'description', label: 'Description', kind: 'textarea', maxLength: 1500, placeholder: 'How would it work?' },
    { name: 'valueAdd', label: 'What value does it add?', kind: 'textarea', maxLength: 1500, placeholder: 'Why is this worth building?' },
  ],
  bug: [
    { name: 'issueTitle', label: 'Issue title', kind: 'text', maxLength: 100, placeholder: 'A short summary of the bug' },
    { name: 'accountUsername', label: 'Account username', kind: 'text', maxLength: 13, placeholder: 'Your in-game account' },
    { name: 'description', label: 'Description', kind: 'textarea', maxLength: 1500, placeholder: 'What happens, and how do we reproduce it?' },
    { name: 'hardship', label: 'How is it affecting you?', kind: 'textarea', maxLength: 1500, placeholder: 'e.g. can’t log in, lost items, blocked from a quest…' },
    {
      name: 'severity', label: 'Severity', kind: 'select',
      options: [
        { value: 'low', label: 'Low — minor annoyance' },
        { value: 'medium', label: 'Medium — disrupts play' },
        { value: 'high', label: 'High — blocks progress' },
        { value: 'critical', label: 'Critical — game-breaking / data loss' },
      ],
    },
    { name: 'proof', label: 'Proof', kind: 'textarea', maxLength: 1500, placeholder: 'https://…', hint: PROOF_HINT },
  ],
}

// Defaults so select fields always carry a valid value even if the user never
// touches them.
const DEFAULTS: Record<string, string> = { subtype: 'advertisement', severity: 'medium' }

const inputStyle = {
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface)',
  color: 'var(--foreground)',
  outline: 'none',
}
const onFocus = (e: React.FocusEvent<HTMLElement>) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)')
const onBlur = (e: React.FocusEvent<HTMLElement>) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--border)')

export default function ContactForm() {
  const [type, setType] = useState<InquiryType>('general')
  const [email, setEmail] = useState('')
  const [values, setValues] = useState<Record<string, string>>({ ...DEFAULTS })
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaKey, setCaptchaKey] = useState(0) // bump to remount/reset the widget
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const captchaRequired = Boolean(TURNSTILE_SITE_KEY)
  const set = (name: string, value: string) => setValues((v) => ({ ...v, [name]: value }))
  const resetCaptcha = () => {
    setCaptchaToken('')
    setCaptchaKey((k) => k + 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)

    if (captchaRequired && !captchaToken) {
      setStatus({ type: 'error', message: 'Please complete the captcha.' })
      return
    }

    // Assemble only the fields relevant to the chosen type.
    const payload: Record<string, string> = { type, email, captchaToken, _hp: values._hp ?? '' }
    for (const f of FIELDS[type]) {
      payload[f.name] = values[f.name] ?? (f.kind === 'select' ? f.options![0].value : '')
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setStatus({ type: 'error', message: data?.error ?? 'Something went wrong. Please try again.' })
        resetCaptcha() // Turnstile tokens are single-use — get a fresh one for retry.
        return
      }
      setStatus({ type: 'success', message: 'Message sent — thanks! We’ll follow up by email if needed.' })
      setEmail('')
      setValues({ ...DEFAULTS })
      resetCaptcha()
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check your connection and try again.' })
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const activeBlurb = TYPES.find((t) => t.id === type)!.blurb

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-muted)' }}>
          What can we help with?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TYPES.map((t) => {
            const active = t.id === type
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => { setType(t.id); setStatus(null) }}
                className="flex flex-col items-center gap-1 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-150"
                style={{
                  border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                  backgroundColor: active ? 'var(--primary-subtle)' : 'var(--surface)',
                  color: active ? 'var(--primary)' : 'var(--foreground-muted)',
                }}
                aria-pressed={active}
              >
                <span aria-hidden className="text-lg">{t.emoji}</span>
                {t.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--foreground-subtle)' }}>{activeBlurb}</p>
      </div>

      {/* Status banner */}
      {status && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          role={status.type === 'error' ? 'alert' : 'status'}
          style={{
            backgroundColor: status.type === 'success' ? 'var(--success-subtle)' : 'var(--destructive-subtle)',
            color: status.type === 'success' ? 'var(--success)' : 'var(--destructive)',
            border: `1px solid ${status.type === 'success' ? 'var(--success-border, #bbf7d0)' : 'var(--destructive-border)'}`,
          }}
        >
          {status.message}
        </div>
      )}

      {/* Email — required on every type */}
      <Field label="Your email" hint="So we can reply. Required for every request type.">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          required
          maxLength={254}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-150"
          style={inputStyle}
        />
      </Field>

      {/* Type-specific fields */}
      {FIELDS[type].map((f) => (
        <Field key={f.name} label={f.label} hint={f.hint}>
          {f.kind === 'textarea' ? (
            <textarea
              value={values[f.name] ?? ''}
              onChange={(e) => set(f.name, e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              maxLength={f.maxLength}
              placeholder={f.placeholder}
              rows={4}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-150 resize-y"
              style={inputStyle}
            />
          ) : f.kind === 'select' ? (
            <select
              value={values[f.name] ?? f.options![0].value}
              onChange={(e) => set(f.name, e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-150"
              style={inputStyle}
            >
              {f.options!.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={values[f.name] ?? ''}
              onChange={(e) => set(f.name, e.target.value)}
              onFocus={onFocus}
              onBlur={onBlur}
              required
              maxLength={f.maxLength}
              placeholder={f.placeholder}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-all duration-150"
              style={inputStyle}
            />
          )}
        </Field>
      ))}

      {/* Honeypot — hidden from humans; bots that fill it are silently dropped. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
        <label>
          Leave this field empty
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values._hp ?? ''}
            onChange={(e) => set('_hp', e.target.value)}
          />
        </label>
      </div>

      {captchaRequired && TURNSTILE_SITE_KEY && (
        <Turnstile key={captchaKey} siteKey={TURNSTILE_SITE_KEY} onToken={setCaptchaToken} />
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-150"
        style={{
          backgroundColor: 'var(--primary)',
          color: '#fff',
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Sending…' : 'Send message →'}
      </button>

      <p className="text-xs text-center" style={{ color: 'var(--foreground-subtle)' }}>
        Your message is delivered to our staff team. See how we handle it in our{' '}
        <Link href="/privacy" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground-muted)' }}>
        {label}
      </label>
      {children}
      {hint && <p className="text-xs mt-1.5" style={{ color: 'var(--foreground-subtle)' }}>{hint}</p>}
    </div>
  )
}
