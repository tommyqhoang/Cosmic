'use client'
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Field, Input, PageHeader, Spinner } from '@/components/admin/ui'
import { SOCIAL_PLATFORMS, type SocialId, type SocialLinks } from '@/lib/social'

type AllSettings = SocialLinks & {
  contactNpcName: string
  expRate: number
  mesoRate: number
  dropRate: number
}

const EMPTY_SOCIAL = Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, ''])) as SocialLinks
const EMPTY: AllSettings = { ...EMPTY_SOCIAL, contactNpcName: '', expRate: 7, mesoRate: 5, dropRate: 3 }

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AllSettings>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/settings')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load settings (${res.status})`)
        return res.json()
      })
      .then((data: AllSettings) => { if (!cancelled) setSettings({ ...EMPTY, ...data }) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load settings') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function update(key: keyof AllSettings, value: string | number) {
    setSettings((s) => ({ ...s, [key]: value }))
    setSaved(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? 'Failed to save settings')
        return
      }
      setSettings({ ...EMPTY, ...data })
      setSaved(true)
    } catch {
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <Alert onDismiss={() => setError(null)}>{error}</Alert>}
      {saved && <Alert tone="success" onDismiss={() => setSaved(false)}>Settings saved.</Alert>}

      <PageHeader title="Settings" subtitle="Site-wide configuration" />

      <Card className="p-5">
        {loading ? (
          <Spinner label="Loading settings" />
        ) : (
          <form onSubmit={save} className="flex flex-col gap-6">
            {/* General */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>General</h3>
              <Field label="Contact NPC Name" htmlFor="general-contactNpcName">
                <Input
                  id="general-contactNpcName"
                  type="text"
                  value={settings.contactNpcName}
                  onChange={(e) => update('contactNpcName', e.target.value)}
                  placeholder="Maya"
                  maxLength={32}
                />
              </Field>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Name shown on the NPC dialogue box in the Contact page. Defaults to &ldquo;Maya&rdquo; if blank.
              </p>
            </div>

            {/* Server Rates */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Server Rates</h3>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Multipliers shown on the Status page sidebar. Whole numbers only.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <Field label="EXP Rate (×)" htmlFor="rate-exp">
                  <Input
                    id="rate-exp"
                    type="number"
                    min={1}
                    max={1000}
                    value={settings.expRate}
                    onChange={(e) => update('expRate', Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </Field>
                <Field label="Meso Rate (×)" htmlFor="rate-meso">
                  <Input
                    id="rate-meso"
                    type="number"
                    min={1}
                    max={1000}
                    value={settings.mesoRate}
                    onChange={(e) => update('mesoRate', Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </Field>
                <Field label="Drop Rate (×)" htmlFor="rate-drop">
                  <Input
                    id="rate-drop"
                    type="number"
                    min={1}
                    max={1000}
                    value={settings.dropRate}
                    onChange={(e) => update('dropRate', Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </Field>
              </div>
            </div>

            {/* Social links */}
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Social Media Links</h3>
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
                Paste a full URL for each platform. Leave a field blank to hide it — only filled-in links appear in the footer.
              </p>
              {SOCIAL_PLATFORMS.map((p) => (
                <Field key={p.id} label={p.label} htmlFor={`social-${p.id}`}>
                  <Input
                    id={`social-${p.id}`}
                    type="url"
                    inputMode="url"
                    value={settings[p.id as SocialId]}
                    onChange={(e) => update(p.id as SocialId, e.target.value)}
                    placeholder={p.placeholder}
                  />
                </Field>
              ))}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
