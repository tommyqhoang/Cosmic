import { NextRequest } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'
import { voteLimiter, clientIp } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

// Vote pingback / postback receiver.
//
// Vote sites call this URL server-to-server after a confirmed vote; we credit
// the voter's account vote points and record the vote in bit_votingrecords so
// the in-game 24h cooldown (MapleClient.getVoteTime) works. The vote shop NPC
// (1022101) lets players spend those points.
//
// The two sites verify differently:
//
//   TopG    — set Postback URL to:
//                https://shinyms.com/api/vote/topg?key=<TOPG_POSTBACK_KEY>
//             Append the account name to the vote link (…server-682556-<name>);
//             TopG returns it as `p_resp`. We match `key` against the env secret.
//
//   Gtop100 — set Pingback URL to:  https://shinyms.com/api/vote/gtop100
//             and Pingback Key to:  <GTOP100_PINGBACK_KEY>
//             Append ?vote=1&pingUsername=<name> to the vote link; Gtop100
//             returns it as `pb_name` and sends the key in the body as
//             `pingbackkey`. NOTE Gtop100 uses success=0 for a good vote and
//             batches up to 50 votes per JSON call under "Common".
//
// Without the matching secret in the env the endpoint refuses to credit.

type Provider = {
  points: number
  cooldownSec: number
  secretEnv: string
}

const PROVIDERS: Record<string, Provider> = {
  topg:    { points: 1, cooldownSec: 86_400, secretEnv: 'TOPG_POSTBACK_KEY' },    // 24h
  gtop100: { points: 1, cooldownSec: 43_200, secretEnv: 'GTOP100_PINGBACK_KEY' }, // 12h
}

// Flood cap per IP lives in lib/rate-limit (voteLimiter) so its Map is purged
// alongside the other limiters. The secret is the real guard; this just limits
// abuse if a secret ever leaks.

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

type ParseResult =
  | { ok: true; voters: string[] }
  | { ok: false; status: number; message: string }

// Merge query string and form/query body params into a flat lookup.
async function flatParams(req: NextRequest, body: unknown): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  req.nextUrl.searchParams.forEach((v, k) => { out[k.toLowerCase()] = v })
  if (body && typeof body === 'object' && !Array.isArray(body)) {
    for (const [k, v] of Object.entries(body as Record<string, unknown>)) {
      if (v !== null && typeof v !== 'object') out[k.toLowerCase()] = String(v)
    }
  }
  return out
}

function getCI(params: Record<string, string>, key: string): string | undefined {
  return params[key.toLowerCase()]
}

// Gtop100 JSON: { siteid, pingbackkey, Common: [ [ {pb_id},{ip},{success},{reason},{pb_name} ], ... ] }
function parseGtop100Json(body: Record<string, unknown>, secret: string): ParseResult {
  const key = body.pingbackkey
  if (typeof key !== 'string' || !safeEqual(key, secret)) {
    return { ok: false, status: 403, message: 'Invalid pingback key' }
  }
  const common = body.Common
  if (!Array.isArray(common)) return { ok: true, voters: [] }

  const voters: string[] = []
  for (const entry of common) {
    if (!Array.isArray(entry)) continue
    // Each entry is an array of single-key objects; flatten them.
    const m: Record<string, unknown> = {}
    for (const sub of entry) {
      if (sub && typeof sub === 'object') Object.assign(m, sub)
    }
    const success = Number(m.success) // 0 == successful vote
    const name = typeof m.pb_name === 'string' ? m.pb_name.trim() : ''
    if (success === 0 && name) voters.push(name)
  }
  return { ok: true, voters }
}

