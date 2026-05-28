/** @jest-environment node */
import { NextRequest } from 'next/server'
import { GET } from '../../app/api/server/status/notify/route'
import { prisma } from '../../lib/prisma'
import { getLiveServerStatus } from '../../lib/server-status'
import { sendServerStatusAlert } from '../../lib/discord'

jest.mock('../../lib/prisma', () => ({
  prisma: { cmsSetting: { findMany: jest.fn(), upsert: jest.fn(), updateMany: jest.fn() } },
}))
jest.mock('../../lib/server-status', () => ({ getLiveServerStatus: jest.fn() }))
jest.mock('../../lib/discord', () => ({ sendServerStatusAlert: jest.fn() }))

const liveStatus = getLiveServerStatus as jest.Mock
const alert = sendServerStatusAlert as jest.Mock
const findMany = prisma.cmsSetting.findMany as jest.Mock
const updateMany = prisma.cmsSetting.updateMany as jest.Mock
const upsert = prisma.cmsSetting.upsert as jest.Mock

const STATE_KEY = 'server_status_state'
const SINCE_KEY = 'server_status_since'

function req(token?: string) {
  return new NextRequest('http://localhost/api/server/status/notify', {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  })
}

describe('/api/server/status/notify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.STATUS_NOTIFY_SECRET
    upsert.mockResolvedValue({})
    updateMany.mockResolvedValue({ count: 1 })
    alert.mockResolvedValue(true)
    liveStatus.mockResolvedValue({ online: true, players: 3, ts: Date.now() })
  })

  it('records a baseline without alerting on first run', async () => {
    findMany.mockResolvedValue([])
    const res = await GET(req())
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ baseline: true, changed: false })
    expect(alert).not.toHaveBeenCalled()
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { key: STATE_KEY } }))
  })

  it('does nothing when the state is unchanged', async () => {
    findMany.mockResolvedValue([{ key: STATE_KEY, value: 'online' }])
    const res = await GET(req())
    expect(await res.json()).toMatchObject({ changed: false })
    expect(updateMany).not.toHaveBeenCalled()
    expect(alert).not.toHaveBeenCalled()
  })

  it('alerts (red) when the server goes down', async () => {
    findMany.mockResolvedValue([
      { key: STATE_KEY, value: 'online' },
      { key: SINCE_KEY, value: String(Date.now() - 5_000) },
    ])
    liveStatus.mockResolvedValue({ online: false, players: 0, ts: Date.now() })
    const res = await GET(req())
    expect(await res.json()).toMatchObject({ changed: true, notified: true })
    expect(alert).toHaveBeenCalledWith(expect.objectContaining({ online: false }))
  })

  it('alerts (green) with downtime when the server recovers', async () => {
    findMany.mockResolvedValue([
      { key: STATE_KEY, value: 'offline' },
      { key: SINCE_KEY, value: String(Date.now() - 60_000) },
    ])
    liveStatus.mockResolvedValue({ online: true, players: 7, ts: Date.now() })
    const res = await GET(req())
    expect(await res.json()).toMatchObject({ changed: true })
    const arg = alert.mock.calls[0][0]
    expect(arg.online).toBe(true)
    expect(arg.players).toBe(7)
    expect(arg.downtimeMs).toBeGreaterThanOrEqual(59_000)
  })

  it('does not double-alert when another run already flipped the state', async () => {
    findMany.mockResolvedValue([{ key: STATE_KEY, value: 'online' }])
    liveStatus.mockResolvedValue({ online: false, players: 0, ts: Date.now() })
    updateMany.mockResolvedValue({ count: 0 })
    const res = await GET(req())
    expect(await res.json()).toMatchObject({ changed: false, raced: true })
    expect(alert).not.toHaveBeenCalled()
  })

  it('401s when the secret is configured but missing/wrong', async () => {
    process.env.STATUS_NOTIFY_SECRET = 'right'
    findMany.mockResolvedValue([{ key: STATE_KEY, value: 'online' }])
    expect((await GET(req())).status).toBe(401)
    expect((await GET(req('wrong'))).status).toBe(401)
    expect((await GET(req('right'))).status).toBe(200)
  })
})
