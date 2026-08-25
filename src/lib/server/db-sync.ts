// Server-side persistence layer for verified on-chain facts.
//
// Invariants (post-remediation):
//   - Purchase / Claim rows are append-only historical facts; they are only
//     ever written AFTER full on-chain verification succeeded.
//   - Idempotency: composite @@unique([txSignature, instructionIndex]) plus
//     upserts with empty `update` bodies.
//   - Concurrency: every derived-state recomputation runs inside a
//     wallet-scoped PostgreSQL advisory lock (pg_advisory_xact_lock) so 20+
//     concurrent syncs for one wallet converge to a consistent aggregate
//     position without inflating withdrawnAmount. -> GAP-9
//   - Derived state: withdrawnAmount is ALWAYS a deterministic SUM over
//     confirmed Claim rows (never an accumulator), and unlockedAmount follows
//     the CANONICAL linear contract curve (cliff + duration). -> FASE 13
//   - One aggregate VestingPosition per wallet (purchaseId NULL).

import { Prisma, SyncStatus } from '@prisma/client'
import { db } from '@/lib/db'
import {
  verifyPurchaseTransaction,
  verifyClaimTransaction,
  normalizeWalletAddress,
  baseUnitsToDecimal,
} from './solana-verify'
import { computeLinearVesting } from '@/lib/vesting/schedule'

const GAIA_BASE_UNITS = new Prisma.Decimal(10).pow(6)

export interface SyncPurchaseOptions {
  txSignature: string
  walletHint?: string
  instructionIndex?: number
  ipAddress?: string
}

export interface SyncClaimOptions {
  txSignature: string
  walletHint?: string
  instructionIndex?: number
  ipAddress?: string
}

/** Diagnostic audit trail — never throws to the caller. */
async function logSyncAttempt(
  txSignature: string,
  walletAddress: string | null,
  operation: 'PURCHASE_SYNC' | 'CLAIM_SYNC',
  status: SyncStatus,
  reason: string | null = null,
  ipAddress: string | null = null,
): Promise<void> {
  try {
    await db.syncAttempt.create({
      data: { txSignature, walletAddress, operation, status, reason, ipAddress },
    })
  } catch (err) {
    console.error('[db-sync] logSyncAttempt error:', err)
  }
}

function decimalToBaseUnits(value: Prisma.Decimal): bigint {
  return BigInt(value.mul(GAIA_BASE_UNITS).toFixed(0, Prisma.Decimal.ROUND_FLOOR))
}

function sumDecimal(values: Prisma.Decimal[]): Prisma.Decimal {
  return values.reduce((acc, v) => acc.add(v), new Prisma.Decimal(0))
}

/**
 * Recomputes the aggregate vesting position of a wallet using the canonical
 * linear curve. MUST be called inside an advisory-locked transaction.
 *
 * Identities follow the product manual (§9.2.2):
 *   unlocked (vested) INCLUDES anything already claimed
 *   claimable = max(unlocked - withdrawn, 0)
 *   locked    = total - unlocked          (>= 0)
 */
function computeAggregateState(
  totalGaia: Prisma.Decimal,
  withdrawnGaia: Prisma.Decimal,
  vestingParams: { tgeTimestampSec: bigint; cliffSeconds: bigint; vestingDurationSeconds: bigint },
): { unlockedGaia: Prisma.Decimal; claimableGaia: Prisma.Decimal; lockedGaia: Prisma.Decimal } {
  const totalBase = decimalToBaseUnits(totalGaia)
  const withdrawnBase = decimalToBaseUnits(withdrawnGaia)
  const breakdown = computeLinearVesting({
    totalBaseUnits: totalBase,
    claimedBaseUnits: withdrawnBase,
    tgeTimestampSec: vestingParams.tgeTimestampSec,
    cliffSeconds: vestingParams.cliffSeconds,
    vestingDurationSeconds: vestingParams.vestingDurationSeconds,
  })

  const unlockedGaia = baseUnitsToDecimal(breakdown.vestedBaseUnits, 6)
  const claimableGaia = baseUnitsToDecimal(breakdown.claimableBaseUnits, 6)
  const lockedBase = totalBase > breakdown.vestedBaseUnits ? totalBase - breakdown.vestedBaseUnits : 0n
  const lockedGaia = baseUnitsToDecimal(lockedBase, 6)
  return { unlockedGaia, claimableGaia, lockedGaia }
}

