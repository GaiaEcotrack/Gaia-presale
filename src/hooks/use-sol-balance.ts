'use client'

// SOL balance with a short-lived shared cache so multiple consumers
// (gas warning, claim button, pre-claim gate) never duplicate the same RPC.

import { useCallback, useEffect, useRef, useState } from 'react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { getConnection } from '@/lib/anchor/program'

const CACHE_TTL_MS = 15_000

interface CacheEntry {
  sol: number
  fetchedAt: number
}

const balanceCache = new Map<string, CacheEntry>()

export function readCachedSolBalance(address: string): number | null {
  const entry = balanceCache.get(address)
  if (!entry) return null
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) return null
  return entry.sol
}

async function fetchSolBalance(address: string): Promise<number> {
  const cached = readCachedSolBalance(address)
  if (cached !== null) return cached

  const connection = getConnection()
  try {
    const lamports = await connection.getBalance(new PublicKey(address))
    const sol = lamports / LAMPORTS_PER_SOL
    balanceCache.set(address, { sol, fetchedAt: Date.now() })
    return sol
  } catch (err) {
    console.error('[sol-balance] fetch failed:', err)
    throw err
  }
}

/** Force-bypasses the cache — used right before executing a claim. */
export async function refreshSolBalance(address: string): Promise<number> {
  const connection = getConnection()
  const lamports = await connection.getBalance(new PublicKey(address))
  const sol = lamports / LAMPORTS_PER_SOL
  balanceCache.set(address, { sol, fetchedAt: Date.now() })
  return sol
}

export function useSolBalance(address: string | null) {
  const [solBalance, setSolBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const load = useCallback(
    async (force = false) => {
      if (!address) {
        setSolBalance(null)
        return null
      }
      const requestId = ++requestIdRef.current
      setLoading(true)
      try {
        const value = force
          ? await refreshSolBalance(address)
          : await fetchSolBalance(address)
        if (requestId === requestIdRef.current && mountedRef.current) {
          setSolBalance(value)
        }
        return value
      } catch {
        // Network failure keeps previous value; UI treats null as unknown.
        return null
      } finally {
        if (requestId === requestIdRef.current && mountedRef.current) {
          setLoading(false)
        }
      }
    },
    [address],
  )

  useEffect(() => {
    void load()
  }, [load])

  return { solBalance, loading, refresh: load }
}
