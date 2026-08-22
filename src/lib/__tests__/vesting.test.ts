import { describe, it, expect } from 'vitest'
import { PublicKey } from '@solana/web3.js'
import { computeVesting } from '@/lib/anchor/vesting'
import type { Config, Purchase, Round } from '@/lib/anchor/config'
import {
  deriveVestingSchedule,
  normalizeInvestments,
  toVestingState,
} from '@/lib/vesting/adapter'

/* ------------------------------------------------------------------ */
/* Fixtures                                                            */
/* ------------------------------------------------------------------ */

const SYSTEM_KEY = new PublicKey('11111111111111111111111111111111')
const OWNER = new PublicKey('So11111111111111111111111111111111111111112')
const OTHER = new PublicKey('4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T')

const TGE = 1_000
const CLIFF_6M = 15_552_000 // 6 months of 30d
const DURATION_3M = 7_776_000 // 3 months of 30d

function makeConfig(): Config {
  return {
    admin: SYSTEM_KEY,
    treasury: SYSTEM_KEY,
    gaia_mint: SYSTEM_KEY,
    usdc_mint: SYSTEM_KEY,
    usdt_mint: SYSTEM_KEY,
    tge_timestamp: BigInt(TGE),
    current_round: 0,
    total_tokens_sold: 0n,
    total_usdc_raised: 0n,
    total_usdt_raised: 0n,
    paused: false,
    gaia_vault: SYSTEM_KEY,
    legal_authority: SYSTEM_KEY,
    legal_cleared: true,
    compliance_authority: SYSTEM_KEY,
    bump: 255,
    gaia_vault_bump: 254,
  }
}

function makeRound(cliff: number, duration: number): Round {
  return {
    id: 0,
    name: 'Test Round',
    price_micro_usd: 10_000n,
    tokens_available: 1_000_000_000n,
    tokens_sold: 0n,
    start_time: 0n,
    end_time: 9_999_999_999n,
    cliff_seconds: BigInt(cliff),
    vesting_duration_seconds: BigInt(duration),
    minimum_purchase: 0n,
    maximum_purchase: 0n,
    maximum_per_wallet: 0n,
    whitelist_enabled: false,
    round_type: 'Public',
    status: 'Active',
    bump: 253,
  }
}

function makePurchase(tokenAmount: bigint, claimed: bigint): Purchase {
  return {
    wallet: OWNER,
    round_id: 0,
    purchase_number: 0n,
    payment_amount: 250_000_000n,
    payment_mint: SYSTEM_KEY,
    token_amount: tokenAmount,
    claimed_amount: claimed,
    price_micro_usd: 10_000n,
    timestamp: BigInt(TGE),
    bump: 252,
  }
}

const TOTAL = 8_000_000n // 8 GAIA (6 decimals)
const config = makeConfig()
const round = makeRound(CLIFF_6M, DURATION_3M)
const CLIFF_END = TGE + CLIFF_6M

describe('computeVesting (on-chain math)', () => {
  it('cliff not passed → claimable 0, everything pending', () => {
    const v = computeVesting(makePurchase(TOTAL, 0n), round, config, TGE + 100)
    expect(v.claimable).toBe(0n)
    expect(v.pending).toBe(TOTAL)
    expect(v.cliffPassed).toBe(false)
  })

  it('duration=0 → full unlock immediately after cliff', () => {
    const instantRound = makeRound(CLIFF_6M, 0)
    const v = computeVesting(
      makePurchase(TOTAL, 0n),
      instantRound,
      config,
      CLIFF_END + 1,
    )
    expect(v.claimable).toBe(TOTAL)
    expect(v.fullyUnlocked).toBe(true)
  })

  // Linear curve over [cliffEnd, cliffEnd+duration]
  it.each([
    [0.25, 2_000_000n],
    [0.5, 4_000_000n],
    [0.75, 6_000_000n],
    [1.0, 8_000_000n],
  ])('%p% of the vesting window unlocks %p base units', (fraction, expected) => {
    const now =
      fraction === 1 ? CLIFF_END + DURATION_3M : Math.floor(CLIFF_END + DURATION_3M * fraction)
    const v = computeVesting(makePurchase(TOTAL, 0n), round, config, now)
    // With claimed=0: vested == claimable.
    expect(v.claimable).toBe(expected)
    expect(v.pending).toBe(TOTAL - expected)
  })

  it('over-claimed purchases never report negative claimable', () => {
    const now = Math.floor(CLIFF_END + DURATION_3M * 0.25) // vested = 25%
    const v = computeVesting(makePurchase(TOTAL, 3_000_000n), round, config, now)
    expect(v.claimed).toBe(3_000_000n)
    expect(v.claimable).toBe(0n)
    expect(v.pending).toBe(TOTAL - 3_000_000n)
  })
})

