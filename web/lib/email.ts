import { Resend } from 'resend'

// Resend is optional: when RESEND_API_KEY is unset (local dev, or before the key
// is provisioned) every send becomes a no-op instead of throwing — the same
// graceful-skip pattern the Turnstile CAPTCHA uses. Subscribing still works; no
// mail just goes out.
const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null

// "ShinyMS <noreply@shinyms.com>" — must be a verified Resend sender/domain.
const FROM = process.env.EMAIL_FROM || 'ShinyMS <noreply@shinyms.com>'

const DISCORD_INVITE = 'https://discord.gg/jKueJFAErs'

export function emailEnabled(): boolean {
  return resend !== null
}

// Absolute base URL for links + sprite images inside emails. Prefers the
// explicitly configured site URL, then the NextAuth URL, then the production
// domain. Sprites live under /maple in public/ and must be referenced absolutely
// so they resolve inside an email client.
function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://shinyms.com'
  return raw.replace(/\/$/, '')
}

export function unsubscribeUrl(token: string): string {
  return `${siteUrl()}/unsubscribe?token=${encodeURIComponent(token)}`
}

// Maple-flavored metadata per announcement category, shared by the email badge
// and the Discord embed so both channels look consistent. `hex` is the CSS color
// for email; `decimal` is the same color for Discord's embed `color` field.
const CATEGORY: Record<string, { label: string; emoji: string; hex: string; decimal: number }> = {
  changelog:   { label: 'Changelog',   emoji: '📜', hex: '#3b6ea5', decimal: 0x3b6ea5 },
  maintenance: { label: 'Maintenance', emoji: '🔧', hex: '#e8a23a', decimal: 0xe8a23a },
  alert:       { label: 'Alert',       emoji: '🚨', hex: '#dc4b4b', decimal: 0xdc4b4b },
  event:       { label: 'Event',       emoji: '🎉', hex: '#4caf50', decimal: 0x4caf50 },
  update:      { label: 'Update',      emoji: '✨', hex: '#8b5cf6', decimal: 0x8b5cf6 },
}
function categoryMeta(category: string) {
  return CATEGORY[category] ?? { label: category, emoji: '🍄', hex: '#3b6ea5', decimal: 0x3b6ea5 }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Announcement bodies are authored in Markdown. A full Markdown→HTML pipeline is
// overkill for email (and a sanitization liability), so we escape everything and
// then re-apply just the handful of inline marks worth rendering: bold, italic,
// links, and paragraph/line breaks.
function renderBody(markdown: string): string {
  const blocks = escapeHtml(markdown.trim())
    .split(/\n{2,}/)
    .map((block) => {
      const inline = block
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" style="color:#3b6ea5">$1</a>')
        .replace(/\n/g, '<br>')
      return `<p style="margin:0 0 16px;line-height:1.7;color:#33405a;font-size:15px">${inline}</p>`
    })
  return blocks.join('')
}

// Shared chrome so both emails feel like a window into Maple World: a sky-blue
// header band with the slime mascot + ShinyMS wordmark, then the body, then a
// grassy footer strip with a friendly sign-off. `body` is trusted HTML built by
// the caller; `footerNote` is the small print under the grass.
function shell(body: string, footerNote: string, discordInvite?: string): string {
  const url = siteUrl()
  const invite = discordInvite?.trim() || DISCORD_INVITE
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#dcebf8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#dcebf8;padding:24px 12px">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:2px solid #2a4a73;box-shadow:0 16px 40px -12px rgba(26,58,92,0.35)">
          <!-- Sky header with mascot -->
          <tr><td style="background:linear-gradient(180deg,#3a7bc0 0%,#5b9bd6 60%,#79b4e2 100%);padding:24px 28px 18px;text-align:center">
            <img src="${url}/maple/mobs/slime.gif" width="56" height="48" alt="" style="display:block;margin:0 auto 8px;height:48px;width:auto" />
            <div style="font-size:19px;font-weight:700;letter-spacing:0.06em;color:#ffffff;text-shadow:0 1px 0 rgba(26,58,92,0.4)">ShinyMS</div>
            <div style="font-size:12px;color:rgba(255,255,255,0.85);margin-top:2px">MapleStory v83 · the way you remember it</div>
          </td></tr>
          <!-- Grass strip under the sky -->
          <tr><td style="height:10px;background:linear-gradient(180deg,#7ec850 0%,#5fae3a 100%);border-bottom:2px solid #4e9430"></td></tr>
          <!-- Body -->
          <tr><td style="padding:28px">${body}</td></tr>
          <!-- Footer -->
          <tr><td style="padding:18px 28px;border-top:1px solid #e6edf5;background:#f5f9fd">
            <p style="margin:0 0 6px;font-size:13px;color:#5a6a82">🍄 See you in Maple World — <a href="${invite}" style="color:#5865F2;text-decoration:none;font-weight:600">join us on Discord</a></p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:#9aa6b8">${footerNote}</p>
          </td></tr>
        </table>
        <p style="max-width:600px;margin:14px auto 0;font-size:11px;color:#8aa0bc">ShinyMS is a free, fan-made server and is not affiliated with NEXON or Wizet.</p>
      </td></tr>
    </table>
  </body>
</html>`
}

function announcementHtml(post: { title: string; content: string; category: string }, token: string, discordInvite?: string): string {
  const unsub = unsubscribeUrl(token)
  const url = siteUrl()
  const cat = categoryMeta(post.category)
  const body = `
    <span style="display:inline-block;padding:5px 12px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#ffffff;background:${cat.hex};margin-bottom:14px">${cat.emoji} ${escapeHtml(cat.label)}</span>
    <h1 style="margin:0 0 18px;font-size:24px;line-height:1.3;color:#1c1527">${escapeHtml(post.title)}</h1>
    ${renderBody(post.content)}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:26px">
      <tr><td style="border-radius:12px;background:#ff7e3e">
        <a href="${url}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none">Read on ShinyMS &rarr;</a>
      </td></tr>
    </table>`
  const footer = `You're getting this because you subscribed to ShinyMS announcements. <a href="${unsub}" style="color:#9aa6b8;text-decoration:underline">Unsubscribe</a>`
  return shell(body, footer, discordInvite)
}

function welcomeHtml(token: string, discordInvite?: string): string {
  const unsub = unsubscribeUrl(token)
  const url = siteUrl()
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;line-height:1.3;color:#1c1527">Welcome to Maple World! 🍄</h1>
    <p style="margin:0 0 16px;line-height:1.7;color:#33405a;font-size:15px">Your snail-slaying days are about to get a lot more eventful. You're now subscribed to ShinyMS announcements — we'll send a scroll your way whenever there's a new <strong>event</strong>, <strong>update</strong>, or <strong>maintenance</strong> notice.</p>
    <p style="margin:0 0 8px;line-height:1.7;color:#33405a;font-size:15px">No spam, no level-up grind required. Just the news that matters.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px">
      <tr><td style="border-radius:12px;background:#ff7e3e">
        <a href="${url}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none">Jump into the game &rarr;</a>
      </td></tr>
    </table>`
  const footer = `Changed your mind? <a href="${unsub}" style="color:#9aa6b8;text-decoration:underline">Unsubscribe</a> anytime — no hard feelings.`
  return shell(body, footer, discordInvite)
}

export async function sendWelcomeEmail(to: string, token: string, discordInvite?: string): Promise<void> {
  if (!resend) return
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: '🍄 Welcome to ShinyMS announcements!',
      html: welcomeHtml(token, discordInvite),
      headers: { 'List-Unsubscribe': `<${unsubscribeUrl(token)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
    })
  } catch (err) {
    console.error('sendWelcomeEmail failed', err)
  }
}

