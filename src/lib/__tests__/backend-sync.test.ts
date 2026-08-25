import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest'
import { Keypair } from '@solana/web3.js'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'

/**
 * PostgreSQL integration suite: immutability triggers, idempotency,
 * deterministic SUM and TRUE concurrency (GAP-9 / cases 25-31).
 *
 * The Solana verification boundary is mocked here ON PURPOSE: these tests
 * scope DATABASE behaviour. Full-stack verification (real verifier against
 * deterministic chain fixtures) lives in e2e-acceptance.test.ts.
 */
vi.mock('@/lib/server/solana-verify', async () => {
  const { Prisma: P } = await import('@prisma/client')
  return {
    verifyPurchaseTransaction: vi.fn(),
    verifyClaimTransaction: vi.fn(),
    normalizeWalletAddress: (a: string) => a,
    baseUnitsToDecimal: (b: bigint | number | string, d: number) =>
      new P.Decimal(BigInt(b).toString()).div(new P.Decimal(10).pow(d)),
  }
})

import {
  verifyPurchaseTransaction,
  verifyClaimTransaction,
} from '@/lib/server/solana-verify'
import { syncPurchaseTx, syncClaimTx, getInvestmentData } from '@/lib/server/db-sync'

const mockVerify = vi.mocked(verifyPurchaseTransaction)
const mockVerifyClaim = vi.mocked(verifyClaimTransaction)

// Each test gets an ISOLATED on-curve wallet derived from the unique run
// nonce so suites never share totals (and reruns never collide).
function walletFromNonce(nonce: string): string {
  const seed = new Uint8Array(32)
  Buffer.from(nonce).forEach((b, i) => {
    seed[i % 32] = (seed[i % 32] + b) % 256
  })
  return Keypair.fromSeed(seed).publicKey.toBase58()
}

let runNonce: string
let wallet: string

beforeAll(async () => {
  // LOUD failure when PostgreSQL is unavailable (never silent-pass).
  try {
    await db.$queryRaw`SELECT 1`
  } catch (err) {
    throw new Error(
      '[backend-sync] PostgreSQL is REQUIRED for this suite but is unreachable. ' +
        'Set a working DATABASE_URL. Raw error: ' +
        String(err),
    )
  }
})

beforeEach(() => {
  runNonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
  wallet = walletFromNonce(runNonce)
  mockVerify.mockReset()
  mockVerifyClaim.mockReset()
})

const FUTURE_VESTING = {
  tgeTimestampSec: BigInt(Math.floor(Date.now() / 1000) + 86_400 * 3650),
  cliffSeconds: BigInt(15_552_000),
  vestingDurationSeconds: BigInt(10_368_000),
}

function successPurchase(signature: string, amountGaiaHuman: string, purchaseNumber: bigint = 0n) {
  const gaia = new Prisma.Decimal(amountGaiaHuman)
  return {
    success: true as const,
    verifiedData: {
      txSignature: signature,
      instructionIndex: 0,
      verifiedBuyer: wallet,
      roundId: 0,
      amountUsdc: gaia.div(125),
      amountGaia: gaia,
      currency: 'USDC' as const,
      purchaseNumber,
      blockTime: BigInt(1_700_000_000),
      slot: 1n,
      vestingParams: FUTURE_VESTING,
    },
  }
}

function successClaim(signature: string, amountGaiaHuman: string, purchaseNumber: bigint = 0n) {
  return {
    success: true as const,
    verifiedData: {
      txSignature: signature,
      instructionIndex: 0,
      verifiedBuyer: wallet,
      amountGaia: new Prisma.Decimal(amountGaiaHuman),
      purchaseNumber,
      blockTime: null as bigint | null,
      slot: 2n,
      vestingParams: FUTURE_VESTING,
    },
  }
}

