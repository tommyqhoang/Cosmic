import { getLiveServerStatus, type ServerStatus } from '@/lib/server-status'

let cache: ServerStatus | null = null
let inflight: Promise<ServerStatus> | null = null

const CACHE_HEADERS = { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=10' }

export async function GET() {
  const now = Date.now()
  if (cache && now - cache.ts < 30_000) {
    return Response.json(cache, { headers: CACHE_HEADERS })
  }

  // Single-flight: deduplicate concurrent requests that arrive while a fetch is in progress
  if (!inflight) {
    inflight = getLiveServerStatus().then(
      result => { cache = result; inflight = null; return result },
      err => { inflight = null; throw err },
    )
  }

  const result = await inflight
  return Response.json(result, { headers: CACHE_HEADERS })
}
