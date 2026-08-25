'use client'

// Claim execution flow (manual §9.3 / corrections #2, #13).
//
// Sequence — UI amounts are NEVER trusted for execution:
//   1. checking  : re-fetch config + round + purchase FRESH from RPC
//   2.           : assert ownership (fresh.wallet === connected wallet)
//   3.           : recompute claimable from fresh on-chain state; abort if 0
//   4.           : SOL fee gate (forced refresh) — blocked below threshold
//   5. signing   : wallet signs; transaction is sent
//   6. processing: poll via getTransaction semantics until terminal
//   7. success   : record REAL claim locally + immediate parent refresh
//
// Guards: no double execution (busy ref + status), unmount-safe polling,
// wallet-change abort via watchKey.

import { useCallback, useEffect, useRef, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { getReadProgram } from '@/lib/anchor/program'
import { fetchConfig, fetchRound, fetchPurchase } from '@/lib/anchor/fetch'
import { computeVesting } from '@/lib/anchor/vesting'
import { executeClaim } from '@/lib/anchor/instructions/claim'
import { getConnection } from '@/lib/anchor/program'
import {
  startTransactionPolling,
  type PollHandle,
} from '@/lib/solana/polling'
import { fetchOnChainFailureDetail } from '@/lib/solana/tx-failure'
import { classifyClaimError } from '@/lib/errors/purchase-errors'
import { postClaimSync } from '@/lib/api/gaia-backend'
import { bigintToDecimalString } from '@/lib/format'
import { refreshSolBalance } from '@/hooks/use-sol-balance'
import { SOL_THRESHOLDS } from '@/lib/messages'
import type { SignerWallet } from '@/lib/anchor/wallet'
import type { NormalizedError, ClaimErrorKind } from '@/types/investment'

export type ClaimFlowStatus =
  | 'idle'
  | 'checking'
  | 'signing'
  | 'processing'
  | 'success'
  | 'error'

interface UseClaimOptions {
  address: string | null
  signerWallet: SignerWallet | null
  /** Called right after a successful claim so parents refresh immediately. */
  onSuccess?: (info: { txId: string; amountClaimed: string }) => void
}

async function classifyOnChainClaimFailure(
  signature: string,
): Promise<NormalizedError<ClaimErrorKind>> {
  const detail = await fetchOnChainFailureDetail(getConnection(), signature)
  if (detail) return classifyClaimError(detail)
  return classifyClaimError(new Error('Claim transaction failed on-chain'))
}

export function useClaim({ address, signerWallet, onSuccess }: UseClaimOptions) {
  const [status, setStatus] = useState<ClaimFlowStatus>('idle')
  const [txId, setTxId] = useState<string | null>(null)
  const [error, setError] = useState<NormalizedError<ClaimErrorKind> | null>(null)

  const busyRef = useRef(false)
  const mountedRef = useRef(true)
  const pollRef = useRef<PollHandle | null>(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      pollRef.current?.stop()
      pollRef.current = null
      busyRef.current = false
    }
  }, [])

  const reset = useCallback(() => {
    pollRef.current?.stop()
    pollRef.current = null
    busyRef.current = false
    setStatus('idle')
    setTxId(null)
    setError(null)
  }, [])

  // Wallet change mid-flow: abort everything.
  useEffect(() => {
    pollRef.current?.stop()
    pollRef.current = null
    busyRef.current = false
    setStatus('idle')
    setTxId(null)
    setError(null)
  }, [address])

  const execute = useCallback(
    async (args: { roundId: number; purchaseNumber: bigint }): Promise<boolean> => {
      if (busyRef.current || status !== 'idle') return false // double-click guard
      if (!address || !signerWallet) return false

      busyRef.current = true
      const ownerKey = new PublicKey(address)

      try {
        // --- Phase 1: checking with FRESH on-chain data -----------------
        setStatus('checking')
        setError(null)
        setTxId(null)

        const program = getReadProgram()
        const [config, round, freshPurchase] = await Promise.all([
          fetchConfig(program),
          fetchRound(program, args.roundId),
          fetchPurchase(program, ownerKey, args.purchaseNumber),
        ])

        if (!mountedRef.current) return false
        if (!config || !round || !freshPurchase) {
          setError(classifyClaimError(new Error('nothingToClaim')))
          setStatus('error')
          return false
        }

        // Correction #2/#24: ownership against the CONNECTED wallet only.
        if (!freshPurchase.wallet.equals(ownerKey)) {
          setError({
            kind: 'ownership-mismatch',
            title: 'Claim',
            message: 'This vesting does not belong to the connected wallet.',
          })
          setStatus('error')
          return false
        }

        const vesting = computeVesting(freshPurchase, round, config)

        // Round gate — same semantics as the /claim widget: claims require
        // the round to have ended. Validated against FRESH round data.
        const roundEnded =
          round.status === 'Ended' ||
          Math.floor(Date.now() / 1000) > Number(round.end_time)
        if (!roundEnded) {
          setError({
            kind: 'nothing-to-claim',
            title: 'Claim',
            message: 'Claims open once the round has ended.',
          })
          setStatus('error')
          return false
        }

        if (vesting.claimable <= 0n) {
          setError({
            kind: 'nothing-to-claim',
            title: 'Claim',
            message: 'There are no tokens available to claim right now.',
          })
          setStatus('error')
          return false
        }
        // Decimal-safe display amount: pure integer math, never Number().
        const claimableDisplay = bigintToDecimalString(vesting.claimable, 6)

        // --- Phase 2: SOL fee gate (forced fresh balance) ---------------
        let solBalance: number | null = null
        try {
          solBalance = await refreshSolBalance(address)
        } catch {
          solBalance = null // unknown balance → do not block, wallet will guard
        }
        if (
          solBalance !== null &&
          solBalance < SOL_THRESHOLDS.BLOCK
        ) {
          setError(classifyClaimError(new Error('insufficient funds for fees')))
          setStatus('error')
          return false
        }

        // --- Phase 3: signing + send ------------------------------------
        setStatus('signing')
        let signature: string
        try {
          const result = await executeClaim(
            signerWallet,
            { roundId: args.roundId, purchaseNumber: args.purchaseNumber },
            { awaitConfirmation: false },
          )
          signature = result.signature
        } catch (sendErr) {
          console.error('[claim] send failed:', sendErr)
          const normalized = classifyClaimError(sendErr)
          setError(normalized)
          setStatus('error')
          return false
        }

        if (!mountedRef.current) return false
        setTxId(signature)
        setStatus('processing')

        // --- Phase 4: polling -------------------------------------------
        const succeeded = await new Promise<boolean>((resolve) => {
          pollRef.current?.stop()
          pollRef.current = startTransactionPolling({
            connection: getConnection(),
            signature,
            onStatus: (rpcStatus) => {
              if (!mountedRef.current) return
              if (rpcStatus === 'confirmed') resolve(true)
              if (rpcStatus === 'failed') resolve(false)
              // 'pending' keeps waiting (incl. post-60s backoff window).
            },
            onGiveUp: () => resolve(false), // budget exhausted while pending
          })
        })

        if (!mountedRef.current) return false

        if (succeeded) {
          setStatus('success')
          // Backend-only persistence: the server verifies the tx on-chain and
          // writes the immutable Claim row. Nothing is stored locally.
          postClaimSync(address, signature)
          onSuccess?.({ txId: signature, amountClaimed: claimableDisplay })
          return true
        }

        const normalized = await classifyOnChainClaimFailure(signature)
        setError(normalized)
        setStatus('error')
        return false
      } finally {
        busyRef.current = false
      }
    },
    [address, signerWallet, status, onSuccess],
  )

  return { status, txId, error, execute, reset }
}

export type UseClaimResult = ReturnType<typeof useClaim>
