'use client'

// Dashboard data layer ("Mi inversión") — BACKEND-DRIVEN.
//
// POST-REMEDIATION CONTRACT:
//   - Purchases, claims, vesting totals and history come EXCLUSIVELY from the
//     canonical endpoint GET /api/investment/[wallet] (PostgreSQL facts that
//     were themselves verified on-chain before persistence).
//   - The frontend is a presentation layer: no financial data is read from or
//     written to localStorage/sessionStorage/indexedDB, and no direct Anchor
//     RPC is used for financial records while the canonical API exists.
//   - Freshness is honest: the payload's isStale flag is surfaced untouched.
//   - Auto-refresh every 30s + manual refresh + immediate refresh after claim.

import { useCallback, useEffect, useRef, useState } from 'react'
import { deriveLinearReleases } from '@/lib/vesting/schedule'
import type { VestingState } from '@/types/investment'

export const INVESTMENTS_REFRESH_MS = 30_000

export type InvestmentsStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface BackendPurchase {
  id: string
  txSignature: string
  instructionIndex: number
  roundId: number
  purchaseNumber: string | null
  amountUsdc: string
  amountGaia: string
  /** Per-purchase canonical vesting facts (decimal strings). */
  withdrawnGaia: string
  claimableGaia: string
  currency: 'USDC' | 'USDT'
  status: string
  blockTime: string | null
  slot: string | null
  createdAt: string
}

export interface BackendClaim {
  id: string
  txSignature: string
  instructionIndex: number
  amountGaia: string
  purchaseNumber: string | null
  status: string
  createdAt: string
}

export interface BackendProtocol {
  tgeTimestampSec: string
  cliffSeconds: string
  vestingDurationSeconds: string
  gaiaVault: string
}

interface InvestmentPayload {
  wallet: string
  summary: {
    totalPurchasedUsdc: string
    totalAcquiredGaia: string
    unlockedGaia: string
    withdrawnGaia: string
    claimableGaia: string
    lockedGaia: string
  }
  protocol: BackendProtocol | null
  purchases: BackendPurchase[]
  claims: BackendClaim[]
  vestingPositions: {
    id: string
    purchaseId: string | null
    totalAmount: string
    unlockedAmount: string
    withdrawnAmount: string
    claimableAmount: string
    lockedAmount: string
    source: string
  }[]
}

/** Display conversion only — persistence stays string-based end-to-end. */
function toNumber(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/**
 * Builds the aggregate vesting view model from backend strings using the
 * CANONICAL linear curve (same math as contract + server).
 */
export function buildAggregateState(
  payload: InvestmentPayload,
  nowMs: number = Date.now(),
): VestingState | null {
  const hasPosition = payload.vestingPositions.length > 0
  if (!hasPosition || !payload.protocol) return null

  const position = payload.vestingPositions[0]
  const curve = deriveLinearReleases({
    tgeTimestampSec: BigInt(payload.protocol.tgeTimestampSec),
    cliffSeconds: BigInt(payload.protocol.cliffSeconds),
    vestingDurationSeconds: BigInt(payload.protocol.vestingDurationSeconds),
    },
    { nowIso: new Date(nowMs).toISOString() },
  )

  const total = toNumber(position.totalAmount)
  const withdrawn = toNumber(position.withdrawnAmount)
  const claimable = toNumber(position.claimableAmount)

  const nowIso = new Date(nowMs).toISOString()
  const pending = curve.releases.filter((r) => r.releaseAt > nowIso)

  return {
    totalAmount: total,
    unlockedAmount: toNumber(position.unlockedAmount),
    withdrawnAmount: withdrawn,
    lockedAmount: toNumber(position.lockedAmount),
    claimableAmount: claimable,
    claimedAmount: withdrawn,
    releases: curve.releases,
    nextRelease: pending[0],
    fullyClaimed: total > 0 && claimable === 0 && withdrawn >= total,
  }
}

export function useInvestments(address: string | null) {
  const [status, setStatus] = useState<InvestmentsStatus>('idle')
  const [isStale, setIsStale] = useState(false)
  const [payload, setPayload] = useState<InvestmentPayload | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const requestIdRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!address) {
        setStatus('idle')
        setPayload(null)
        setIsStale(false)
        return
      }

      const requestId = ++requestIdRef.current
      if (mode === 'initial') setStatus('loading')
      setRefreshing(true)

      try {
        const res = await fetch(`/api/investment/${encodeURIComponent(address)}`)
        if (requestId !== requestIdRef.current || !mountedRef.current) return

        if (!res.ok) {
          setStatus('error')
          return
        }

        const json = (await res.json()) as {
          success?: boolean
          isStale?: boolean
          data?: InvestmentPayload
        }
        if (requestId !== requestIdRef.current || !mountedRef.current) return

        if (!json.success || !json.data) {
          setStatus('error')
          return
        }

        setPayload(json.data)
        setIsStale(Boolean(json.isStale))
        setStatus('ready')
      } catch {
        if (requestId === requestIdRef.current && mountedRef.current) {
          setStatus('error')
        }
      } finally {
        if (requestId === requestIdRef.current && mountedRef.current) {
          setRefreshing(false)
        }
      }
    },
    [address],
  )

  useEffect(() => {
    mountedRef.current = true
    void load('initial')
    return () => {
      mountedRef.current = false
    }
  }, [load])

  useEffect(() => {
    if (!address) return
    intervalRef.current = setInterval(() => {
      void load('refresh')
    }, INVESTMENTS_REFRESH_MS)
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [address, load])

  const refresh = useCallback(async () => {
    await load('refresh')
  }, [load])

  const aggregateState = payload ? buildAggregateState(payload) : null

  return {
    status,
    errorKind: null as null | 'load' | 'uninitialized',
    isStale,
    summary: payload?.summary ?? null,
    protocol: payload?.protocol ?? null,
    purchases: payload?.purchases ?? [],
    claims: payload?.claims ?? [],
    vestingPositions: payload?.vestingPositions ?? [],
    aggregateState,
    refresh,
    refreshing,
  }
}

export type UseInvestmentsResult = ReturnType<typeof useInvestments>
