import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Enforce HTTPS on the served domain (shinyms.com is TLS-only).
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Cloudflare Turnstile loads its script, renders a challenge iframe, and
      // posts challenge data — it needs script-src, frame-src and connect-src.
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      // maplestory.io serves the item/mob icons on the drop search & community pages.
      "img-src 'self' data: blob: https://maplestory.io",
      "connect-src 'self' https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ['bcryptjs'],
  experimental: {
    optimizePackageImports: ['react-markdown', 'rehype-sanitize'],
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      // Static files served straight from /public (sprite GIFs, screenshots,
      // banners, logo) get no long-lived cache by default, so browsers and any
      // CDN in front of us re-fetch them from the origin on every visit —
      // billable egress for assets that almost never change. Cache them hard;
      // bump the filename if one ever needs to change before the window lapses.
      {
        source: '/maple/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' }],
      },
      {
        source: '/:file(.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico))',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=604800' }],
      },
    ]
  },
}

export default nextConfig
