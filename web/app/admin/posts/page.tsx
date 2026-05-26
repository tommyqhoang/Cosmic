'use client'
import { useState, useEffect, useCallback } from 'react'
import { Alert, Badge, Button, Card, EmptyState, Field, Input, Select, Textarea, PageHeader } from '@/components/admin/ui'

const CATEGORIES = ['changelog', 'maintenance', 'alert', 'event', 'update'] as const
type Category = (typeof CATEGORIES)[number]

type Post = {
  id: number
  title: string
  content: string
  category: string
  pinned: boolean
  createdAt: string
  author: { name: string }
}

type Draft = { title: string; content: string; category: Category; pinned: boolean; notify: boolean }
const EMPTY_DRAFT: Draft = { title: '', content: '', category: 'changelog', pinned: false, notify: true }

const CATEGORY_TONE: Record<string, 'primary' | 'warning' | 'danger' | 'success' | 'accent' | 'neutral'> = {
  changelog: 'primary',
  maintenance: 'warning',
  alert: 'danger',
  event: 'success',
  update: 'accent',
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [editTarget, setEditTarget] = useState<Post | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const reload = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    let cancelled = false
    fetch('/api/posts')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load posts (${res.status})`)
        return res.json()
      })
      .then((data: Post[]) => { if (!cancelled) setPosts(data) })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load posts') })
    return () => { cancelled = true }
  }, [refreshKey])

  async function createPost(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to create post')
        return
      }
      setDraft(EMPTY_DRAFT)
      setShowForm(false)
      reload()
    } catch {
      setError('Failed to create post')
    } finally {
      setSaving(false)
    }
  }

  async function updatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!editTarget) return
    setSaving(true)
    setError(null)
    try {
      const { id, title, content, category, pinned } = editTarget
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category, pinned }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Failed to update post')
        return
      }
      setEditTarget(null)
      reload()
    } catch {
      setError('Failed to update post')
    } finally {
      setSaving(false)
    }
  }

  async function deletePost(id: number) {
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) { setError('Failed to delete post'); return }
      if (editTarget?.id === id) setEditTarget(null)
      reload()
    } catch {
      setError('Failed to delete post')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <Alert onDismiss={() => setError(null)}>{error}</Alert>}

      <PageHeader
        title="Posts"
        subtitle={`${posts.length} announcement${posts.length !== 1 ? 's' : ''}`}
        actions={
          <Button variant={showForm ? 'secondary' : 'primary'} onClick={() => { setShowForm((v) => !v); setEditTarget(null) }}>
            {showForm ? 'Cancel' : '+ New Post'}
          </Button>
        }
      />

      {/* Create form */}
      {showForm && (
        <Card className="p-5">
          <form onSubmit={createPost} className="flex flex-col gap-4">
            <Field label="Title" htmlFor="new-title">
              <Input id="new-title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Post title" required autoFocus maxLength={200} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
              <Field label="Category" htmlFor="new-category">
                <Select id="new-category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value as Category }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </Select>
              </Field>
              <label className="flex items-center gap-2 text-sm cursor-pointer pb-2.5" style={{ color: 'var(--foreground-muted)' }}>
                <input type="checkbox" checked={draft.pinned} onChange={(e) => setDraft((d) => ({ ...d, pinned: e.target.checked }))} />
                Pin to top
              </label>
            </div>
            <Field label="Content" htmlFor="new-content" hint="Markdown supported">
              <Textarea id="new-content" value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} placeholder="Write your announcement…" rows={6} required className="font-mono" />
            </Field>
            <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--foreground-muted)' }}>
              <input type="checkbox" checked={draft.notify} onChange={(e) => setDraft((d) => ({ ...d, notify: e.target.checked }))} />
              Email newsletter subscribers about this announcement
            </label>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>{saving ? 'Publishing…' : 'Publish Post'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* List */}
      <Card className="overflow-hidden">
        {posts.length === 0 ? (
          <EmptyState title="No posts yet" hint="Create your first announcement to share news, changelogs, and events." />
        ) : (
          <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {posts.map((post) => (
              <li key={post.id}>
                <div className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {post.pinned && <Badge tone="accent">Pinned</Badge>}
                      <Badge tone={CATEGORY_TONE[post.category] ?? 'neutral'}>{post.category}</Badge>
                    </div>
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>{post.title}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--foreground-subtle)' }}>
                      {new Date(post.createdAt).toLocaleDateString()} · {post.author.name}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant={editTarget?.id === post.id ? 'secondary' : 'primary'} onClick={() => setEditTarget(editTarget?.id === post.id ? null : { ...post })}>
                      {editTarget?.id === post.id ? 'Cancel' : 'Edit'}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => deletePost(post.id)}>Delete</Button>
                  </div>
                </div>

                {editTarget?.id === post.id && (
                  <form onSubmit={updatePost} className="px-5 pb-4 pt-3 flex flex-col gap-4" style={{ borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--surface-subtle)' }}>
                    <Field label="Title" htmlFor={`edit-title-${post.id}`}>
                      <Input id={`edit-title-${post.id}`} value={editTarget.title} onChange={(e) => setEditTarget((t) => t && { ...t, title: e.target.value })} required autoFocus maxLength={200} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-end">
                      <Field label="Category" htmlFor={`edit-category-${post.id}`}>
                        <Select id={`edit-category-${post.id}`} value={editTarget.category} onChange={(e) => setEditTarget((t) => t && { ...t, category: e.target.value })}>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </Select>
                      </Field>
                      <label className="flex items-center gap-2 text-sm cursor-pointer pb-2.5" style={{ color: 'var(--foreground-muted)' }}>
                        <input type="checkbox" checked={editTarget.pinned} onChange={(e) => setEditTarget((t) => t && { ...t, pinned: e.target.checked })} />
                        Pin to top
                      </label>
                    </div>
                    <Field label="Content" htmlFor={`edit-content-${post.id}`} hint="Markdown supported">
                      <Textarea id={`edit-content-${post.id}`} value={editTarget.content} onChange={(e) => setEditTarget((t) => t && { ...t, content: e.target.value })} rows={6} required className="font-mono" />
                    </Field>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
                    </div>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
