// Vesting adapter layer.
//
// CURRENT rail : Purchase (Anchor PDAs) → on-chain cliff+linear vesting.
// FUTURE rail  : Streamflow-managed vaults via the same interface.
//
// UI components consume ONLY the types/functions exposed here
// (getVestingState / deriveVestingSchedule / aggregation helpers).
// Nothing below leaks Anchor/Raw shapes upward beyond already-mapped models.
//
// Rules honored here:
//   - No hardcoded dates/percentages/intervals: everything is derived from the
//     live Round (cliff_seconds / vesting_duration_seconds) and Config.tge.
//   - Amounts always come from on-chain math (computeVesting); percentages are
//     informational samples of that same curve.
//   - No Streamflow integration exists yet — nothing is invented. When a real
//     vault source appears, implement a second provider behind this module.

import { PublicKey } from '@solana/web3.js'
import type { Round } from '@/lib/anchor/config'
import { GAIA_DECIMALS } from '@/lib/anchor/config'
import { computeVesting, type VestingBreakdown } from '@/lib/anchor/vesting'
import type { Config } from '@/lib/anchor/config'
import type { VestingRelease, VestingSchedule, VestingState } from '@/types/investment'

const DECIMALS_FACTOR = 10 ** GAIA_DECIMALS
const MONTH_SECONDS = 30 * 24 * 60 * 60
/** Upper bound for rendered milestones to keep the timeline readable. */
const MAX_MILESTONES = 12

function isoFromSeconds(seconds: bigint | number): string {
  return new Date(Number(seconds) * 1000).toISOString()
}

/** Converts an on-chain base-unit amount (bigint) into UI units. */
export function fromBaseUnits(amount: bigint | number): number {
  return Number(amount) / DECIMALS_FACTOR
}

/**
 * Samples the REAL vesting curve (same formula the program uses) at evenly
 * spaced timestamps between cliff end and full unlock. Produces the release
 * calendar shown in the UI without inventing any schedule.
 */
export function deriveReleases(
  round: Pick<Round, 'cliff_seconds' | 'vesting_duration_seconds'>,
  config: Pick<Config, 'tge_timestamp'>,
  totalUi?: number,
): { cliffEndsAt: string; releases: VestingRelease[] } {
  const tge = Number(config.tge_timestamp)
  const cliff = Number(round.cliff_seconds)
  const duration = Number(round.vesting_duration_seconds)
  const cliffEnd = tge + cliff

  const pctAt = (tSeconds: number): number => {
    if (duration <= 0) return 100
    const frac = Math.min(Math.max((tSeconds - cliffEnd) / duration, 0), 1)
    // Floor keeps displayed unlocked % conservative vs the real contract math.
    return Math.floor(frac * 100)
  }

  const toRelease = (tSeconds: number, index: number, count: number): VestingRelease => {
    const percentage = index === count - 1 ? 100 : pctAt(tSeconds)
    const release: VestingRelease = {
      percentage,
      releaseAt: new Date(tSeconds * 1000).toISOString(),
    }
    if (totalUi !== undefined && totalUi > 0) {
      release.amount = (percentage / 100) * totalUi
    }
    return release
  }

  if (duration <= 0) {
    return { cliffEndsAt: isoFromSeconds(cliffEnd), releases: [toRelease(cliffEnd, 0, 1)] }
  }

  const stepSeconds = Math.max(Math.round(duration / MONTH_SECONDS), 1)
  const count = Math.min(stepSeconds + 1, MAX_MILESTONES)
  const releases: VestingRelease[] = []
  const seenTimestamps = new Set<string>()
  for (let k = 0; k < count; k++) {
    const t =
      k === count - 1 ? cliffEnd + duration : cliffEnd + Math.round((duration * k) / (count - 1))
    const iso = new Date(t * 1000).toISOString()
    // Rounding can collide for very short durations — drop duplicates so
    // consumers never receive two milestones with the same timestamp.
    if (seenTimestamps.has(iso)) continue
    seenTimestamps.add(iso)
    releases.push(toRelease(t, k, count))
  }
  return { cliffEndsAt: isoFromSeconds(cliffEnd), releases }
}

/** Builds the display schedule for a purchase's round. */
export function deriveVestingSchedule(
  round: Round,
  config: Pick<Config, 'tge_timestamp'>,
  totalUi?: number,
): VestingSchedule {
  const { cliffEndsAt, releases } = deriveReleases(round, config, totalUi)
  return {
    tgeAt: isoFromSeconds(config.tge_timestamp),
    cliffEndsAt,
    releases,
  }
}

