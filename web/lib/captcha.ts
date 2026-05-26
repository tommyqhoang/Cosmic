/**
 * Cloudflare Turnstile server-side verification.
 *
 * If TURNSTILE_SECRET_KEY is not configured, verification is skipped (returns
 * true) so local development and pre-key deployments keep working. Set the key
 * in production to enforce the CAPTCHA.
 */
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export function captchaEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return true // Not configured — skip enforcement.
  if (!token) return false

  try {
    const form = new URLSearchParams()
    form.append('secret', secret)
    form.append('response', token)
    if (ip) form.append('remoteip', ip)

    const res = await fetch(VERIFY_URL, { method: 'POST', body: form })
    if (!res.ok) return false
    const data = (await res.json()) as { success?: boolean }
    return data.success === true
  } catch {
    return false
  }
}
