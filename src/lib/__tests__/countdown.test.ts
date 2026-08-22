import { describe, it, expect } from 'vitest'
import { calculateTimeLeft } from '@/lib/countdown'

describe('calculateTimeLeft (countdown)', () => {
  it('future release returns positive components', () => {
    const now = new Date('2026-08-13T00:00:00Z')
    // +3 days, 12h, 45m, 30s
    const offsetMs = (((3 * 24 + 12) * 60 + 45) * 60 + 30) * 1000
    const left = calculateTimeLeft(new Date(now.getTime() + offsetMs), now)
    expect(left.days).toBe(3)
    expect(left.hours).toBe(12)
    expect(left.minutes).toBe(45)
    expect(left.seconds).toBe(30)
    expect(left.total).toBe(offsetMs)
  })

  it('release exactly now yields zeros (reached)', () => {
    const now = new Date('2026-08-13T00:00:00Z')
    const left = calculateTimeLeft(now, now)
    expect(left.total).toBe(0)
    expect(left.days).toBe(0)
    expect(left.seconds).toBe(0)
  })

  it('past release yields zeros', () => {
    const now = new Date('2026-08-13T00:00:00Z')
    const past = new Date(now.getTime() - 100_000_000)
    const left = calculateTimeLeft(past, now)
    expect(left.total).toBe(0)
  })

  it('all releases completed scenario → caller sees total<=0', () => {
    const now = new Date('2027-06-01T00:00:00Z')
    const lastRelease = new Date('2027-05-13T00:00:00Z')
    expect(calculateTimeLeft(lastRelease, now).total).toBeLessThanOrEqual(0)
  })

  it('invalid target is safe', () => {
    expect(calculateTimeLeft('garbage').total).toBe(0)
  })
})
