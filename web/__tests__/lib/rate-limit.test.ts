/** @jest-environment node */
import { RateLimiter, clientIp } from '@/lib/rate-limit'

describe('RateLimiter', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('allows up to the limit then blocks', () => {
    const rl = new RateLimiter(3, 60_000)
    expect(rl.check('a')).toBe(true)
    expect(rl.check('a')).toBe(true)
    expect(rl.check('a')).toBe(true)
    expect(rl.check('a')).toBe(false)
    expect(rl.check('a')).toBe(false)
  })

  it('tracks keys independently', () => {
    const rl = new RateLimiter(1, 60_000)
    expect(rl.check('a')).toBe(true)
    expect(rl.check('a')).toBe(false)
    expect(rl.check('b')).toBe(true)
  })

  it('resets after the window elapses', () => {
    let now = 1_000_000
    jest.spyOn(Date, 'now').mockImplementation(() => now)
    const rl = new RateLimiter(2, 1_000)
    expect(rl.check('a')).toBe(true)
    expect(rl.check('a')).toBe(true)
    expect(rl.check('a')).toBe(false)
    // advance past the window
    now += 1_001
    expect(rl.check('a')).toBe(true)
  })

  it('purgeExpired removes stale keys but keeps live ones', () => {
    let now = 1_000_000
    jest.spyOn(Date, 'now').mockImplementation(() => now)
    const rl = new RateLimiter(5, 1_000)
    rl.check('stale')
    now += 500
    rl.check('fresh')
    // advance so 'stale' (resetAt = 1_001_000) is expired but 'fresh'
    // (resetAt = 1_001_500) is not.
    now = 1_001_200
    rl.purgeExpired()
    // 'stale' purged -> a fresh window begins (true). 'fresh' still counting.
    const internal = rl as unknown as { store: Map<string, unknown> }
    expect(internal.store.has('stale')).toBe(false)
    expect(internal.store.has('fresh')).toBe(true)
  })
})

describe('clientIp', () => {
  it('returns unknown when headers are null/undefined', () => {
    expect(clientIp(null)).toBe('unknown')
    expect(clientIp(undefined)).toBe('unknown')
  })

  it('parses the first x-forwarded-for hop (Headers)', () => {
    const h = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.9.9.9' })
    expect(clientIp(h)).toBe('1.2.3.4')
  })

  it('trims whitespace around the first hop', () => {
    const h = new Headers({ 'x-forwarded-for': '  1.2.3.4  , 5.6.7.8' })
    expect(clientIp(h)).toBe('1.2.3.4')
  })

  it('falls back to x-real-ip when no XFF', () => {
    const h = new Headers({ 'x-real-ip': '10.0.0.1' })
    expect(clientIp(h)).toBe('10.0.0.1')
  })

  it("falls back to 'unknown' when nothing present", () => {
    expect(clientIp(new Headers())).toBe('unknown')
  })

  it('works with a plain record header bag (string + array)', () => {
    expect(clientIp({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2' })).toBe('1.1.1.1')
    expect(clientIp({ 'x-forwarded-for': ['3.3.3.3', '4.4.4.4'] })).toBe('3.3.3.3')
    expect(clientIp({ 'x-real-ip': '8.8.8.8' })).toBe('8.8.8.8')
    expect(clientIp({})).toBe('unknown')
  })
})
