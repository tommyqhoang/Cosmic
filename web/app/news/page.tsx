import { prisma } from '@/lib/prisma'
import NewsFeed from '@/components/posts/NewsFeed'
import Sprite from '@/components/maple/Sprite'
import type { Metadata } from 'next'

// Render fresh on every request. As an ISR page (revalidate), /news was served
// from the client Router Cache (static staleTime = 5 min), so users soft-
// navigating here via <Link> saw a stale snapshot — a freshly published post
// would show on the force-dynamic homepage but not here until a hard refresh.
// revalidatePath('/news') on publish only clears the server cache, not the
// client's. Dynamic rendering gives the client cache a 0s staleTime, matching
// the homepage, so navigations always reflect current posts.
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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="mb-8 flex items-center gap-3">
        <Sprite src="/maple/npcs/maple-admin.gif" alt="" height={56} anim="bob" grounded={false} className="shrink-0" />
        <div>
          <h1
            className="font-display font-bold text-2xl sm:text-3xl"
            style={{ color: 'var(--foreground)', letterSpacing: '0.02em' }}
          >
            News & Announcements
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--foreground-subtle)' }}>
            Latest updates, changelogs, and events
          </p>
        </div>
      </div>
      <NewsFeed posts={posts} />
    </div>
  )
}
