/** @jest-environment node */
import { safeDecode } from '@/lib/url'

describe('safeDecode', () => {
  it('decodes a valid percent-encoded string', () => {
    expect(safeDecode('hello%20world')).toBe('hello world')
    expect(safeDecode('%E4%BD%A0%E5%A5%BD')).toBe('你好')
  })

  it('returns the input unchanged when nothing is encoded', () => {
    expect(safeDecode('plain')).toBe('plain')
  })

  it('returns null on a malformed percent-escape', () => {
    expect(safeDecode('%E0%A4')).toBeNull()
    expect(safeDecode('%')).toBeNull()
  })
})
