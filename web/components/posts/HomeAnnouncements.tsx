'use client'
import { useState } from 'react'
import Link from 'next/link'
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

// Announcements per page on the homepage. Cards are collapsible, so a small page
// keeps the section compact while letting users page through recent posts without
// leaving the homepage. The full archive lives at /news.
const PER_PAGE = 4

export default function HomeAnnouncements({ posts }: { posts: Post[] }) {
  const [page, setPage] = useState(0)
  const pageCount = Math.ceil(posts.length / PER_PAGE)
  const clampedPage = Math.min(page, Math.max(0, pageCount - 1))
  const start = clampedPage * PER_PAGE
  const visible = posts.slice(start, start + PER_PAGE)

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-display font-bold text-lg" style={{ color: 'var(--foreground)', letterSpacing: '0.03em' }}>
          Announcements
        </h2>
        <Link
          href="/news"
          className="inline-flex items-center gap-1 text-sm font-semibold transition-colors duration-150 shrink-0"
          style={{ color: 'var(--primary)' }}
        >
          View all news
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      <PostFeed posts={visible} />

      {pageCount > 1 && (
        <nav className="flex items-center justify-center gap-3 mt-6" aria-label="Announcements pagination">
          <PageButton
            label="Previous"
            disabled={clampedPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            dir="prev"
          />
          <span className="text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
            Page {clampedPage + 1} of {pageCount}
          </span>
          <PageButton
            label="Next"
            disabled={clampedPage >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            dir="next"
          />
        </nav>
      )}

      {posts.length > 0 && (
        <div className="flex justify-center mt-6">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--surface)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
          >
            Read more on the news page
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}

function PageButton({
  label,
  disabled,
  onClick,
  dir,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  dir: 'prev' | 'next'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-lg transition-all duration-150"
      style={{
        backgroundColor: 'var(--surface)',
        color: disabled ? 'var(--foreground-subtle)' : 'var(--foreground)',
        border: '1px solid var(--border)',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {dir === 'prev' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      )}
      {label}
      {dir === 'next' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  )
}
