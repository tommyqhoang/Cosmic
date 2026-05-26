'use client'
import { useEffect, useState } from 'react'
import { Alert, Button, Card, Field, Input, PageHeader, Spinner } from '@/components/admin/ui'
import { SOCIAL_PLATFORMS, type SocialId, type SocialLinks } from '@/lib/social'

const EMPTY = Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, ''])) as SocialLinks

export default function AdminSettingsPage() {
  const [links, setLinks] = useState<SocialLinks>(EMPTY)
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
      .then((data: SocialLinks) => { if (!cancelled) setLinks({ ...EMPTY, ...data }) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load settings') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  function update(id: SocialId, value: string) {
    setLinks((l) => ({ ...l, [id]: value }))
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
        body: JSON.stringify(links),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? 'Failed to save settings')
        return
      }
      setLinks({ ...EMPTY, ...data })
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

      <PageHeader title="Settings" subtitle="Social media links shown in the site footer" />

      <Card className="p-5">
        {loading ? (
          <Spinner label="Loading settings" />
        ) : (
          <form onSubmit={save} className="flex flex-col gap-4">
            <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
              Paste a full URL for each platform. Leave a field blank to hide it — only filled-in links appear in the footer.
            </p>
            {SOCIAL_PLATFORMS.map((p) => (
              <Field key={p.id} label={p.label} htmlFor={`social-${p.id}`}>
                <Input
                  id={`social-${p.id}`}
                  type="url"
                  inputMode="url"
                  value={links[p.id]}
                  onChange={(e) => update(p.id, e.target.value)}
                  placeholder={p.placeholder}
                />
              </Field>
            ))}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}
