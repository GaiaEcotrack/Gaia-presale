// CANONICAL vesting math — single source of truth for backend and frontend.
//
// This is an exact mirror of the deployed Anchor program:
//   smart-contract/programs/gaia-presale/src/utils/vesting.rs
//   calculate_vested_amount()  —  cliff + LINEAR model:
//     1. before TGE+cliff        -> 0 vested
//     2. duration == 0           -> full unlock after cliff
//     3. otherwise               -> vested = total * elapsed / duration (floor)
//     4. vested capped at total; claimable = max(vested - claimed, 0)
//
// All arithmetic is integer BigInt math — identical semantics and precision
// to the on-chain u128 division. NEVER replace this with floating point.
// NOTE: the UX copy historically described "25% monthly steps (months 6-9)".
// That does NOT match the contract; this function (and every consumer)
// implements the REAL contract curve: linear over vesting_duration_seconds.

export interface LinearVestingInput {
  /** Total purchased GAIA in base units (6 decimals). */
  totalBaseUnits: bigint
  /** Already-withdrawn GAIA in base units. */
  claimedBaseUnits: bigint
  /** Config.tge_timestamp (unix seconds). */
  tgeTimestampSec: number | bigint
  /** Round.cliff_seconds. */
  cliffSeconds: number | bigint
  /** Round.vesting_duration_seconds. */
  vestingDurationSeconds: number | bigint
  /** Evaluation instant (unix seconds). Defaults to current time. */
  nowSeconds?: number
}

export interface LinearVestingBreakdown {
  vestedBaseUnits: bigint
  claimableBaseUnits: bigint
  pendingBaseUnits: bigint
}

function toBigint(value: number | bigint): bigint {
  return typeof value === 'bigint' ? value : BigInt(Math.trunc(value))
}

/** Exact port of calculate_vested_amount from the Rust program. */
export function computeLinearVesting(input: LinearVestingInput): LinearVestingBreakdown {
  const total = input.totalBaseUnits
  const claimed = input.claimedBaseUnits
  const tge = toBigint(input.tgeTimestampSec)
  const cliff = toBigint(input.cliffSeconds)
  const duration = toBigint(input.vestingDurationSeconds)
  const now =
    input.nowSeconds === undefined
      ? BigInt(Math.floor(Date.now() / 1000))
      : BigInt(input.nowSeconds)

  const saturatingSub = (a: bigint, b: bigint): bigint => (a > b ? a - b : 0n)

  const cliffEnd = tge + cliff

  // Before cliff: nothing is vested.
  if (now < cliffEnd) {
    return {
      vestedBaseUnits: 0n,
      claimableBaseUnits: 0n,
      pendingBaseUnits: saturatingSub(total, claimed),
    }
  }

  // Zero-duration rounds fully unlock right after the cliff.
  let vested: bigint
  if (duration <= 0n) {
    vested = total
  } else {
    const elapsed = now - cliffEnd
    vested = (total * elapsed) / duration
    if (vested > total) vested = total
  }

  const claimable = vested > claimed ? vested - claimed : 0n
  return {
    vestedBaseUnits: vested,
    claimableBaseUnits: claimable,
    pendingBaseUnits: saturatingSub(saturatingSub(total, claimed), claimable),
  }
}

export interface VestingCurveParams {
  tgeTimestampSec: number | bigint
  cliffSeconds: number | bigint
  vestingDurationSeconds: number | bigint
}

/**
 * Samples the REAL linear curve into discrete informational milestones for
 * timeline rendering. Percentages are floors of the actual curve (conservative
 * display); the final milestone is always 100% exactly at full unlock.
 */
export function deriveLinearReleases(
  params: VestingCurveParams,
  options: { sampleCount?: number; nowIso?: string } = {},
): { cliffEndsAt: string; fullyUnlockedAt: string; releases: { percentage: number; releaseAt: string }[] } {
  const tge = Number(toBigint(params.tgeTimestampSec))
  const cliff = Number(toBigint(params.cliffSeconds))
  const duration = Number(toBigint(params.vestingDurationSeconds))
  const cliffEnd = tge + cliff
  const fullUnlock = cliffEnd + Math.max(duration, 0)

  const iso = (sec: number): string => new Date(sec * 1000).toISOString()

  if (duration <= 0) {
    return {
      cliffEndsAt: iso(cliffEnd),
      fullyUnlockedAt: iso(cliffEnd),
      releases: [{ percentage: 100, releaseAt: iso(cliffEnd) }],
    }
  }

  const count = Math.min(Math.max(options.sampleCount ?? 5, 2), 12)
  const releases: { percentage: number; releaseAt: string }[] = []
  for (let k = 1; k <= count; k++) {
    const t = k === count ? fullUnlock : Math.floor(cliffEnd + (duration * k) / count)
    const pct = k === count ? 100 : Math.min(100, Math.max(0, Math.floor(((t - cliffEnd) / duration) * 100)))
    releases.push({ percentage: pct, releaseAt: iso(t) })
  }
  return { cliffEndsAt: iso(cliffEnd), fullyUnlockedAt: iso(fullUnlock), releases }
}
