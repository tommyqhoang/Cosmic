import { prisma } from '@/lib/prisma'
import { safeEqual } from '@/lib/secret'
import { getLiveServerStatus } from '@/lib/server-status'
import { sendServerStatusAlert } from '@/lib/discord'

// Cron-driven (Railway cron, every ~1 min): checks the game server and posts a
// Discord alert when it flips between up and down. State lives in cms_settings so
// it survives restarts/redeploys and only the run that actually flips it posts.
// Must stay dynamic — never cache the result.
export const dynamic = 'force-dynamic'

const STATE_KEY = 'server_status_state' // 'online' | 'offline' — last alerted state
const SINCE_KEY = 'server_status_since' // epoch ms (string) the current state began


function authorized(req: Request): boolean {
  const secret = process.env.STATUS_NOTIFY_SECRET?.trim()
  if (!secret) {
    console.warn('STATUS_NOTIFY_SECRET is not set — /api/server/status/notify is unauthenticated. Set it and pass it from the cron.')
    return true
  }
  const header = req.headers.get('authorization') ?? ''
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : ''
  const provided = bearer || new URL(req.url).searchParams.get('token') || ''
  return safeEqual(provided, secret)
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let status
  try {
    status = await getLiveServerStatus()
  } catch (err) {
    console.error('status notify: server status check failed', err)
    return Response.json({ error: 'status check failed' }, { status: 500 })
  }
  const current: 'online' | 'offline' = status.online ? 'online' : 'offline'
  const now = Date.now()

  try {
    const rows = await prisma.cmsSetting.findMany({ where: { key: { in: [STATE_KEY, SINCE_KEY] } } })
    const byKey = new Map(rows.map((r) => [r.key, r.value]))
    const previous = byKey.get(STATE_KEY)

    // First run on a fresh DB: record a baseline without alerting — we don't
    // know the prior state, so posting would be a false alarm.
    if (previous !== 'online' && previous !== 'offline') {
      await prisma.cmsSetting.upsert({ where: { key: STATE_KEY }, create: { key: STATE_KEY, value: current }, update: { value: current } })
      await prisma.cmsSetting.upsert({ where: { key: SINCE_KEY }, create: { key: SINCE_KEY, value: String(now) }, update: { value: String(now) } })
      return Response.json({ online: status.online, changed: false, baseline: true })
    }

    if (previous === current) {
      return Response.json({ online: status.online, changed: false })
    }

    // Transition. Only the caller that actually flips the stored value (count
    // === 1) posts, so overlapping cron runs or replicas can't double-alert.
    const flip = await prisma.cmsSetting.updateMany({
      where: { key: STATE_KEY, value: previous },
      data: { value: current },
    })
    if (flip.count !== 1) {
      return Response.json({ online: status.online, changed: false, raced: true })
    }

    const sinceMs = Number(byKey.get(SINCE_KEY))
    const downtimeMs = current === 'online' && sinceMs > 0 ? now - sinceMs : undefined
    await prisma.cmsSetting.upsert({ where: { key: SINCE_KEY }, create: { key: SINCE_KEY, value: String(now) }, update: { value: String(now) } })

    const notified = await sendServerStatusAlert({ online: status.online, players: status.players, downtimeMs })
    return Response.json({ online: status.online, changed: true, notified, downtimeMs: downtimeMs ?? null })
  } catch (err) {
    console.error('status notify: failed', err)
    return Response.json({ error: 'notify failed' }, { status: 500 })
  }
}
