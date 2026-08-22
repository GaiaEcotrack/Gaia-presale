'use client'

// Dashboard data layer ("Mi inversión").
//
// - Reads ONLY real on-chain data via the anchor fetch utilities.
// - Normalizes everything through the vesting adapter (UI never touches raw
//   program shapes).
// - Auto-refresh every 30s (single interval, cleared on unmount / wallet
//   change) + manual refresh + immediate refresh after a claim.
// - Stale-response guard: only the latest request may commit state.

import { useCallback, useEffect, useRef, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { getReadProgram } from '@/lib/anchor/program'
import {
  fetchConfig,
  fetchBuyerProfile,
  fetchPurchasesForWallet,
  fetchRound,
} from '@/lib/anchor/fetch'
import type { Config, Round } from '@/lib/anchor/config'
import {
  aggregateVestingState,
  normalizeInvestments,
  type NormalizedInvestment,
} from '@/lib/vesting/adapter'
import type { VestingState } from '@/types/investment'

export const INVESTMENTS_REFRESH_MS = 30_000

// Rounds are effectively immutable once created — cache across refreshes so a
// 30s poll never re-fetches unchanged rounds.
const roundsCache = new Map<number, Round>()

export type InvestmentsStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useInvestments(address: string | null) {
  const [status, setStatus] = useState<InvestmentsStatus>('idle')
  const [errorKind, setErrorKind] = useState<'load' | 'uninitialized' | null>(null)
  const [config, setConfig] = useState<Config | null>(null)
  const [investments, setInvestments] = useState<NormalizedInvestment[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const requestIdRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!address) {
        setStatus('idle')
        setConfig(null)
        setInvestments([])
        return
      }

      const requestId = ++requestIdRef.current
      if (mode === 'initial') setStatus('loading')
      setRefreshing(true)

      try {
        const program = getReadProgram()
        const walletKey = new PublicKey(address)

        const fetchedConfig = await fetchConfig(program)
        if (requestId !== requestIdRef.current || !mountedRef.current) return

        if (!fetchedConfig) {
          setErrorKind('uninitialized')
          setStatus('ready')
          setConfig(null)
          setInvestments([])
          return
        }
        setConfig(fetchedConfig)

        const profile = await fetchBuyerProfile(program, walletKey).catch(() => null)
        if (requestId !== requestIdRef.current || !mountedRef.current) return

        if (!profile || profile.purchase_count === 0n) {
          setInvestments([])
          setErrorKind(null)
          setStatus('ready')
          return
        }

        const purchases = await fetchPurchasesForWallet(
          program,
          walletKey,
          profile.purchase_count,
        )
        if (requestId !== requestIdRef.current || !mountedRef.current) return

        // Deduplicate round fetches within this cycle.
        const missingRoundIds = [
          ...new Set(purchases.map((p) => p.round_id)),
        ].filter((id) => !roundsCache.has(id))
        for (const id of missingRoundIds) {
          const round = await fetchRound(program, id)
          if (round) roundsCache.set(id, round)
        }

        const resolvedRounds = new Map<number, Round>()
        for (const id of new Set(purchases.map((p) => p.round_id))) {
          const cached = roundsCache.get(id)
          if (cached) resolvedRounds.set(id, cached)
        }

        const normalized = normalizeInvestments({
          wallet: address,
          config: fetchedConfig,
          buyerProfile: profile,
          purchases,
          roundsById: resolvedRounds,
        })
        if (requestId !== requestIdRef.current || !mountedRef.current) return

        setInvestments(normalized)
        setErrorKind(null)
        setStatus('ready')
      } catch (err) {
        console.error('[investments] load failed:', err)
        if (requestId !== requestIdRef.current || !mountedRef.current) return
        setErrorKind('load')
        setStatus('error')
      } finally {
        if (requestId === requestIdRef.current && mountedRef.current) {
          setRefreshing(false)
        }
      }
    },
    [address],
  )

  // Initial load + reload on wallet change.
  useEffect(() => {
    mountedRef.current = true
    void load('initial')
    return () => {
      mountedRef.current = false
    }
  }, [load])

  // 30s auto-refresh — single interval, cleaned on unmount / wallet change.
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

  const aggregate: VestingState | null =
    investments.length > 0 ? aggregateVestingState(investments.map((i) => i.state)) : null

  return { status, errorKind, config, investments, aggregate, refresh, refreshing }
}

export type UseInvestmentsResult = ReturnType<typeof useInvestments>
