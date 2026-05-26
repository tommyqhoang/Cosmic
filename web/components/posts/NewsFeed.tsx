'use client'

import { useMemo, useState } from 'react'
import PostFeed from './PostFeed'

type Post = {
  id: number
  title: string
  content: string
  category: string
  pinned: boolean
  createdAt: string | Date
  author: { name: string }
}

const categoryLabel: Record<string, string> = {
  changelog: 'Changelogs',
  update: 'Updates',
  event: 'Events',
  maintenance: 'Maintenance',
  alert: 'Alerts',
}

// Order filter tabs are shown in (categories absent from the data are skipped)
const CATEGORY_ORDER = ['changelog', 'update', 'event', 'maintenance', 'alert']

export default function NewsFeed({ posts }: { posts: Post[] }) {
  const [active, setActive] = useState<string>('all')

  const categories = useMemo(() => {
    const counts = posts.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1
      return acc
    }, {})
    return CATEGORY_ORDER.filter((c) => counts[c]).map((c) => ({
      key: c,
      label: categoryLabel[c] ?? c,
      count: counts[c],
    }))
  }, [posts])

  const filtered = active === 'all' ? posts : posts.filter((p) => p.category === active)

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterTab label="All" count={posts.length} isActive={active === 'all'} onClick={() => setActive('all')} />
        {categories.map((c) => (
          <FilterTab
            key={c.key}
            label={c.label}
            count={c.count}
            isActive={active === c.key}
            onClick={() => setActive(c.key)}
          />
        ))}
      </div>
      <PostFeed posts={filtered} />
    </>
  )
}

function FilterTab({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors duration-150"
      style={{
        backgroundColor: isActive ? 'var(--accent)' : 'var(--surface)',
        color: isActive ? 'var(--accent-foreground)' : 'var(--foreground-muted)',
        border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
      }}
    >
      {label}
      <span className="ml-1.5 opacity-60">{count}</span>
    </button>
  )
}
