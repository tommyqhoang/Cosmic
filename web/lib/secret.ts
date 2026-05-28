import { timingSafeEqual, createHmac } from 'node:crypto'

// Zero key is fine here — we only need constant-length output so timingSafeEqual
// can run without the early-exit that leaks secret length via timing.
const HMAC_KEY = Buffer.alloc(32)

export function safeEqual(a: string, b: string): boolean {
  const ah = createHmac('sha256', HMAC_KEY).update(a).digest()
  const bh = createHmac('sha256', HMAC_KEY).update(b).digest()
  return timingSafeEqual(ah, bh)
}
