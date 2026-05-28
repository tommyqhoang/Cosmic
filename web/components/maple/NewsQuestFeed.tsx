'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkBreaks from 'remark-breaks'
import Sprite from './Sprite'
import SectionBanner from './SectionBanner'
import NpcBox from './NpcBox'

type Post = {
  id: number
  title: string
  content: string
  category: string
  pinned: boolean
  createdAt: string | Date
  author: { name: string }
}

const CATEGORY_ORDER = ['changelog', 'update', 'event', 'maintenance', 'alert']
const categoryLabel: Record<string, string> = {
  changelog: 'Changelog',
  update: 'Update',
  event: 'Event',
  maintenance: 'Maintenance',
  alert: 'Alert',
}

const TYPE_COLORS: Record<
  string,
  { bg: string; dark: string; text: string; textShadow?: string }
> = {
  changelog: { bg: '#f8c34a', dark: '#e2a020', text: '#2a1810' },
  update: { bg: '#88dc6a', dark: '#2e7a18', text: '#0a3a04' },
  event: { bg: '#6ab0ff', dark: '#143d80', text: '#fff8d8', textShadow: '1px 1px 0 #000' },
  maintenance: { bg: '#f0e0a8', dark: '#a88458', text: '#2a1810' },
  alert: { bg: '#e88aff', dark: '#8030a0', text: '#fff8d8', textShadow: '1px 1px 0 #000' },
}

const COLLAPSED_MAX = 132

