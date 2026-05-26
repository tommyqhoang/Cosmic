'use client'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkBreaks from 'remark-breaks'
import Link from 'next/link'

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
  changelog: 'Changelog',
  maintenance: 'Maintenance',
  alert: 'Alert',
  event: 'Event',
  update: 'Update',
}

const categoryAccent: Record<string, string> = {
  changelog: '#3b82f6',
  maintenance: '#f59e0b',
  alert: '#ef4444',
  event: '#22c55e',
  update: '#a855f7',
}

// Collapsed posts clamp to this height; anything taller gets a "Read more"
// toggle. Tuned to ~5 lines of body copy so the feed stays scannable.
const COLLAPSED_MAX = 132

export default function PostCard({ post }: { post: Post }) {
  const [expanded, setExpanded] = useState(false)
  const [collapsible, setCollapsible] = useState(false)
  const [fullHeight, setFullHeight] = useState<number>()
  const contentRef = useRef<HTMLDivElement>(null)

  // Markdown renders client-side, so we can only know whether a post overflows
  // the collapsed height after it mounts. Measure then, and re-measure on resize
  // since reflow at narrow widths changes the rendered height. Tracking the full
  // height in state keeps the expanded max-height correct (and animatable) when
  // the layout reflows.
  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const measure = () => {
      setFullHeight(el.scrollHeight)
      setCollapsible(el.scrollHeight > COLLAPSED_MAX + 8)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [post.content])

  const date = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const accentColor = categoryAccent[post.category] ?? '#6b7280'
  const clamped = collapsible && !expanded

  return (
    <article
      className="rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md"
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 4px rgba(28,21,39,0.06)',
      }}
    >
      {/* Category accent bar */}
      <div style={{ height: '3px', backgroundColor: accentColor }} />

      <div className="p-5 sm:p-6">
        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {post.pinned && (
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-foreground)', border: '1px solid var(--accent)' }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Pinned
            </span>
          )}
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full badge-${post.category}`}>
            {categoryLabel[post.category] ?? post.category}
          </span>
          <span className="text-xs ml-auto" style={{ color: 'var(--foreground-subtle)' }}>
            {date} · <span style={{ color: 'var(--foreground-muted)' }}>{post.author.name}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-base mb-3 leading-snug">
          <Link href={`/news/${post.id}`} className="hover:underline" style={{ color: 'var(--foreground)' }}>
            {post.title}
          </Link>
        </h3>

        {/* Content — clamped while collapsed, with a fade over the cut-off edge */}
        <div
          className="relative overflow-hidden transition-all duration-200"
          style={{ maxHeight: clamped ? COLLAPSED_MAX : fullHeight ?? 'none' }}
        >
          <div ref={contentRef} className="maple-prose">
            <ReactMarkdown remarkPlugins={[remarkBreaks]} rehypePlugins={[rehypeSanitize]}>{post.content}</ReactMarkdown>
          </div>
          {clamped && (
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, transparent, var(--surface))' }}
            />
          )}
        </div>

        {/* Read more / Show less toggle */}
        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1 mt-3 text-sm font-semibold transition-colors duration-150"
            style={{ color: 'var(--primary)' }}
          >
            {expanded ? 'Show less' : 'Read more'}
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              aria-hidden
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
      </div>
    </article>
  )
}
