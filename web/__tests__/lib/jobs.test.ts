/** @jest-environment node */
import { getJobName, getJobClass } from '@/lib/jobs'

describe('getJobName', () => {
  it('returns the name for known job ids', () => {
    expect(getJobName(0)).toBe('Beginner')
    expect(getJobName(112)).toBe('Hero')
    expect(getJobName(212)).toBe('F/P Arch Mage')
    expect(getJobName(522)).toBe('Corsair')
  })

  it('falls back to Unknown for an unknown id', () => {
    expect(getJobName(999)).toBe('Unknown')
    expect(getJobName(-1)).toBe('Unknown')
  })
})

describe('getJobClass', () => {
  it('maps ids to their class bucket', () => {
    expect(getJobClass(0)).toBe('Beginner')
    expect(getJobClass(112)).toBe('Warrior')
    expect(getJobClass(212)).toBe('Mage')
    expect(getJobClass(312)).toBe('Bowman')
    expect(getJobClass(412)).toBe('Thief')
    expect(getJobClass(512)).toBe('Pirate')
  })

  it('falls back to Beginner for an out-of-range id', () => {
    // 700 is between Pirate (500–599) and GM (900–999) — no class covers it.
    expect(getJobClass(700)).toBe('Beginner')
    expect(getJobClass(-5)).toBe('Beginner')
  })

  it('classifies GM range correctly', () => {
    expect(getJobClass(900)).toBe('GM')
    expect(getJobClass(910)).toBe('SuperGM')
    expect(getJobClass(999)).toBe('SuperGM')
  })
})
