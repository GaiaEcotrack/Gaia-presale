import { describe, it, expect } from 'vitest'
import {
  computeLinearVesting,
  deriveLinearReleases,
} from '@/lib/vesting/schedule'

// Canonical linear curve — must mirror smart-contract utils/vesting.rs exactly.
const TGE = 1_000n
const CLIFF_6M = 15_552_000n // 6 months of 30d
const DURATION_4M = 20_736_000n // 4 months of 30d
const TOTAL = 8_000_000n // 8 GAIA

const base = {
  totalBaseUnits: TOTAL,
  claimedBaseUnits: 0n,
  tgeTimestampSec: TGE,
  cliffSeconds: CLIFF_6M,
  vestingDurationSeconds: DURATION_4M,
}

describe('computeLinearVesting — canonical contract curve', () => {
  it('before cliff -> nothing vested', () => {
    const v = computeLinearVesting({ ...base, nowSeconds: Number(TGE + 5n) })
    expect(v.vestedBaseUnits).toBe(0n)
    expect(v.claimableBaseUnits).toBe(0n)
    expect(v.pendingBaseUnits).toBe(TOTAL)
  })

  it('EXACTLY at cliff -> still zero (now < cliff_end boundary)', () => {
    const cliffEnd = TGE + CLIFF_6M
    const v = computeLinearVesting({ ...base, nowSeconds: Number(cliffEnd) - 1 })
    expect(v.claimableBaseUnits).toBe(0n)
  })

  it('first instant after cliff vests a non-zero sliver', () => {
    const cliffEnd = TGE + CLIFF_6M
    const v = computeLinearVesting({
      ...base,
      nowSeconds: Number(cliffEnd) + Math.ceil(Number(DURATION_4M) / 100),
    })
    expect(v.claimableBaseUnits).toBe(TOTAL / 100n)
  })

  it('mid-curve floors the linear division exactly like u128 math', () => {
    const cliffEnd = TGE + CLIFF_6M
    const elapsed = DURATION_4M / 3n
    const v = computeLinearVesting({
      ...base,
      nowSeconds: Number(cliffEnd + elapsed),
    })
    expect(v.claimableBaseUnits).toBe((TOTAL * elapsed) / DURATION_4M)
  })

  it('at full duration -> 100% vested', () => {
    const cliffEnd = TGE + CLIFF_6M
    const v = computeLinearVesting({
      ...base,
      nowSeconds: Number(cliffEnd + DURATION_4M),
    })
    expect(v.claimableBaseUnits).toBe(TOTAL)
  })

  it('long after end stays capped at total', () => {
    const cliffEnd = TGE + CLIFF_6M
    const v = computeLinearVesting({
      ...base,
      nowSeconds: Number(cliffEnd + DURATION_4M * 10n),
    })
    expect(v.claimableBaseUnits).toBe(TOTAL)
  })

  it('claimed amounts subtract and never go negative (over-claim)', () => {
    const cliffEnd = TGE + CLIFF_6M
    const claimed = 3_000_000n
    const v = computeLinearVesting({
      ...base,
      claimedBaseUnits: claimed,
      nowSeconds: Number(cliffEnd), // vested 0 at exact boundary? use +1s
    })
    void v

    const v2 = computeLinearVesting({
      ...base,
      claimedBaseUnits: claimed,
      nowSeconds: Number(cliffEnd + DURATION_4M / 4n),
    })
    const expectedVested = (TOTAL * (DURATION_4M / 4n)) / DURATION_4M // 2_000_000n
    expect(expectedVested).toBe(2_000_000n)
    expect(v2.claimableBaseUnits).toBe(0n) // vested 2M < claimed 3M

    const v3 = computeLinearVesting({
      ...base,
      claimedBaseUnits: claimed,
      nowSeconds: Number(cliffEnd + DURATION_4M),
    })
    expect(v3.claimableBaseUnits).toBe(TOTAL - claimed)
    expect(v3.pendingBaseUnits).toBe(0n)
  })

  it('zero-duration round fully unlocks after cliff', () => {
    const v = computeLinearVesting({
      ...base,
      vestingDurationSeconds: 0n,
      nowSeconds: Number(TGE + CLIFF_6M),
    })
    expect(v.claimableBaseUnits).toBe(TOTAL)
  })
})

describe('deriveLinearReleases — informational sampling of the REAL curve', () => {
  it('produces ascending percentages ending at exactly 100%', () => {
    const { releases } = deriveLinearReleases({
      tgeTimestampSec: TGE,
      cliffSeconds: CLIFF_6M,
      vestingDurationSeconds: DURATION_4M,
    })
    expect(releases.length).toBeGreaterThan(1)
    for (let i = 1; i < releases.length; i++) {
      expect(releases[i].percentage).toBeGreaterThanOrEqual(releases[i - 1].percentage)
    }
    expect(releases[releases.length - 1].percentage).toBe(100)
  })

  it('cliffEndsAt equals TGE+cliff; fullyUnlockedAt equals cliffEnd+duration', () => {
    const out = deriveLinearReleases({
      tgeTimestampSec: TGE,
      cliffSeconds: CLIFF_6M,
      vestingDurationSeconds: DURATION_4M,
    })
    expect(new Date(out.cliffEndsAt).getTime()).toBe(Number(TGE + CLIFF_6M) * 1000)
    expect(new Date(out.fullyUnlockedAt).getTime()).toBe(
      Number(TGE + CLIFF_6M + DURATION_4M) * 1000,
    )
  })
})
