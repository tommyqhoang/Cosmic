interface Entry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private store = new Map<string, Entry>()
  constructor(private limit: number, private windowMs: number) {}

  check(key: string): boolean {
    const now = Date.now()
    const entry = this.store.get(key)
    if (!entry || now >= entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }
    if (entry.count >= this.limit) return false
    entry.count++
    return true
  }

  // Evict expired entries to prevent unbounded memory growth.
  purgeExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (now >= entry.resetAt) this.store.delete(key)
    }
  }
}

export const registerLimiter = new RateLimiter(5, 60_000)
export const loginLimiter = new RateLimiter(10, 60_000)       // per ip+username
export const loginIpLimiter = new RateLimiter(30, 60_000)     // per ip (caps username rotation)
export const passwordLimiter = new RateLimiter(5, 60_000)     // per ip+user, blocks online brute-force
export const voteLimiter = new RateLimiter(20, 60_000)        // per ip, caps vote-pingback floods
export const subscribeLimiter = new RateLimiter(5, 60_000)    // per ip, caps newsletter signup/unsub floods
export const contactLimiter = new RateLimiter(3, 60_000)      // per ip, caps contact-form spam

const limiters = [registerLimiter, loginLimiter, loginIpLimiter, passwordLimiter, voteLimiter, subscribeLimiter, contactLimiter]

// Purge expired entries every 10 minutes so the in-process Map doesn't grow unbounded.
if (typeof setInterval !== 'undefined') {
  setInterval(() => limiters.forEach((l) => l.purgeExpired()), 10 * 60_000)
}

// First hop of x-forwarded-for is the originating client (Railway's edge appends it).
// Falls back to x-real-ip, then a constant so the limiter still functions.
type HeaderBag = Headers | Record<string, string | string[] | undefined> | undefined | null
export function clientIp(headers: HeaderBag): string {
  if (!headers) return 'unknown'
  const get = (name: string): string | undefined => {
    if (typeof (headers as Headers).get === 'function') {
      return (headers as Headers).get(name) ?? undefined
    }
    const v = (headers as Record<string, string | string[] | undefined>)[name]
    return Array.isArray(v) ? v[0] : v
  }
  const xff = get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return get('x-real-ip') ?? 'unknown'
}
