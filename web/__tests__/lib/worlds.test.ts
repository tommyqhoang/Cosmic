import { WORLDS, FLAG_LABEL } from '@/lib/worlds'

describe('worlds config', () => {
  it('has at least one well-formed world with unique ids', () => {
    expect(WORLDS.length).toBeGreaterThanOrEqual(1)
    const ids = new Set<number>()
    for (const w of WORLDS) {
      expect(w.name.length).toBeGreaterThan(0)
      expect(w.channels).toBeGreaterThanOrEqual(1)
      expect([0, 1, 2, 3]).toContain(w.flag)
      expect(ids.has(w.id)).toBe(false)
      ids.add(w.id)
    }
  })

  it('FLAG_LABEL covers every flag value', () => {
    for (const f of [0, 1, 2, 3] as const) {
      expect(Object.prototype.hasOwnProperty.call(FLAG_LABEL, String(f))).toBe(true)
    }
    expect(FLAG_LABEL[0]).toBeNull() // 0 = no badge
  })
})