/**
 * Upserts THE single aggregate VestingPosition for a wallet.
 * MUST be called inside an advisory-locked transaction.
 */
async function upsertAggregatePosition(
  tx: Prisma.TransactionClient,
  walletId: string,
  data: {
    totalAmount: Prisma.Decimal
    unlockedAmount: Prisma.Decimal
    withdrawnAmount: Prisma.Decimal
    claimableAmount: Prisma.Decimal
    lockedAmount: Prisma.Decimal
  },
): Promise<void> {
  const existing = await tx.vestingPosition.findFirst({
    where: { walletId, purchaseId: null },
    select: { id: true },
  })

  if (existing) {
    await tx.vestingPosition.update({
      where: { id: existing.id },
      data: { ...data, source: 'ANCHOR' },
    })
  } else {
    await tx.vestingPosition.create({
      data: { walletId, purchaseId: null, ...data, source: 'ANCHOR' },
    })
  }
}

/**
 * Idempotent Purchase Sync with Pre-RPC cache guard.
 *
 * Order: input normalization -> DB cache lookup (with walletHint enforcement)
 * -> on-chain verification -> advisory-locked persistence.
 */
export async function syncPurchaseTx(options: SyncPurchaseOptions) {
  const { txSignature, walletHint, instructionIndex = 0, ipAddress } = options
  const normalizedHint = walletHint ? normalizeWalletAddress(walletHint) : null

  // 1. Pre-RPC cache guard
  const existingPurchase = await db.purchase.findUnique({
    where: {
      txSignature_instructionIndex: { txSignature, instructionIndex },
    },
    include: { wallet: true },
  })

  if (existingPurchase) {
    // walletHint is STILL enforced on cache hits.
    if (normalizedHint && existingPurchase.wallet.address !== normalizedHint) {
      await logSyncAttempt(txSignature, normalizedHint, 'PURCHASE_SYNC', SyncStatus.REJECTED, 'WALLET_MISMATCH', ipAddress)
      return { success: false, reason: 'WALLET_MISMATCH', isStale: false }
    }
    await logSyncAttempt(txSignature, existingPurchase.wallet.address, 'PURCHASE_SYNC', SyncStatus.SUCCESS, 'CACHE_HIT', ipAddress)
    return { success: true, purchase: existingPurchase, isStale: false }
  }

  // 2. Full on-chain verification (mints, signer, inner transfer, deltas, PDA facts)
  const verification = await verifyPurchaseTransaction(txSignature, walletHint, instructionIndex)

  if (!verification.success || !verification.verifiedData) {
    const reason = verification.reason ?? 'VERIFICATION_FAILED'
    await logSyncAttempt(txSignature, normalizedHint, 'PURCHASE_SYNC', SyncStatus.REJECTED, reason, ipAddress)
    return { success: false, reason, isStale: false }
  }

  const data = verification.verifiedData

  // 3. Advisory-locked persistence
  try {
    const result = await db.$transaction(async (tx) => {
      // Serialize derived-state recomputation per wallet (GAP-9).
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${data.verifiedBuyer}))`

      const wallet = await tx.wallet.upsert({
        where: { address: data.verifiedBuyer },
        create: { address: data.verifiedBuyer, lastSeenAt: new Date() },
        update: { lastSeenAt: new Date(), lastVerifiedAt: new Date() },
      })

      const purchase = await tx.purchase.upsert({
        where: {
          txSignature_instructionIndex: {
            txSignature: data.txSignature,
            instructionIndex: data.instructionIndex,
          },
        },
        create: {
          walletId: wallet.id,
          txSignature: data.txSignature,
          instructionIndex: data.instructionIndex,
          roundId: data.roundId,
          purchaseNumber: data.purchaseNumber,
          amountUsdc: data.amountUsdc,
          amountGaia: data.amountGaia,
          currency: data.currency,
          status: 'CONFIRMED',
          blockTime: data.blockTime,
          slot: data.slot,
        },
        update: {},
      })

      // Deterministic SUMs over confirmed facts only.
      const purchases = await tx.purchase.findMany({
        where: { walletId: wallet.id, status: 'CONFIRMED' },
        select: { amountGaia: true },
      })
      const claims = await tx.claim.findMany({
        where: { walletId: wallet.id, status: 'CONFIRMED' },
        select: { amountGaia: true },
      })

      const totalGaia = sumDecimal(purchases.map((p) => p.amountGaia))
      const withdrawnGaia = sumDecimal(claims.map((c) => c.amountGaia))
      const agg = computeAggregateState(totalGaia, withdrawnGaia, data.vestingParams)

      await upsertAggregatePosition(tx, wallet.id, {
        totalAmount: totalGaia,
        unlockedAmount: agg.unlockedGaia,
        withdrawnAmount: withdrawnGaia,
        claimableAmount: agg.claimableGaia,
        lockedAmount: agg.lockedGaia,
      })

      return purchase
    })

    await logSyncAttempt(txSignature, data.verifiedBuyer, 'PURCHASE_SYNC', SyncStatus.SUCCESS, null, ipAddress)
    return { success: true, purchase: result, isStale: false }
  } catch (err) {
    console.error('[db-sync] syncPurchaseTx DB transaction error:', err)
    await logSyncAttempt(txSignature, data.verifiedBuyer, 'PURCHASE_SYNC', SyncStatus.ERROR, 'DB_WRITE_ERROR', ipAddress)
    return { success: false, reason: 'DATABASE_ERROR', isStale: false }
  }
}

/**
 * Idempotent Claim Sync with Pre-RPC cache guard and deterministic SUM update.
 */
export async function syncClaimTx(options: SyncClaimOptions) {
  const { txSignature, walletHint, instructionIndex = 0, ipAddress } = options
  const normalizedHint = walletHint ? normalizeWalletAddress(walletHint) : null

  // 1. Pre-RPC cache guard
  const existingClaim = await db.claim.findUnique({
    where: {
      txSignature_instructionIndex: { txSignature, instructionIndex },
    },
    include: { wallet: true },
  })

  if (existingClaim) {
    if (normalizedHint && existingClaim.wallet.address !== normalizedHint) {
      await logSyncAttempt(txSignature, normalizedHint, 'CLAIM_SYNC', SyncStatus.REJECTED, 'WALLET_MISMATCH', ipAddress)
      return { success: false, reason: 'WALLET_MISMATCH', isStale: false }
    }
    await logSyncAttempt(txSignature, existingClaim.wallet.address, 'CLAIM_SYNC', SyncStatus.SUCCESS, 'CACHE_HIT', ipAddress)
    return { success: true, claim: existingClaim, isStale: false }
  }

  // 2. Full on-chain verification (vault transfer mandatory, zero rejected)
  const verification = await verifyClaimTransaction(txSignature, walletHint, instructionIndex)

  if (!verification.success || !verification.verifiedData) {
    const reason = verification.reason ?? 'VERIFICATION_FAILED'
    await logSyncAttempt(txSignature, normalizedHint, 'CLAIM_SYNC', SyncStatus.REJECTED, reason, ipAddress)
    return { success: false, reason, isStale: false }
  }

  const data = verification.verifiedData

  // 3. Advisory-locked persistence
  try {
    const result = await db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${data.verifiedBuyer}))`

      const wallet = await tx.wallet.upsert({
        where: { address: data.verifiedBuyer },
        create: { address: data.verifiedBuyer, lastSeenAt: new Date() },
        update: { lastSeenAt: new Date(), lastVerifiedAt: new Date() },
      })

      const claim = await tx.claim.upsert({
        where: {
          txSignature_instructionIndex: {
            txSignature: data.txSignature,
            instructionIndex: data.instructionIndex,
          },
        },
        create: {
          walletId: wallet.id,
          txSignature: data.txSignature,
          instructionIndex: data.instructionIndex,
          amountGaia: data.amountGaia,
          purchaseNumber: data.purchaseNumber,
          status: 'CONFIRMED',
          blockTime: data.blockTime,
          slot: data.slot,
        },
        update: {},
      })

      const purchases = await tx.purchase.findMany({
        where: { walletId: wallet.id, status: 'CONFIRMED' },
        select: { amountGaia: true },
      })
      const claims = await tx.claim.findMany({
        where: { walletId: wallet.id, status: 'CONFIRMED' },
        select: { amountGaia: true },
      })

      const totalGaia = sumDecimal(purchases.map((p) => p.amountGaia))
      const withdrawnGaia = sumDecimal(claims.map((c) => c.amountGaia))

      // Canonical curve params come from THIS claim's verified round/config.
      const agg = computeAggregateState(totalGaia, withdrawnGaia, data.vestingParams)

      await upsertAggregatePosition(tx, wallet.id, {
        totalAmount: totalGaia,
        unlockedAmount: agg.unlockedGaia,
        withdrawnAmount: withdrawnGaia,
        claimableAmount: agg.claimableGaia,
        lockedAmount: agg.lockedGaia,
      })

      return claim
    })

    await logSyncAttempt(txSignature, data.verifiedBuyer, 'CLAIM_SYNC', SyncStatus.SUCCESS, null, ipAddress)
    return { success: true, claim: result, isStale: false }
  } catch (err) {
    console.error('[db-sync] syncClaimTx DB transaction error:', err)
    await logSyncAttempt(txSignature, data.verifiedBuyer, 'CLAIM_SYNC', SyncStatus.ERROR, 'DB_WRITE_ERROR', ipAddress)
    return { success: false, reason: 'DATABASE_ERROR', isStale: false }
  }
}