type Subscriber = { email: string; token: string }
type AnnouncementPost = { title: string; content: string; category: string }

// Sends one announcement email per active subscriber. Resend's batch endpoint
// accepts up to 100 distinct messages per call, so we chunk. Each message carries
// the recipient's own unsubscribe token. Returns how many were dispatched.
export async function sendAnnouncementEmails(post: AnnouncementPost, subscribers: Subscriber[], discordInvite?: string): Promise<number> {
  if (!resend || subscribers.length === 0) return 0

  const cat = categoryMeta(post.category)
  const subject = `${cat.emoji} [ShinyMS] ${post.title}`
  let sent = 0

  for (let i = 0; i < subscribers.length; i += 100) {
    const chunk = subscribers.slice(i, i + 100)
    const messages = chunk.map((sub) => ({
      from: FROM,
      to: sub.email,
      subject,
      html: announcementHtml(post, sub.token, discordInvite),
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl(sub.token)}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }))
    try {
      await resend.batch.send(messages)
      sent += chunk.length
    } catch (err) {
      console.error('sendAnnouncementEmails batch failed', err)
    }
  }
  return sent
}

// Mirrors a published announcement to a Discord channel via an incoming webhook.
// Optional: no-ops when DISCORD_WEBHOOK_URL is unset. The message is a single
// embed colored by category, with the body trimmed to Discord's 4096-char limit
// and a link back to the site.
export async function sendDiscordAnnouncement(post: AnnouncementPost): Promise<void> {
  const webhook = process.env.DISCORD_WEBHOOK_URL
  if (!webhook) return

  const cat = categoryMeta(post.category)
  const description = post.content.length > 4000 ? `${post.content.slice(0, 3997)}...` : post.content

  const payload = {
    username: 'ShinyMS',
    embeds: [
      {
        title: `${cat.emoji} ${post.title}`.slice(0, 256),
        description,
        url: siteUrl(),
        color: cat.decimal,
        author: { name: cat.label },
        footer: { text: 'ShinyMS Announcements' },
        timestamp: new Date().toISOString(),
      },
    ],
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) console.error('sendDiscordAnnouncement non-OK', res.status)
  } catch (err) {
    console.error('sendDiscordAnnouncement failed', err)
  }
}