describe('historical immutability triggers (cases 30/31)', () => {
  it('UPDATE on Purchase is rejected by trigger', async () => {
    const sig = `${runNonce}upd${'a'.repeat(40)}`
    mockVerify.mockResolvedValue(successPurchase(sig, '125'))
    const r = await syncPurchaseTx({ txSignature: sig })
    expect(r.success).toBe(true)

    await expect(
      db.$executeRawUnsafe(
        `UPDATE "Purchase" SET "amountGaia" = 999 WHERE "txSignature" = '${sig}'`,
      ),
    ).rejects.toThrow(/immutable historical facts/)
  })

  it('DELETE on Claim is rejected by trigger', async () => {
    const buySig = `${runNonce}delb${'b'.repeat(40)}`
    const claimSig = `${runNonce}delc${'c'.repeat(40)}`
    mockVerify.mockResolvedValue(successPurchase(buySig, '250'))
    await syncPurchaseTx({ txSignature: buySig })
    mockVerifyClaim.mockResolvedValue(successClaim(claimSig, '10'))
    await syncClaimTx({ txSignature: claimSig })

    await expect(
      db.$executeRawUnsafe(`DELETE FROM "Claim" WHERE "txSignature" = '${claimSig}'`),
    ).rejects.toThrow(/immutable historical facts/)
  })

  it('composite uniqueness rejects duplicate (txSignature, instructionIndex)', async () => {
    const buySig = `${runNonce}uniq${'d'.repeat(40)}`
    mockVerify.mockResolvedValue(successPurchase(buySig, '10'))
    await syncPurchaseTx({ txSignature: buySig })

    // Direct insert of the SAME composite key must violate the constraint.
    const w = await db.wallet.findUniqueOrThrow({ where: { address: wallet } })
    await expect(
      db.purchase.create({
        data: {
          walletId: w.id,
          txSignature: buySig,
          instructionIndex: 0,
          roundId: 0,
          amountUsdc: new Prisma.Decimal('1'),
          amountGaia: new Prisma.Decimal('1'),
        },
      }),
    ).rejects.toThrow()
  })
})

describe('idempotency + deterministic SUM (cases 25/26/29)', () => {
  it('duplicate purchase sync creates exactly ONE record (cache hit)', async () => {
    const sig = `${runNonce}idem${'e'.repeat(40)}`
    mockVerify.mockResolvedValue(successPurchase(sig, '100'))

    expect((await syncPurchaseTx({ txSignature: sig })).success).toBe(true)
    expect((await syncPurchaseTx({ txSignature: sig })).success).toBe(true)

    expect(await db.purchase.count({ where: { txSignature: sig } })).toBe(1)

    const hits = await db.syncAttempt.count({
      where: { txSignature: sig, reason: 'CACHE_HIT' },
    })
    expect(hits).toBeGreaterThanOrEqual(1)
  })

  it('cache hit STILL enforces walletHint mismatch (case 26)', async () => {
    const sig = `${runNonce}hint${'f'.repeat(40)}`
    mockVerify.mockResolvedValue(successPurchase(sig, '100'))
    await syncPurchaseTx({ txSignature: sig })

    const res = await syncPurchaseTx({
      txSignature: sig,
      walletHint: walletFromNonce(runNonce + 'other'), // different on-curve wallet
    })
    expect(res).toMatchObject({ success: false, reason: 'WALLET_MISMATCH' })

    expect(
      await db.syncAttempt.count({
        where: { txSignature: sig, reason: 'WALLET_MISMATCH' },
      }),
    ).toBeGreaterThanOrEqual(1)
  })

  it('re-syncing claims never inflates withdrawnAmount (deterministic SUM)', async () => {
    const buySig = `${runNonce}detb${'g'.repeat(40)}`
    const c1 = `${runNonce}det1${'h'.repeat(40)}`
    const c2 = `${runNonce}det2${'i'.repeat(40)}`

    mockVerify.mockResolvedValue(successPurchase(buySig, '500'))
    await syncPurchaseTx({ txSignature: buySig })

    mockVerifyClaim.mockResolvedValue(successClaim(c1, '40'))
    await syncClaimTx({ txSignature: c1 })
    mockVerifyClaim.mockResolvedValue(successClaim(c2, '60'))
    await syncClaimTx({ txSignature: c2 })

    // Re-sync claim1 twice more — withdrawn MUST stay exactly 100.
    await syncClaimTx({ txSignature: c1 })
    await syncClaimTx({ txSignature: c1 })

    const inv = await getInvestmentData(wallet)
    expect(inv.success).toBe(true)
    expect(inv.data?.summary.withdrawnGaia).toBe('100')
    expect(inv.data?.summary.totalAcquiredGaia).toBe('500')

    const position = inv.data?.vestingPositions[0]
    expect(Number(position?.totalAmount)).toBe(500)
    expect(Number(position?.withdrawnAmount)).toBe(100)
    // Far-future TGE -> everything locked, nothing claimable
    expect(Number(position?.unlockedAmount)).toBe(0)
    expect(Number(position?.lockedAmount)).toBe(500)
    expect(Number(position?.claimableAmount)).toBe(0)
  })
})

