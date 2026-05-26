/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/contact/route'
import { contactLimiter } from '../../lib/rate-limit'
import { verifyTurnstile } from '../../lib/captcha'
import { sendContactMessage } from '../../lib/contact'

jest.mock('../../lib/rate-limit', () => ({
  contactLimiter: { check: jest.fn(() => true) },
  clientIp: jest.fn(() => '1.2.3.4'),
}))
jest.mock('../../lib/captcha', () => ({ verifyTurnstile: jest.fn(async () => true) }))
jest.mock('../../lib/contact', () => {
  const actual = jest.requireActual('../../lib/contact')
  return { ...actual, sendContactMessage: jest.fn(async () => undefined) }
})

const limiterCheck = contactLimiter.check as jest.Mock
const verify = verifyTurnstile as jest.Mock
const send = sendContactMessage as jest.Mock

function req(body: unknown) {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

const general = { type: 'general', email: 'a@b.com', subtype: 'donation', message: 'Hello there', captchaToken: 'tok' }
const appeal = { type: 'appeal', email: 'a@b.com', username: 'player1', reason: 'Wrongly banned', proof: 'https://i.mgur/x', captchaToken: 'tok' }
const feature = { type: 'feature', email: 'a@b.com', featureName: 'Auto loot', description: 'Pick up drops', valueAdd: 'Less tedium', captchaToken: 'tok' }
const bug = { type: 'bug', email: 'a@b.com', issueTitle: 'Crash on login', accountUsername: 'player1', description: 'It crashes', hardship: 'Cannot play', severity: 'high', proof: 'https://x', captchaToken: 'tok' }

describe('POST /api/contact', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    limiterCheck.mockReturnValue(true)
    verify.mockResolvedValue(true)
    send.mockResolvedValue(undefined)
  })

  it.each([
    ['general', general],
    ['appeal', appeal],
    ['feature', feature],
    ['bug', bug],
  ])('200 and delivers a %s submission', async (_name, payload) => {
    const res = await POST(req(payload))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(send).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ type: payload.type, email: 'a@b.com' }))
  })

  it('strips transport-only fields (captchaToken/_hp) before delivery', async () => {
    await POST(req({ ...general, _hp: '' }))
    const arg = send.mock.calls[0][0]
    expect(arg).not.toHaveProperty('captchaToken')
    expect(arg).not.toHaveProperty('_hp')
  })

  it('429 when the rate limiter rejects', async () => {
    limiterCheck.mockReturnValue(false)
    const res = await POST(req(general))
    expect(res.status).toBe(429)
    expect(send).not.toHaveBeenCalled()
  })

  it('400 on an unparseable body', async () => {
    const res = await POST(req('not json'))
    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ error: 'Invalid request body' })
  })

  it('honeypot: 200 but does NOT deliver when _hp is filled', async () => {
    const res = await POST(req({ ...general, _hp: 'i-am-a-bot' }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(send).not.toHaveBeenCalled()
    expect(verify).not.toHaveBeenCalled()
  })

  it('400 on an invalid email', async () => {
    const res = await POST(req({ ...general, email: 'nope' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Please enter a valid email address.')
    expect(send).not.toHaveBeenCalled()
  })

  it('400 on an unknown type', async () => {
    const res = await POST(req({ ...general, type: 'spam' }))
    expect(res.status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })

  it('400 when a required field is missing', async () => {
    const res = await POST(req({ type: 'general', email: 'a@b.com', subtype: 'donation', captchaToken: 'tok' }))
    expect(res.status).toBe(400)
    expect(send).not.toHaveBeenCalled()
  })

  it('400 on an invalid bug severity', async () => {
    const res = await POST(req({ ...bug, severity: 'apocalyptic' }))
    expect(res.status).toBe(400)
  })

  it('400 on a non-alphanumeric appeal username', async () => {
    const res = await POST(req({ ...appeal, username: 'bad name!' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toBe('Username must be letters and numbers only.')
  })

  it('403 when the captcha fails', async () => {
    verify.mockResolvedValue(false)
    const res = await POST(req(general))
    expect(res.status).toBe(403)
    expect(send).not.toHaveBeenCalled()
  })

  it('500 when delivery throws (e.g. webhook unset / Discord down)', async () => {
    send.mockRejectedValue(new Error('webhook unset'))
    const res = await POST(req(general))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/Could not send/)
  })
})
