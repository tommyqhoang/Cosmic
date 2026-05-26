import { render, screen, fireEvent } from '@testing-library/react'
import AdminPostsPage from '@/app/admin/posts/page'

// The rebuilt Posts admin screen is a client component that fetches /api/posts
// on mount. We stub fetch to drive its three key UI states.
function stubFetch(json: unknown, ok = true, status = 200) {
  ;(global.fetch as jest.Mock).mockResolvedValue({
    ok,
    status,
    json: async () => json,
  })
}

beforeEach(() => {
  global.fetch = jest.fn()
})

const samplePost = {
  id: 1,
  title: 'Server Launch',
  content: 'We are live!',
  category: 'changelog',
  pinned: true,
  createdAt: new Date('2026-01-01').toISOString(),
  author: { name: 'admin' },
}

describe('AdminPostsPage (rebuilt UI)', () => {
  it('shows the empty state when there are no posts', async () => {
    stubFetch([])
    render(<AdminPostsPage />)
    expect(await screen.findByText(/no posts yet/i)).toBeInTheDocument()
  })

  it('renders posts returned by the API', async () => {
    stubFetch([samplePost])
    render(<AdminPostsPage />)
    expect(await screen.findByText('Server Launch')).toBeInTheDocument()
    expect(screen.getByText(/admin/)).toBeInTheDocument()
    // Pinned + category badges render.
    expect(screen.getByText(/pinned/i)).toBeInTheDocument()
  })

  it('opens an accessible create form with labelled fields', async () => {
    stubFetch([])
    render(<AdminPostsPage />)
    await screen.findByText(/no posts yet/i)
    fireEvent.click(screen.getByRole('button', { name: /new post/i }))
    // getByLabelText only passes if <label htmlFor> is wired to the control —
    // i.e. this also asserts the form is accessible.
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
    expect(screen.getByLabelText('Content')).toBeInTheDocument()
  })
})
