import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl font-bold" style={{ color: 'var(--foreground)' }}>404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm opacity-70">The page you’re looking for doesn’t exist or has moved.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150"
        style={{ backgroundColor: 'var(--foreground)', color: 'var(--background)' }}
      >
        Back to home
      </Link>
    </div>
  )
}
