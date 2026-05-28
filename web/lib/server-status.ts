import { checkServerOnline } from '@/lib/server-check'
import { prisma } from '@/lib/prisma'

export type ServerStatus = { online: boolean; players: number; ts: number }

// Single source of truth for "is the game server up + how many are on". Used by
// the public status endpoint and the cron-driven Discord notifier so both agree.
export async function getLiveServerStatus(): Promise<ServerStatus> {
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
