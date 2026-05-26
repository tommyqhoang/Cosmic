import PostCard from './PostCard'

type Post = {
  id: number
  title: string
  content: string
  category: string
  pinned: boolean
  createdAt: string | Date
  author: { name: string }
}

export default function PostFeed({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div
        className="rounded-xl p-10 text-center"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm" style={{ color: 'var(--foreground-subtle)' }}>
          No announcements yet — check back soon!
        </p>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      {posts.map(post => <PostCard key={post.id} post={post} />)}
    </div>
  )
}
