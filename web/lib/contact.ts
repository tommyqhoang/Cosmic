import { z } from 'zod'

// Contact form: a single endpoint with four inquiry types, each with its own
// fields. The zod discriminated union below is the single source of truth for
// validation (server route) and the inferred TypeScript types (client form).
//
// Submissions are delivered to staff as a Discord embed via a dedicated webhook
// (DISCORD_CONTACT_WEBHOOK_URL) — separate from the announcements webhook.

export const SUBTYPES = ['advertisement', 'job', 'marketing', 'donation', 'other'] as const
export const SEVERITIES = ['low', 'medium', 'high', 'critical'] as const

export type Subtype = (typeof SUBTYPES)[number]
export type Severity = (typeof SEVERITIES)[number]

// Shared field constraints. Max lengths keep payloads small and stay within
// Discord's embed limits (title ≤ 256, each field value ≤ 1024). Email is
// required on every type so staff always have an off-Discord reply path.
const email = z.string().trim().email('Please enter a valid email address.').max(254)
const username = z
  .string()
  .trim()
  .min(4, 'Username must be 4–13 characters.')
  .max(13, 'Username must be 4–13 characters.')
  .regex(/^[a-zA-Z0-9]+$/, 'Username must be letters and numbers only.')
const shortText = z.string().trim().min(1, 'This field is required.').max(100)
const longText = z.string().trim().min(1, 'This field is required.').max(1500)

const general = z.object({
  type: z.literal('general'),
  email,
  subtype: z.enum(SUBTYPES),
  message: longText,
})

const appeal = z.object({
  type: z.literal('appeal'),
  email,
  username,
  reason: longText,
  proof: longText,
})

const feature = z.object({
  type: z.literal('feature'),
  email,
  featureName: shortText,
  description: longText,
  valueAdd: longText,
})

const bug = z.object({
  type: z.literal('bug'),
  email,
  issueTitle: shortText,
  accountUsername: username,
  description: longText,
  hardship: longText,
  severity: z.enum(SEVERITIES),
  proof: longText,
})

export const contactSchema = z.discriminatedUnion('type', [general, appeal, feature, bug])
export type ContactInput = z.infer<typeof contactSchema>

// --- Discord embed -------------------------------------------------------

const TYPE_META: Record<ContactInput['type'], { label: string; emoji: string; color: number }> = {
  general: { label: 'General Inquiry', emoji: '✉️', color: 0x3b6ea5 },
  appeal: { label: 'Ban Appeal', emoji: '⚖️', color: 0xb45309 },
  feature: { label: 'Feature Request', emoji: '✨', color: 0x7c3aed },
  bug: { label: 'Bug Report', emoji: '🐛', color: 0xb91c1c },
}

const SUBTYPE_LABEL: Record<Subtype, string> = {
  advertisement: 'Advertisement',
  job: 'Job Application',
  marketing: 'Marketing',
  donation: 'Donation',
  other: 'Other',
}

const SEVERITY_META: Record<Severity, { label: string; color: number }> = {
  low: { label: 'Low', color: 0x3b6ea5 },
  medium: { label: 'Medium', color: 0xc89a2e },
  high: { label: 'High', color: 0xb45309 },
  critical: { label: 'Critical', color: 0xb91c1c },
}

function trunc(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

type EmbedField = { name: string; value: string; inline?: boolean }

// Builds the per-type embed title, color, author label, and field list. The
// caller prepends the always-present Email field.
function buildEmbed(input: ContactInput): {
  title: string
  color: number
  author: string
  fields: EmbedField[]
} {
  const meta = TYPE_META[input.type]

  switch (input.type) {
    case 'general':
      return {
        title: `General: ${SUBTYPE_LABEL[input.subtype]}`,
        color: meta.color,
        author: meta.label,
        fields: [
          { name: 'Subtype', value: SUBTYPE_LABEL[input.subtype], inline: true },
          { name: 'Message', value: trunc(input.message, 1024) },
        ],
      }
    case 'appeal':
      return {
        title: `Ban Appeal: ${input.username}`,
        color: meta.color,
        author: meta.label,
        fields: [
          { name: 'Username', value: input.username, inline: true },
          { name: 'Reason for appeal', value: trunc(input.reason, 1024) },
          { name: 'Proof', value: trunc(input.proof, 1024) },
        ],
      }
    case 'feature':
      return {
        title: trunc(input.featureName, 256),
        color: meta.color,
        author: meta.label,
        fields: [
          { name: 'Feature name', value: trunc(input.featureName, 1024) },
          { name: 'Description', value: trunc(input.description, 1024) },
          { name: 'Value add', value: trunc(input.valueAdd, 1024) },
        ],
      }
    case 'bug': {
      const sev = SEVERITY_META[input.severity]
      return {
        title: trunc(input.issueTitle, 256),
        color: sev.color, // bug embeds are colored by severity
        author: `${meta.label} · ${sev.label}`,
        fields: [
          { name: 'Severity', value: sev.label, inline: true },
          { name: 'Account', value: input.accountUsername, inline: true },
          { name: 'Description', value: trunc(input.description, 1024) },
          { name: 'Hardship faced', value: trunc(input.hardship, 1024) },
          { name: 'Proof', value: trunc(input.proof, 1024) },
        ],
      }
    }
  }
}

/**
 * Delivers a validated contact submission to the staff Discord channel.
 *
 * Unlike the announcements webhook (which no-ops when unset), a contact message
 * that can't be delivered is a real, user-visible failure — the message would
 * otherwise be silently lost. So this throws when the webhook is unconfigured or
 * the request fails, letting the API route surface a 500 to the sender.
 */
export async function sendContactMessage(input: ContactInput): Promise<void> {
  const webhook = process.env.DISCORD_CONTACT_WEBHOOK_URL
  if (!webhook) throw new Error('DISCORD_CONTACT_WEBHOOK_URL is not configured')

  const { title, color, author, fields } = buildEmbed(input)

  const payload = {
    username: 'ShinyMS Contact',
    embeds: [
      {
        title: `${TYPE_META[input.type].emoji} ${title}`.slice(0, 256),
        color,
        author: { name: author },
        // Email first so staff can reply; IP is intentionally NOT included to
        // avoid leaking PII into a chat channel.
        fields: [{ name: 'Reply-to email', value: trunc(input.email, 1024), inline: true }, ...fields],
        footer: { text: 'ShinyMS Contact' },
        timestamp: new Date().toISOString(),
      },
    ],
  }

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Discord contact webhook returned ${res.status}`)
}
