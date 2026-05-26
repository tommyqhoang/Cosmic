/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET, POST } from '../../app/api/vote/[provider]/route'
import { prisma } from '../../lib/prisma'
import { voteLimiter } from '../../lib/rate-limit'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    account: { findFirst: jest.fn(), update: jest.fn() },
    votingRecord: { findUnique: jest.fn(), upsert: jest.fn() },
    $transaction: jest.fn(),
  },
}))
jest.mock('../../lib/rate-limit', () => ({
  voteLimiter: { check: jest.fn(() => true) },
  clientIp: jest.fn(() => '1.2.3.4'),
}))

const findFirst = prisma.account.findFirst as jest.Mock
const recordFind = prisma.votingRecord.findUnique as jest.Mock
const txn = prisma.$transaction as jest.Mock
const limiterCheck = voteLimiter.check as jest.Mock

const ctx = (provider: string) => ({ params: Promise.resolve({ provider }) })
const TOPG_KEY = 'topg-secret-xyz'

function topgReq(query: string) {
  return new NextRequest(`http://localhost/api/vote/topg?${query}`, { method: 'GET' })
}

describe('vote pingback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    limiterCheck.mockReturnValue(true)
    delete process.env.TOPG_POSTBACK_KEY
    delete process.env.GTOP100_PINGBACK_KEY
  })
  afterEach(() => {
    delete process.env.TOPG_POSTBACK_KEY
    delete process.env.GTOP100_PINGBACK_KEY
  })

  it('404 on an unknown provider', async () => {
    process.env.TOPG_POSTBACK_KEY = TOPG_KEY
    const req = new NextRequest('http://localhost/api/vote/wat', { method: 'GET' })
    const res = await GET(req, ctx('wat'))
    expect(res.status).toBe(404)
  })

  it('503 when the provider secret env is missing', async () => {
    // TOPG_POSTBACK_KEY deliberately unset
    const res = await GET(topgReq(`key=${TOPG_KEY}&p_resp=tommy`), ctx('topg'))
    expect(res.status).toBe(503)
  })

  it('429 when the vote limiter rejects', async () => {
    process.env.TOPG_POSTBACK_KEY = TOPG_KEY
    limiterCheck.mockReturnValue(false)
    const res = await GET(topgReq(`key=${TOPG_KEY}&p_resp=tommy`), ctx('topg'))
    expect(res.status).toBe(429)
  })

  it('403 on a bad TopG key', async () => {
    process.env.TOPG_POSTBACK_KEY = TOPG_KEY
    const res = await GET(topgReq('key=wrong&p_resp=tommy'), ctx('topg'))
    expect(res.status).toBe(403)
  })

  it('200 + credits points for a valid TopG key with p_resp', async () => {
    process.env.TOPG_POSTBACK_KEY = TOPG_KEY
    findFirst.mockResolvedValue({ id: 7, name: 'tommy' })
    recordFind.mockResolvedValue(null)
    txn.mockResolvedValue([])

    const res = await GET(topgReq(`key=${TOPG_KEY}&p_resp=tommy`), ctx('topg'))
    expect(res.status).toBe(200)
    expect(findFirst).toHaveBeenCalledWith({
      where: { name: 'tommy' },
      select: { id: true, name: true },
    })
    expect(txn).toHaveBeenCalledTimes(1)
  })

  it('200 but skips crediting when still inside cooldown', async () => {
    process.env.TOPG_POSTBACK_KEY = TOPG_KEY
    findFirst.mockResolvedValue({ id: 7, name: 'tommy' })
    recordFind.mockResolvedValue({ date: Math.floor(Date.now() / 1000) })
    const res = await GET(topgReq(`key=${TOPG_KEY}&p_resp=tommy`), ctx('topg'))
    expect(res.status).toBe(200)
    expect(txn).not.toHaveBeenCalled()
  })

  it('200 with a valid key but unknown account (no crediting)', async () => {
    process.env.TOPG_POSTBACK_KEY = TOPG_KEY
    findFirst.mockResolvedValue(null)
    const res = await GET(topgReq(`key=${TOPG_KEY}&p_resp=ghost`), ctx('topg'))
    expect(res.status).toBe(200)
    expect(txn).not.toHaveBeenCalled()
  })

  it('200 with a valid key but no voter name (nothing credited)', async () => {
    process.env.TOPG_POSTBACK_KEY = TOPG_KEY
    const res = await POST(
      new NextRequest(`http://localhost/api/vote/topg?key=${TOPG_KEY}`, { method: 'POST' }),
      ctx('topg'),
    )
    expect(res.status).toBe(200)
    expect(findFirst).not.toHaveBeenCalled()
  })
})
