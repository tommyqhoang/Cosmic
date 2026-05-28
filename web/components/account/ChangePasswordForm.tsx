'use client'
import { useState } from 'react'

const inputStyle = {
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface)',
  color: 'var(--foreground)',
  outline: 'none',
}

export default function ChangePasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: 'New passwords do not match.' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus({ type: 'error', message: data.error ?? 'Failed to update password.' })
      } else {
        setStatus({ type: 'success', message: 'Password updated successfully.' })
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 4px rgba(28,21,39,0.05)' }}
    >
      <div className="px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Change Password</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3">
        {status && (
          <div
            role="alert"
            className="rounded-lg px-4 py-3 text-sm"
            style={{
              backgroundColor: status.type === 'success' ? 'var(--success-subtle)' : 'var(--destructive-subtle)',
              color: status.type === 'success' ? 'var(--success)' : 'var(--destructive)',
              border: `1px solid ${status.type === 'success' ? 'var(--success-border, #bbf7d0)' : 'var(--destructive-border)'}`,
            }}
          >
            {status.message}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="cp-current" className="text-xs font-medium" style={{ color: 'var(--foreground-subtle)' }}>Current Password</label>
          <input
            id="cp-current"
            type="password"
            value={form.currentPassword}
            onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
            required
            autoComplete="current-password"
            className="rounded-lg px-3.5 py-2.5 text-sm"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="cp-new" className="text-xs font-medium" style={{ color: 'var(--foreground-subtle)' }}>New Password</label>
          <input
            id="cp-new"
            type="password"
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            required
            minLength={6}
            autoComplete="new-password"
            className="rounded-lg px-3.5 py-2.5 text-sm"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="cp-confirm" className="text-xs font-medium" style={{ color: 'var(--foreground-subtle)' }}>Confirm New Password</label>
          <input
            id="cp-confirm"
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            required
            autoComplete="new-password"
            className="rounded-lg px-3.5 py-2.5 text-sm"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>
        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: 'var(--primary)', color: '#fff', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}
