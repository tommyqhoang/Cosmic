import { checkServerOnline } from '@/lib/server-check'
import { prisma } from '@/lib/prisma'

type StatusResult = { online: boolean; players: number; ts: number }

let cache: StatusResult | null = null
let inflight: Promise<StatusResult> | null = null

async function fetchStatus(): Promise<StatusResult> {
  const host = process.env.GAME_SERVER_HOST ?? 'localhost'
  const port = Number(process.env.GAME_LOGIN_PORT ?? 8484)

  // Count in-game players (loggedin = 2) straight from the shared DB — the game
  // writes this regardless of whether the login port is reachable from the web
  // host (game on VPS, web on Railway). Don't gate the count behind the TCP probe.
  const [tcpOnline, players] = await Promise.all([
    checkServerOnline(host, port),
    prisma.account.count({ where: { loggedin: 2 } }).catch(() => 0),
  ])

  // Reachable port OR players currently in-game both prove the server is up.
  return { online: tcpOnline || players > 0, players, ts: Date.now() }
}

const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=10' }

export async function GET() {
  const now = Date.now()
  if (cache && now - cache.ts < 30_000) {
    return Response.json(cache, { headers: CACHE_HEADERS })
  }

  // Single-flight: deduplicate concurrent requests that arrive while a fetch is in progress
  if (!inflight) {
    inflight = fetchStatus().then(
      result => { cache = result; inflight = null; return result },
      err => { inflight = null; throw err },
    )
  }

  const result = await inflight
  return Response.json(result, { headers: CACHE_HEADERS })
}