function formatDate(date: string | Date) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/* ── Quest Card ── */
function QuestCard({ post, index }: { post: Post; index: number }) {
  const c = TYPE_COLORS[post.category] || TYPE_COLORS.changelog
  const isDarkText = c.text === '#2a1810'

  const [expanded, setExpanded] = useState(false)
  const [collapsible, setCollapsible] = useState(false)
  const [fullHeight, setFullHeight] = useState<number>()
  const contentRef = useRef<HTMLDivElement>(null)

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

  const clamped = collapsible && !expanded

  return (
    <article className="ms-quest-card">
      <div
        className="ms-quest-head"
        style={{
          background: `linear-gradient(to bottom, ${c.bg} 0%, ${c.dark} 100%)`,
          color: c.text,
          textShadow:
            c.textShadow ?? (isDarkText ? '1px 1px 0 rgba(255,255,255,0.4)' : '1px 1px 0 #000'),
        }}
      >
        {post.pinned && <span className="ms-quest-pinned">PINNED</span>}
        <span
          style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '3px 8px',
            border: '1px solid rgba(0,0,0,0.4)',
            fontSize: 8,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {categoryLabel[post.category] ?? post.category}
        </span>
        <span>
          {formatDate(post.createdAt)} · {post.author.name}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 9 }}>
          QUEST #{String(index + 1).padStart(3, '0')}
        </span>
      </div>

      <div className="ms-quest-body">
        <h3 className="ms-quest-title">
          <Link href={`/news/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {post.title}
          </Link>
        </h3>

        <div
          className="relative overflow-hidden transition-all duration-200"
          style={{ maxHeight: clamped ? COLLAPSED_MAX : fullHeight ?? 'none' }}
        >
          <div ref={contentRef} className="maple-prose" style={{ fontSize: 18, lineHeight: 1.35 }}>
            <ReactMarkdown remarkPlugins={[remarkBreaks]} rehypePlugins={[rehypeSanitize]}>
              {post.content}
            </ReactMarkdown>
          </div>
          {clamped && (
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
              style={{
                background: 'linear-gradient(to bottom, transparent, var(--ms-npc-bg))',
              }}
            />
          )}
        </div>

        {collapsible && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-3"
            style={{
              fontFamily: 'var(--ms-font-d)',
              fontSize: 9,
              color: '#c64b1b',
              letterSpacing: 1,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {expanded ? 'SHOW LESS' : 'READ MORE'}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transform: expanded ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s',
              }}
              aria-hidden
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--ms-font-d)', fontSize: 9, color: '#c64b1b', letterSpacing: 1 }}>
            REWARD:
          </span>
          <span
            style={{
              background: '#fff8d8',
              border: '2px solid #1a0a04',
              padding: '3px 8px',
              fontFamily: 'var(--ms-font-d)',
              fontSize: 9,
              color: '#c64b1b',
              boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
            }}
          >
            Knowledge +1
          </span>
          <Link
            href={`/news/${post.id}`}
            className="ms-btn ms-btn-sm"
            style={{ marginLeft: 'auto' }}
          >
            READ MORE
          </Link>
        </div>
      </div>
    </article>
  )
}

/* ── Filter Tab ── */
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
  const c =
    label === 'ALL'
      ? { bg: '#f8c34a', dark: '#e2a020', text: '#2a1810' }
      : TYPE_COLORS[label.toLowerCase()] || TYPE_COLORS.changelog

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      style={{
        padding: '8px 14px',
        background: isActive ? `linear-gradient(to bottom, ${c.bg}, ${c.dark})` : '#c8a868',
        border: '2px solid #1a0a04',
        color: isActive ? c.text : '#2a1810',
        fontFamily: 'var(--ms-font-d)',
        fontSize: 9,
        letterSpacing: 1,
        cursor: 'pointer',
        boxShadow: isActive
          ? 'inset 2px 2px 0 rgba(255,255,255,0.4)'
          : 'inset -2px -2px 0 #8a6f3c',
        textShadow: isActive && c.text === '#fff8d8' ? '1px 1px 0 #000' : 'none',
        lineHeight: 1,
      }}
    >
      {label}
      <span style={{ marginLeft: 4, opacity: 0.7 }}>{count}</span>
    </button>
  )
}

/* ── Main Feed ── */
export default function NewsQuestFeed({ posts }: { posts: Post[] }) {
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
    <section style={{ padding: '40px 0 20px', position: 'relative' }}>
      {/* Floating sprites */}
      <div className="hidden sm:block" style={{ position: 'absolute', top: 60, left: '3%' }}>
        <Sprite src="/maple/mobs/blue-snail.gif" alt="Blue Snail" height={56} anim="bob" grounded={false} />
      </div>
      <div className="hidden sm:block" style={{ position: 'absolute', top: 30, right: '5%' }}>
        <Sprite src="/maple/items/maple-leaf.png" alt="Maple Leaf" height={36} anim="bob" delay={400} grounded={false} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionBanner>QUEST LOG</SectionBanner>
        <h1 className="ms-hero-title" style={{ fontSize: 'clamp(22px, 4vw, 42px)' }}>
          News &amp; Announcements
        </h1>
        <div style={{ marginTop: 14, marginBottom: 24 }}>
          <span className="ms-hero-sub">
            Patch notes, events, GM updates and community happenings.
          </span>
        </div>

        {/* Filter tabs */}
        <div
          className="ms-pixel-panel"
          style={{
            padding: 10,
            marginBottom: 24,
            display: 'flex',
            gap: 6,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--ms-font-d)',
              fontSize: 10,
              color: '#4a3220',
              marginRight: 8,
              letterSpacing: 1,
            }}
          >
            FILTER:
          </span>
          <FilterTab label="ALL" count={posts.length} isActive={active === 'all'} onClick={() => setActive('all')} />
          {categories.map((c) => (
            <FilterTab
              key={c.key}
              label={c.label.toUpperCase()}
              count={c.count}
              isActive={active === c.key}
              onClick={() => setActive(c.key)}
            />
          ))}
        </div>

        {/* Content grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Quest cards */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">
            {filtered.map((post, i) => (
              <QuestCard key={post.id} post={post} index={i} />
            ))}
            {filtered.length === 0 && (
              <NpcBox title="QUEST LOG">
                <p>No quests in this category yet. Check back soon!</p>
              </NpcBox>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-5">
            <NpcBox title="SERVER STATUS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>Server</span>
                  <span
                    style={{
                      color: '#2e7a18',
                      fontFamily: 'var(--ms-font-d)',
                      fontSize: 10,
                    }}
                  >
                    ONLINE
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Players online</span>
                  <strong style={{ color: '#c64b1b' }}>247</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Uptime</span>
                  <strong>14d 6h</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Version</span>
                  <strong style={{ color: '#c64b1b' }}>v83 GMS</strong>
                </div>
              </div>
            </NpcBox>

            <NpcBox title="TOP MAPLERS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { name: 'Reqei', job: 'Night Lord', lv: 142, cls: 'nightlord' as const, av: 'nightlord.png' },
                  { name: 'Borin', job: 'Hero', lv: 155, cls: 'hero' as const, av: 'hero.png' },
                  { name: 'Aelith', job: 'Bishop', lv: 120, cls: 'bishop' as const, av: 'bishop.png' },
                ].map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        background: ['#f8c34a', '#c8c8c8', '#d8a878'][i],
                        border: '2px solid #1a0a04',
                        padding: '2px 6px',
                        fontFamily: 'var(--ms-font-d)',
                        fontSize: 10,
                        boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
                        flexShrink: 0,
                      }}
                    >
                      #{i + 1}
                    </span>
                    <img
                      src={`/maple/avatars/${p.av}`}
                      alt=""
                      style={{
                        width: 36,
                        height: 36,
                        background: '#d8c08c',
                        border: '2px solid #1a0a04',
                        padding: 2,
                        flexShrink: 0,
                        imageRendering: 'pixelated',
                      }}
                    />
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--ms-font-d)',
                          fontSize: 10,
                          color: '#c64b1b',
                        }}
                      >
                        {p.name}
                      </div>
                      <div style={{ fontSize: 16 }}>
                        {p.job} · Lv. {p.lv}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NpcBox>

            <NpcBox title="STAY UPDATED">
              <p style={{ fontSize: 19 }}>
                Get news &amp; event alerts by email or Discord.
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <a
                  href="/#newsletter"
                  className="ms-btn ms-btn-green ms-btn-sm"
                  style={{ justifyContent: 'center' }}
                >
                  EMAIL
                </a>
                <a
                  href="#"
                  className="ms-btn ms-btn-sm"
                  style={{ justifyContent: 'center' }}
                  onClick={(e) => e.preventDefault()}
                >
                  DISCORD
                </a>
              </div>
            </NpcBox>
          </aside>
        </div>
      </div>
    </section>
  )
}
