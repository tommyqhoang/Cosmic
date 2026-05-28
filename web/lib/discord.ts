// Posts server up/down alerts to a Discord channel via an incoming webhook.
// The webhook URL is a secret and lives only in DISCORD_STATUS_WEBHOOK_URL (env)
// — never commit a real URL. When unset, alerts are silently disabled so dev and
// PR previews don't post. Mentions are disabled (allowed_mentions parse:[]) so a
// crafted status message can never @everyone, matching the announcements and
// contact webhooks.

const COLOR_DOWN = 0xed4245 // Discord red
const COLOR_UP = 0x57f287 // Discord green

type DiscordEmbed = {
  title: string
  description?: string
  color: number
  timestamp: string
}

export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.round(ms / 1000))
  const d = Math.floor(totalSec / 86400)
  const h = Math.floor((totalSec % 86400) / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const parts: string[] = []
  if (d) parts.push(`${d}d`)
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m}m`)
  if (!d && !h && (s || !m)) parts.push(`${s}s`)
  return parts.join(' ')
}

async function postWebhook(url: string, embed: DiscordEmbed): Promise<void> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed], allowed_mentions: { parse: [] } }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.warn(`Discord status webhook returned ${res.status}: ${text.slice(0, 200)}`)
  }
}

// Sends the alert if a webhook is configured. Returns true when a request was
// made, false when disabled (no webhook) — callers use this for logging only.
export async function sendServerStatusAlert(args: {
  online: boolean
  players: number
  downtimeMs?: number
}): Promise<boolean> {
  const url = process.env.DISCORD_STATUS_WEBHOOK_URL?.trim()
  if (!url) return false

  const timestamp = new Date().toISOString()
  const embed: DiscordEmbed = args.online
    ? {
        title: '🟢 Server is back ONLINE',
        description:
          args.downtimeMs != null && args.downtimeMs > 0
            ? `Recovered after ${formatDuration(args.downtimeMs)} of downtime. ${args.players} player(s) online.`
            : `${args.players} player(s) online.`,
        color: COLOR_UP,
        timestamp,
      }
    : {
        title: '🔴 Server is DOWN',
        description: 'The game server is unreachable from the website.',
        color: COLOR_DOWN,
        timestamp,
      }

  try {
    await postWebhook(url, embed)
    return true
  } catch (err) {
    console.warn('Discord status webhook request failed', err)
    return false
  }
}
