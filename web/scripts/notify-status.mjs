// Cron entrypoint: pings the deployed notify route, which checks the game server
// and posts a Discord alert on an up/down transition. Intended as the start
// command of a Railway cron service (schedule e.g. `* * * * *`) using the web
// image: `node scripts/notify-status.mjs`.
//
// Env:
//   NOTIFY_BASE_URL        base URL of the deployed site (falls back to
//                          NEXT_PUBLIC_SITE_URL), e.g. https://shinyms.com
//   STATUS_NOTIFY_SECRET   shared secret; sent as `Authorization: Bearer ...`
const base = (process.env.NOTIFY_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || '').trim()
const secret = (process.env.STATUS_NOTIFY_SECRET || '').trim()

if (!base) {
  console.error('[notify-status] NOTIFY_BASE_URL (or NEXT_PUBLIC_SITE_URL) is required')
  process.exit(1)
}

const url = new URL('/api/server/status/notify', base)
const headers = secret ? { Authorization: `Bearer ${secret}` } : {}

try {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) })
  const text = await res.text().catch(() => '')
  console.log(`[notify-status] ${res.status} ${text}`)
  process.exit(res.ok ? 0 : 1)
} catch (err) {
  console.error('[notify-status] request failed', err)
  process.exit(1)
}
