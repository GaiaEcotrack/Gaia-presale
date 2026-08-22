'use client'

// React binding for the purchase state machine + RPC polling.
//
// Guarantees:
//  - Signature captured immediately after send; confirmation is polled via
//    getTransaction with explicit semantics (null → pending, meta.err → failed).
//  - 60s without confirmation → status 'pending' (never a hard failure);
//    polling continues at backoff up to the total budget, then gives up
//    leaving 'pending' on screen (user keeps Solscan link).
//  - Exactly one poll loop per transaction: starting a new run stops any
//    previous handle. All timers are cleared on unmount and on wallet change.
//  - Double-start is impossible while in flight.

import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from 'react'
import { getConnection } from '@/lib/anchor/program'
import {
  startTransactionPolling,
  type PollHandle,
} from '@/lib/solana/polling'
import { fetchOnChainFailureDetail } from '@/lib/solana/tx-failure'
import {
  INITIAL_PURCHASE_STATE,
  canStart,
  isInFlight,
  purchaseReducer,
  type PurchaseMachineState,
} from '@/lib/purchase-state-machine'
import { classifyPurchaseError } from '@/lib/errors/purchase-errors'
import type {
  ClaimErrorKind,
  NormalizedError,
  PurchaseErrorKind,
} from '@/types/investment'

export interface StartPurchaseArgs {
  /** Whether a wallet is connected right now — drives wallet-disconnected. */
  connected: boolean
  /**
   * Performs the actual send. MUST resolve only after the transaction was
   * accepted by the network, returning its signature (correction #3).
   */
  send: () => Promise<string>
}

export interface UsePurchaseStatusOptions {
  /**
   * Changes to this key (e.g. connected address) abort any active flow and
   * reset state — covers "wallet changed during polling".
   */
  watchKey?: string
}

/** Fetches failure detail from RPC logs so classification stays accurate. */
async function classifyOnChainFailure(
  signature: string,
): Promise<NormalizedError<PurchaseErrorKind>> {
  const detail = await fetchOnChainFailureDetail(getConnection(), signature)
  if (detail) return classifyPurchaseError(detail)
  return classifyPurchaseError(new Error('Transaction failed on-chain'))
}

export function usePurchaseStatus(options: UsePurchaseStatusOptions = {}) {
  const [state, dispatch] = useReducer(purchaseReducer, INITIAL_PURCHASE_STATE)
  const pollRef = useRef<PollHandle | null>(null)
  const busyRef = useRef(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      // Unmount during polling: stop everything (correction #4 / #11).
      pollRef.current?.stop()
      pollRef.current = null
      busyRef.current = false
    }
  }, [])

  const stopPolling = useCallback(() => {
    pollRef.current?.stop()
    pollRef.current = null
  }, [])

  // Wallet change mid-flight: abort and reset (correction #11).
  useEffect(() => {
    stopPolling()
    busyRef.current = false
    dispatch({ type: 'RESET' })
  }, [options.watchKey, stopPolling])

  const beginPolling = useCallback((signature: string) => {
    stopPolling()
    pollRef.current = startTransactionPolling({
      connection: getConnection(),
      signature,
      onStatus: (status) => {
        if (!mountedRef.current) return
        if (status === 'confirmed') dispatch({ type: 'CONFIRMED' })
        if (status === 'failed') {
          void classifyOnChainFailure(signature).then((normalized) => {
            if (!mountedRef.current) return
            dispatch({
              type: 'FAILED',
              kind: normalized.kind,
              message: normalized.message,
            })
          })
        }
      },
      onProcessingTimeout: () => {
        if (!mountedRef.current) return
        dispatch({ type: 'PROCESSING_TIMEOUT' }) // processing → pending (60s)
      },
    })
  }, [stopPolling])

  const start = useCallback(
    async ({ connected, send }: StartPurchaseArgs): Promise<void> => {
      if (busyRef.current || isInFlight(state.status)) return // double-run guard
      if (!canStart(state)) return

      busyRef.current = true
      try {
        dispatch({ type: 'START', connected })
        if (!connected) {
          return
        }

        let signature: string
        try {
          signature = await send() // resolves ONLY after real network send
        } catch (sendError) {
          const normalized = classifyPurchaseError(sendError)
          console.error('[purchase-status] send failed:', normalized.technical)
          dispatch({ type: 'FAILED', kind: normalized.kind, message: normalized.message })
          return
        }

        dispatch({ type: 'SENT', txId: signature })
        beginPolling(signature)
      } finally {
        busyRef.current = false
      }
    },
    [beginPolling, state],
  )

  const reset = useCallback(() => {
    stopPolling()
    busyRef.current = false
    dispatch({ type: 'RESET' })
  }, [stopPolling])

  return {
    ...state,
    start,
    reset,
    isActive: isInFlight(state.status),
  }
}

export type UsePurchaseStatusResult = ReturnType<typeof usePurchaseStatus>
export type { PurchaseMachineState, ClaimErrorKind }