/**
 * Normalizes on-chain vesting breakdown into the UI model using the manual's
 * formulas (§9.2.2 / correction #2):
 *   Claimable = unlocked − withdrawn
 *   Claimed   = withdrawn
 *   Locked    = total − unlocked
 * where `unlocked` is the vested amount INCLUDING anything already claimed.
 */
export function toVestingState(
  vesting: VestingBreakdown,
  schedule: VestingSchedule,
  nowMs: number = Date.now(),
): VestingState {
  const totalAmount = fromBaseUnits(vesting.total)
  const claimedAmount = fromBaseUnits(vesting.claimed)
  const claimableAmount = fromBaseUnits(vesting.claimable)
  const unlockedAmount = claimedAmount + claimableAmount
  const lockedAmount = Math.max(totalAmount - unlockedAmount, 0)

  const nowIso = new Date(nowMs).toISOString()
  const pendingReleases = schedule.releases.filter((r) => r.releaseAt > nowIso)

  return {
    totalAmount,
    unlockedAmount,
    withdrawnAmount: claimedAmount,
    lockedAmount,
    claimableAmount,
    claimedAmount,
    releases: schedule.releases,
    nextRelease: pendingReleases[0],
    fullyClaimed: totalAmount > 0 && claimableAmount === 0 && claimedAmount >= totalAmount,
  }
}

/** Aggregates several investments into one portfolio-level state. */
export function aggregateVestingState(states: VestingState[]): VestingState {
  const sum = (pick: (s: VestingState) => number) =>
    states.reduce((acc, s) => acc + pick(s), 0)

  const allReleases = states.flatMap((s) => s.releases)
  const nowIso = new Date().toISOString()
  const pending = [...allReleases]
    .filter((r) => r.releaseAt > nowIso)
    .sort((a, b) => a.releaseAt.localeCompare(b.releaseAt))

  const totalAmount = sum((s) => s.totalAmount)
  const claimedAmount = sum((s) => s.claimedAmount)
  const claimableAmount = sum((s) => s.claimableAmount)

  return {
    totalAmount,
    unlockedAmount: sum((s) => s.unlockedAmount),
    withdrawnAmount: claimedAmount,
    lockedAmount: sum((s) => s.lockedAmount),
    claimableAmount,
    claimedAmount,
    releases: allReleases.sort((a, b) => a.releaseAt.localeCompare(b.releaseAt)),
    nextRelease: pending[0],
    fullyClaimed: totalAmount > 0 && claimableAmount === 0 && claimedAmount >= totalAmount,
  }
}

export interface NormalizedInvestment {
  /** On-chain purchase record (already mapped by lib/anchor/mappers). */
  purchase: import('@/lib/anchor/config').Purchase
  round: Round
  vesting: VestingBreakdown
  state: VestingState
  schedule: VestingSchedule
  /** True when purchase.wallet matches the connected wallet (defense-in-depth). */
  ownedByConnectedWallet: boolean
}

export interface GetVestingStateArgs {
  wallet: string
  /** Pre-fetched protocol config (avoids duplicate RPC inside loops). */
  config: Config
  buyerProfile: import('@/lib/anchor/config').BuyerProfile | null
  purchases: import('@/lib/anchor/config').Purchase[]
  roundsById: Map<number, Round>
}

/**
 * Pure normalizer: turns freshly fetched on-chain records into investments.
 * Kept separate from fetching so tests can exercise it without RPC.
 */
export function normalizeInvestments(args: GetVestingStateArgs): NormalizedInvestment[] {
  const { wallet, config, purchases, roundsById } = args
  const ownerKey = new PublicKey(wallet)

  return purchases
    .map((purchase) => {
      const round = roundsById.get(purchase.round_id)
      if (!round) return null
      // Correction #2/#24: ownership is asserted against the connected wallet;
      // anything else is dropped, never trusted from client-side state.
      const ownedByConnectedWallet = purchase.wallet.equals(ownerKey)
      const vesting = computeVesting(purchase, round, config)
      const totalUi = fromBaseUnits(purchase.token_amount)
      const schedule = deriveVestingSchedule(round, config, totalUi)
      const state = toVestingState(vesting, schedule)
      return { purchase, round, vesting, state, schedule, ownedByConnectedWallet }
    })
    .filter((v): v is NormalizedInvestment => v !== null)
    .filter((inv) => inv.ownedByConnectedWallet)
}
