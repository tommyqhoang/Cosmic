import { prisma } from '@/lib/prisma'
import NewsQuestFeed from '@/components/maple/NewsQuestFeed'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'News & Announcements',
  description: 'Stay up to date with the latest ShinyMS server news, changelogs, and events.',
  alternates: { canonical: 'https://shinyms.com/news' },
  openGraph: {
    url: 'https://shinyms.com/news',
    title: 'News & Announcements | ShinyMS',
    description: 'Latest changelogs, events, and server updates from ShinyMS.',
  },
}

async function getPosts() {
  return prisma.cmsPost.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { author: { select: { name: true } } },
    take: 50,
  }).catch(() => [])
}

export default async function NewsPage() {
  const posts = await getPosts()
  return <NewsQuestFeed posts={posts} />
}