/**
 * Wallet investment snapshot (canonical API payload).
 * Freshness is HONEST (GAP-8): isStale=true whenever records exist but were
 * not recently re-verified against chain. No RPC call is made per request.
 */
const FRESH_WINDOW_MS = 15 * 60 * 1000

/**
 * Resolves protocol-level vesting parameters for API consumers. Uses the
 * short-lived Config/Round caches inside program-state so this stays cheap
 * (no per-request RPC storm). Returns null when chain state is unavailable —
 * the payload simply omits protocol data instead of inventing values.
 */
async function resolveProtocolBlock(
  newestRoundId: number | null,
): Promise<{
  tgeTimestampSec: string
  cliffSeconds: string
  vestingDurationSeconds: string
  gaiaVault: string
} | null> {
  const { getVerifyConnection } = await import('./rpc')
  const { fetchProgramConfig, fetchRoundRecord } = await import('./program-state')
  try {
    const connection = getVerifyConnection()
    const config = await fetchProgramConfig(connection)
    if (!config) return null
    if (newestRoundId === null) return null
    const round = await fetchRoundRecord(connection, newestRoundId)
    if (!round) return null
    return {
      tgeTimestampSec: config.tgeTimestamp.toString(),
      cliffSeconds: round.cliffSeconds.toString(),
      vestingDurationSeconds: round.vestingDurationSeconds.toString(),
      gaiaVault: config.gaiaVault.toBase58(),
    }
  } catch {
    return null
  }
}