describe('toVestingState identities (manual §12 formulas)', () => {
  it('Claimable = unlocked − withdrawn; Locked = total − unlocked; Claimed = withdrawn', () => {
    const now = Math.floor(CLIFF_END + DURATION_3M * 0.5) // 50% unlocked
    const breakdown = computeVesting(makePurchase(TOTAL, 1_000_000n), round, config, now)
    const schedule = deriveVestingSchedule(round, config)
    const state = toVestingState(breakdown, schedule)

    expect(state.totalAmount).toBe(8)
    expect(state.withdrawnAmount).toBe(1)
    expect(state.unlockedAmount).toBe(state.withdrawnAmount + state.claimableAmount)
    expect(state.lockedAmount).toBeCloseTo(state.totalAmount - state.unlockedAmount, 9)
    expect(state.fullyClaimed).toBe(false)
  })

  it('fully claimed state is flagged', () => {
    const breakdown = computeVesting(makePurchase(TOTAL, TOTAL), round, config, CLIFF_END + DURATION_3M + 10)
    const schedule = deriveVestingSchedule(round, config)
    const state = toVestingState(breakdown, schedule)
    expect(state.claimableAmount).toBe(0)
    expect(state.fullyClaimed).toBe(true)
  })
})

describe('deriveVestingSchedule — derived from live round data only', () => {
  const schedule = deriveVestingSchedule(round, config, Number(TOTAL) / 1e6)

  it('lock ends exactly at tge+cliff', () => {
    expect(new Date(schedule.cliffEndsAt).getTime()).toBe(CLIFF_END * 1000)
  })

  it('milestones sample the real curve: ascending, capped at 100%', () => {
    expect(schedule.releases.length).toBeGreaterThan(1)
    const pcts = schedule.releases.map((r) => r.percentage)
    for (let i = 1; i < pcts.length; i++) {
      expect(pcts[i]).toBeGreaterThanOrEqual(pcts[i - 1])
    }
    expect(pcts[pcts.length - 1]).toBe(100)
  })

  it('final milestone date equals full-unlock time and carries absolute amount', () => {
    const last = schedule.releases[schedule.releases.length - 1]
    expect(new Date(last.releaseAt).getTime()).toBe((CLIFF_END + DURATION_3M) * 1000)
    expect(last.amount).toBeCloseTo(8, 9)
  })
})

describe('normalizeInvestments ownership enforcement (correction #24)', () => {
  it('drops purchases not owned by the connected wallet', () => {
    const foreign = { ...makePurchase(TOTAL, 0n), wallet: OTHER, purchase_number: 1n }
    const own = makePurchase(TOTAL, 0n)

    const investments = normalizeInvestments({
      wallet: OWNER.toBase58(),
      config,
      buyerProfile: null,
      purchases: [foreign, own],
      roundsById: new Map([[0, round]]),
    })

    expect(investments).toHaveLength(1)
    expect(investments[0].ownedByConnectedWallet).toBe(true)
    expect(investments[0].purchase.wallet.equals(OWNER)).toBe(true)
  })
})

describe('fresh on-chain state beats rendered amounts (correction #2)', () => {
  it('claimable recomputed from fresh claimed_amount differs from stale UI value', () => {
    const staleUiClaimable = 4_000_000n // what the button showed earlier
    const fresh = computeVesting(
      makePurchase(TOTAL, 5_000_000n), // meanwhile a claim happened on-chain
      round,
      config,
      CLIFF_END + DURATION_3M + 60,
    )
    expect(fresh.claimable).not.toBe(staleUiClaimable)
    expect(fresh.claimable).toBe(3_000_000n) // 8 − 5 already withdrawn
  })
})