async function parseRequest(req: NextRequest, providerName: string, secret: string): Promise<ParseResult> {
  const contentType = req.headers.get('content-type') ?? ''

  // Read a body if present (POST). JSON is handled specially for Gtop100.
  let jsonBody: unknown = null
  let formBody: Record<string, string> | null = null
  if (req.method === 'POST') {
    try {
      if (contentType.includes('application/json')) {
        jsonBody = await req.json()
      } else {
        const fd = await req.formData()
        formBody = {}
        fd.forEach((v, k) => { formBody![k] = String(v) })
      }
    } catch {
      // fall through — query params may still carry everything
    }
  }

  if (providerName === 'gtop100' && jsonBody && typeof jsonBody === 'object' && 'Common' in (jsonBody as object)) {
    return parseGtop100Json(jsonBody as Record<string, unknown>, secret)
  }

  const params = await flatParams(req, jsonBody ?? formBody)

  if (providerName === 'gtop100') {
    // Non-JSON Gtop100 pingback (single vote, flat fields).
    const key = getCI(params, 'pingbackkey') ?? ''
    if (!safeEqual(key, secret)) return { ok: false, status: 403, message: 'Invalid pingback key' }
    const success = getCI(params, 'success')
    if (success !== undefined && Number(success) !== 0) return { ok: true, voters: [] }
    const name = (getCI(params, 'pb_name') ?? getCI(params, 'pingusername') ?? '').trim()
    return { ok: true, voters: name ? [name] : [] }
  }

  // TopG: shared secret in the URL (?key=), voter name in p_resp.
  const key = getCI(params, 'key') ?? getCI(params, 'secret') ?? ''
  if (!safeEqual(key, secret)) return { ok: false, status: 403, message: 'Invalid vote key' }
  const name = (getCI(params, 'p_resp') ?? getCI(params, 'voter') ?? getCI(params, 'username') ?? '').trim()
  return { ok: true, voters: name ? [name] : [] }
}

// Credit one voter, honoring the per-provider cooldown so repeated/batched
// pingbacks can't double-credit. Returns silently on unknown account.
async function creditVote(username: string, provider: Provider): Promise<void> {
  const account = await prisma.account.findFirst({
    where: { name: username }, // MySQL default collation is case-insensitive
    select: { id: true, name: true },
  }).catch(() => null)
  if (!account) return

  const now = Math.floor(Date.now() / 1000)

  // Credit atomically. The conditional upsert sets the cooldown timestamp only
  // when there is no prior vote or the last one is older than the cooldown;
  // MySQL serializes concurrent upserts on the PK, so exactly one of N racing
  // pingbacks for the same account changes the row (affectedRows >= 1) and earns
  // the points. The points increment shares the transaction, so a failure rolls
  // back the claim too — no record without credit, and no read-then-write
  // double-credit window.
  await prisma.$transaction(async (tx) => {
    const claimed = await tx.$executeRaw`
      INSERT INTO bit_votingrecords (account, date) VALUES (${account.name}, ${now})
      ON DUPLICATE KEY UPDATE date = IF(${now} - date >= ${provider.cooldownSec}, ${now}, date)
    `
    if (claimed < 1) return // still within the cooldown window — no credit
    await tx.account.update({
      where: { id: account.id },
      data: { votepoints: { increment: provider.points } },
    })
  }).catch(() => { /* swallow — vote site retries on a non-2xx response */ })
}

async function handle(req: NextRequest, providerName: string) {
  const provider = PROVIDERS[providerName]
  if (!provider) return new Response('Unknown vote provider', { status: 404 })

  const secret = process.env[provider.secretEnv]
  if (!secret) return new Response('Vote provider not configured', { status: 503 })

  if (!voteLimiter.check(clientIp(req.headers))) {
    return new Response('Too many requests', { status: 429 })
  }

  const parsed = await parseRequest(req, providerName, secret)
  if (!parsed.ok) return new Response(parsed.message, { status: parsed.status })

  for (const voter of parsed.voters) {
    await creditVote(voter, provider)
  }

  // Gtop100 wants a 2xx so it stops retrying; TopG just needs 200.
  return new Response('1', { status: 200 })
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params
  return handle(req, provider)
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ provider: string }> }) {
  const { provider } = await ctx.params
  return handle(req, provider)
}