describe('per-purchase claimable derivation', () => {
  it('exposes exact withdrawn/claimable per purchase and consistent aggregate', async () => {
    // Purchase A (#10): 100 GAIA · Purchase B (#20): 400 GAIA — same round.
    const buyA = `${runNonce}paA${'m'.repeat(40)}`
    const buyB = `${runNonce}pbB${'n'.repeat(40)}`
    mockVerify.mockResolvedValue(successPurchase(buyA, '100', 10n))
    await syncPurchaseTx({ txSignature: buyA })
    mockVerify.mockResolvedValue(successPurchase(buyB, '400', 20n))
    await syncPurchaseTx({ txSignature: buyB })

    // Claim 30 against purchase #10 only.
    const cA = `${runNonce}pcA${'o'.repeat(40)}`
    mockVerifyClaim.mockResolvedValue(successClaim(cA, '30', 10n))
    await syncClaimTx({ txSignature: cA })

    const inv = await getInvestmentData(wallet)
    expect(inv.success).toBe(true)
    const byNumber = new Map(inv.data?.purchases.map((p) => [p.purchaseNumber, p]))
    const a = byNumber.get('10')
    const b = byNumber.get('20')
    expect(a?.withdrawnGaia).toBe('30')
    expect(a?.claimableGaia).toBe('70')
    expect(b?.withdrawnGaia).toBe('0')
    expect(b?.claimableGaia).toBe('400')

    // Aggregate stays consistent with per-purchase sums.
    expect(Number(inv.data?.summary.withdrawnGaia)).toBe(30)
    expect(Number(inv.data?.summary.totalAcquiredGaia)).toBe(500)
  })
})

describe('TRUE concurrency (cases 27/28 — GAP-9)', () => {
  it('20 concurrent purchase syncs -> exactly one row each, consistent aggregate', async () => {
    const N = 20
    const sigs = Array.from({ length: N }, (_, i) =>
      `${runNonce}p${String(i).padStart(2, '0')}${'j'.repeat(40)}`,
    )
    sigs.forEach((sig, i) =>
      mockVerify.mockResolvedValueOnce(successPurchase(sig, String(i + 1))),
    )

    const results = await Promise.all(
      sigs.map((sig) => syncPurchaseTx({ txSignature: sig })),
    )
    expect(results.every((r) => r.success)).toBe(true)

    for (const sig of sigs) {
      expect(await db.purchase.count({ where: { txSignature: sig } })).toBe(1)
    }

    // Exactly ONE aggregate position for the wallet; total >= 210 (this batch).
    const inv = await getInvestmentData(wallet)
    const aggregates = inv.data?.vestingPositions.filter((v) => v.purchaseId === null) ?? []
    expect(aggregates).toHaveLength(1)
    expect(Number(aggregates[0].totalAmount)).toBe(210)
  }, 60_000)

  it('20 concurrent claim syncs keep withdrawn EXACT and derived state consistent', async () => {
    const N = 20
    const buySig = `${runNonce}cbatch${'k'.repeat(38)}`
    mockVerify.mockResolvedValue(successPurchase(buySig, '1000'))
    await syncPurchaseTx({ txSignature: buySig })

    const sigs = Array.from({ length: N }, (_, i) =>
      `${runNonce}c${String(i).padStart(2, '0')}${'l'.repeat(40)}`,
    )
    sigs.forEach((sig) => mockVerifyClaim.mockResolvedValueOnce(successClaim(sig, '5')))

    const results = await Promise.all(
      sigs.map((sig) => syncClaimTx({ txSignature: sig })),
    )
    expect(results.every((r) => r.success)).toBe(true)

    const position = (await getInvestmentData(wallet)).data?.vestingPositions[0]
    expect(Number(position?.withdrawnAmount)).toBe(N * 5)
    expect(Number(position?.totalAmount)).toBe(1000)
    expect(Number(position?.claimableAmount)).toBe(0)
    expect(Number(position?.lockedAmount)).toBe(1000)

    // No duplicate claim rows under race
    for (const sig of sigs) {
      expect(await db.claim.count({ where: { txSignature: sig } })).toBe(1)
    }
  }, 60_000)
})