export async function getInvestmentData(walletAddress: string) {
  const normalized = normalizeWalletAddress(walletAddress)
  if (!normalized) {
    return { success: false, reason: 'INVALID_WALLET', isStale: false }
  }

  try {
    const wallet = await db.wallet.findUnique({
      where: { address: normalized },
      include: {
        purchases: { orderBy: { createdAt: 'desc' } },
        claims: { orderBy: { createdAt: 'desc' } },
        vestingPositions: { where: { purchaseId: null } },
      },
    })

    if (!wallet) {
      return {
        success: true,
        isStale: false,
        data: {
          wallet: normalized,
          summary: {
            totalPurchasedUsdc: '0',
            totalAcquiredGaia: '0',
            unlockedGaia: '0',
            withdrawnGaia: '0',
            claimableGaia: '0',
            lockedGaia: '0',
          },
          protocol: null,
          purchases: [],
          claims: [],
          vestingPositions: [],
        },
      }
    }

    const hasRecords = wallet.purchases.length > 0 || wallet.claims.length > 0
    const age = wallet.lastVerifiedAt ? Date.now() - wallet.lastVerifiedAt.getTime() : Number.POSITIVE_INFINITY
    const isStale = hasRecords && age > FRESH_WINDOW_MS

    const newestRoundId = wallet.purchases.length > 0 ? wallet.purchases[0].roundId : null

    const totalUsdc = sumDecimal(wallet.purchases.map((p) => p.amountUsdc))
    const totalGaia = sumDecimal(wallet.purchases.map((p) => p.amountGaia))
    const withdrawnGaia = sumDecimal(wallet.claims.map((c) => c.amountGaia))

    // Summary mirrors the aggregate position when present (single source).
    const aggregate = wallet.vestingPositions[0]
    const summary = aggregate
      ? {
          totalPurchasedUsdc: totalUsdc.toString(),
          totalAcquiredGaia: aggregate.totalAmount.toString(),
          unlockedGaia: aggregate.unlockedAmount.toString(),
          withdrawnGaia: aggregate.withdrawnAmount.toString(),
          claimableGaia: aggregate.claimableAmount.toString(),
          lockedGaia: aggregate.lockedAmount.toString(),
        }
      : {
          totalPurchasedUsdc: totalUsdc.toString(),
          totalAcquiredGaia: totalGaia.toString(),
          unlockedGaia: '0',
          withdrawnGaia: withdrawnGaia.toString(),
          claimableGaia: '0',
          lockedGaia: totalGaia.toString(),
        }

    return {
      success: true,
      isStale,
      data: {
        wallet: wallet.address,
        summary,
        protocol: await resolveProtocolBlock(newestRoundId),
        purchases: wallet.purchases.map((p) => ({
          id: p.id,
          txSignature: p.txSignature,
          instructionIndex: p.instructionIndex,
          roundId: p.roundId,
          purchaseNumber: p.purchaseNumber != null ? p.purchaseNumber.toString() : null,
          amountUsdc: p.amountUsdc.toString(),
          amountGaia: p.amountGaia.toString(),
          currency: p.currency,
          status: p.status,
          blockTime: p.blockTime != null ? p.blockTime.toString() : null,
          slot: p.slot != null ? p.slot.toString() : null,
          createdAt: p.createdAt.toISOString(),
        })),
        claims: wallet.claims.map((c) => ({
          id: c.id,
          txSignature: c.txSignature,
          instructionIndex: c.instructionIndex,
          amountGaia: c.amountGaia.toString(),
          purchaseNumber: c.purchaseNumber != null ? c.purchaseNumber.toString() : null,
          status: c.status,
          blockTime: c.blockTime != null ? c.blockTime.toString() : null,
          createdAt: c.createdAt.toISOString(),
        })),
        vestingPositions: wallet.vestingPositions.map((vp) => ({
          id: vp.id,
          purchaseId: vp.purchaseId,
          totalAmount: vp.totalAmount.toString(),
          unlockedAmount: vp.unlockedAmount.toString(),
          withdrawnAmount: vp.withdrawnAmount.toString(),
          claimableAmount: vp.claimableAmount.toString(),
          lockedAmount: vp.lockedAmount.toString(),
          source: vp.source,
        })),
      },
    }
  } catch (err) {
    console.error('[db-sync] getInvestmentData error:', err)
    return { success: false, reason: 'DATABASE_ERROR', isStale: true }
  }
}
