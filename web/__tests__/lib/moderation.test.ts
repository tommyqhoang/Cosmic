/** @jest-environment node */
import { loadModerationTarget } from '../../lib/moderation'
import { prisma } from '../../lib/prisma'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    account: { findUnique: jest.fn() },
  },
}))

const findUnique = prisma.account.findUnique as jest.Mock

describe('loadModerationTarget', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns a 404 error response when the account is missing', async () => {
    findUnique.mockResolvedValue(null)
    const check = await loadModerationTarget(5)
    expect('error' in check).toBe(true)
    expect((check as { error: Response }).error.status).toBe(404)
    const json = await (check as { error: Response }).error.json()
    expect(json).toEqual({ error: 'Account not found' })
  })

  it('returns a 404 when the lookup throws (caught -> null)', async () => {
    findUnique.mockRejectedValue(new Error('db down'))
    const check = await loadModerationTarget(5)
    expect((check as { error: Response }).error.status).toBe(404)
  })

  it('returns a 403 error response when the target is a web admin', async () => {
    findUnique.mockResolvedValue({ id: 5, webadmin: 1 })
    const check = await loadModerationTarget(5)
    expect('error' in check).toBe(true)
    expect((check as { error: Response }).error.status).toBe(403)
    const json = await (check as { error: Response }).error.json()
    expect(json).toEqual({ error: 'Cannot moderate an administrator account' })
  })

  it('returns the target for a normal account', async () => {
    findUnique.mockResolvedValue({ id: 5, webadmin: 0 })
    const check = await loadModerationTarget(5)
    expect('error' in check).toBe(false)
    expect((check as { target: { id: number } }).target).toEqual({ id: 5, webadmin: 0 })
  })
})
