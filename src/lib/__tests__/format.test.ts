import { describe, it, expect } from 'vitest'
import {
  shortenTxId,
  shortenAddress,
  formatTokenAmount,
  formatDateLocal,
  formatDateTimeUtc,
} from '@/lib/format'

describe('shortenTxId', () => {
  const full = '5x8f9a2b7c1d3e5f6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'

  it('shortens long ids with ellipsis', () => {
    const out = shortenTxId(full)
    expect(out).toContain('…')
    expect(out.startsWith(full.slice(0, 4))).toBe(true)
    expect(out.endsWith(full.slice(-4))).toBe(true)
    expect(out.length).toBeLessThan(15)
  })

  it('returns short ids unchanged', () => {
    expect(shortenTxId('abc')).toBe('abc')
    expect(shortenTxId('')).toBe('')
  })
})

describe('shortenAddress', () => {
  it('keeps prefix/suffix', () => {
    const out = shortenAddress('GxYabcGxYabcGxYabcGxYabcGxYabcGxYabcp9Q')
    expect(out.startsWith('GxYabc')).toBe(true)
    expect(out.endsWith('p9Q')).toBe(true)
    expect(out).toContain('…')
  })
})

describe('formatTokenAmount', () => {
  it('groups thousands US style', () => {
    expect(formatTokenAmount(1250)).toBe('1,250')
    expect(formatTokenAmount(1234567.891)).toBe('1,234,567.89')
  })

  it('handles zero and invalid safely', () => {
    expect(formatTokenAmount(0)).toBe('0')
    expect(formatTokenAmount(Number.NaN)).toBe('0')
  })
})

describe('date formatting separation (manual Anexo A)', () => {
  const iso = '2026-08-13T14:32:00Z'
  const date = new Date(iso)

  it('UTC output is exact ISO 8601 regardless of browser timezone', () => {
    expect(formatDateTimeUtc(iso)).toBe(iso.replace('.000', '') || iso)
    expect(formatDateTimeUtc(date)).toMatch(/^2026-08-13T14:32:00Z$/)
  })

  it('local output differs from UTC rendering path and is non-empty', () => {
    const local = formatDateLocal(date)
    expect(local.length).toBeGreaterThan(0)
    expect(local).toContain('2026')
    expect(local).toContain('-')
  })

  it('invalid dates render empty instead of throwing', () => {
    expect(formatDateLocal('not-a-date')).toBe('')
    expect(formatDateTimeUtc('not-a-date')).toBe('')
  })
})
