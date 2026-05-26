import { MetadataRoute } from 'next'

const BASE = 'https://shinyms.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  // Note: /login and /account are intentionally omitted (noindex / auth-gated).
  return [
    { url: BASE,                    lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE}/register`,      lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/rankings`,      lastModified: now, changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${BASE}/status`,        lastModified: now, changeFrequency: 'always',  priority: 0.6 },
    { url: `${BASE}/guide`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/guilds`,        lastModified: now, changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${BASE}/news`,          lastModified: now, changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/bosses`,        lastModified: now, changeFrequency: 'hourly',  priority: 0.7 },
    { url: `${BASE}/community`,     lastModified: now, changeFrequency: 'hourly',  priority: 0.7 },
    { url: `${BASE}/drops`,         lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${BASE}/vote`,          lastModified: now, changeFrequency: 'daily',   priority: 0.7 },
    { url: `${BASE}/contact`,       lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/terms`,         lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/privacy`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]
}
