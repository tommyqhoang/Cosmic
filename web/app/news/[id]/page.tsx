import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkBreaks from 'remark-breaks'
import Link from 'next/link'
import type { Metadata } from 'next'

export const revalidate = 60

const categoryAccent: Record<string, string> = {
  changelog: '#3b82f6',
  maintenance: '#f59e0b',
  alert: '#ef4444',
  event: '#22c55e',
  update: '#a855f7',
}

const categoryLabel: Record<string, string> = {
  changelog: 'Changelog',
  maintenance: 'Maintenance',
  alert: 'Alert',
  event: 'Event',
  update: 'Update',
}

// Accept only plain positive integers. Number('1e3')/Number('0x10') would
// otherwise coerce to real ids (1000 / 16) and serve the wrong post.
function parsePostId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null
}

async function getPost(id: number) {
  return prisma.cmsPost.findUnique({
    where: { id },
    select: {
      id: true, title: true, content: true, category: true,
      pinned: true, createdAt: true, updatedAt: true,
      author: { select: { name: true } },
    },
  }).catch(() => null)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const postId = parsePostId(id)
  const post = postId === null ? null : await getPost(postId)
  if (!post) return { title: 'Post Not Found' }
  const description = post.content.replace(/[#*`[\]()]/g, '').slice(0, 160)
  return {
    title: post.title,
    description,
    alternates: { canonical: `https://shinyms.com/news/${post.id}` },
    openGraph: {
      url: `https://shinyms.com/news/${post.id}`,
      title: `${post.title} | ShinyMS`,
      description,
    },
  }
}

export default async function NewsPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const postId = parsePostId(id)
  const post = postId === null ? null : await getPost(postId)
  if (!post) return notFound()

  const accent = categoryAccent[post.category] ?? '#6b7280'
  const date = new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-8" style={{ color: 'var(--foreground-subtle)' }}>
        <Link href="/news" className="hover:underline" style={{ color: 'var(--primary)' }}>News</Link>
        <span>/</span>
        <span className="truncate max-w-xs">{post.title}</span>
      </div>

      <article
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 1px 8px rgba(28,21,39,0.06)' }}
      >
        {/* Category accent bar */}
        <div style={{ height: '4px', backgroundColor: accent }} />

        <div className="p-6 sm:p-8">
          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.pinned && (
              <span
                className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-foreground)', border: '1px solid var(--accent)' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Pinned
              </span>
            )}
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${accent}18`, color: accent }}
            >
              {categoryLabel[post.category] ?? post.category}
            </span>
            <span className="text-xs ml-auto" style={{ color: 'var(--foreground-subtle)' }}>
              {date} · <span style={{ color: 'var(--foreground-muted)' }}>{post.author.name}</span>
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-6 leading-snug" style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}>
            {post.title}
          </h1>

          {/* Content */}
          <div className="maple-prose">
            <ReactMarkdown remarkPlugins={[remarkBreaks]} rehypePlugins={[rehypeSanitize]}>{post.content}</ReactMarkdown>
          </div>
        </div>
      </article>

      {/* Back link */}
      <div className="mt-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
          style={{ color: 'var(--primary)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to News
        </Link>
      </div>
    </div>
  )
}
