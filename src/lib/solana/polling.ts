// Transaction status polling with explicit semantics (manual §7.4).
//
// Determination rules — the ONLY source of truth is the RPC:
//   getTransaction(signature) === null        → 'pending'   (never 'failed')
//   tx exists && tx.meta?.err != null         → 'failed'
//   tx exists && tx.meta?.err == null         → 'confirmed'
//
// Timing:
//   processing window : poll every POLL_INTERVAL_MS until confirmed/failed,
//                       or until PROCESSING_TIMEOUT_MS elapses.
//   after timeout     : caller receives a one-shot 'pending' transition and
//                       polling continues at PENDING_POLL_INTERVAL_MS (backoff)
//                       for up to PENDING_TIMEOUT_MS total.
//
// Guarantees: no overlapping RPC requests (next tick only scheduled after the
// previous resolves), single active loop per handle, full cleanup via stop().

import type { Connection } from '@solana/web3.js'
import type { TransactionStatus } from '@/types/investment'

export const POLL_INTERVAL_MS = 3_000
export const PENDING_POLL_INTERVAL_MS = 15_000
export const PROCESSING_TIMEOUT_MS = 60_000
export const PENDING_TIMEOUT_MS = 5 * 60_000

/** Pure determination from an RPC response. Exported for tests. */
export function determineStatus(
  tx: { meta?: { err: unknown } | null } | null,
): TransactionStatus {
  if (tx === null || tx === undefined) return 'pending'
  if (tx.meta?.err != null) return 'failed'
  return 'confirmed'
}

/** Single RPC query; RPC failures are treated as pending, never failed. */
export async function fetchTransactionStatus(
  connection: Connection,
  signature: string,
): Promise<TransactionStatus> {
  if (!signature) return 'pending'
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })
    return determineStatus(tx as { meta?: { err: unknown } | null } | null)
  } catch {
    return 'pending'
  }
}

export interface PollOptions {
  connection: Connection
  signature: string
  onStatus: (status: TransactionStatus) => void
  /** Called once when the processing window (60s) expires while pending. */
  onProcessingTimeout?: () => void
  /** Called once when the total polling budget is exhausted while pending. */
  onGiveUp?: () => void
  processingTimeoutMs?: number
  totalTimeoutMs?: number
}

export interface PollHandle {
  stop(): void
  readonly stopped: boolean
}

export function startTransactionPolling(options: PollOptions): PollHandle {
  const {
    connection,
    signature,
    onStatus,
    onProcessingTimeout,
    onGiveUp,
    processingTimeoutMs = PROCESSING_TIMEOUT_MS,
    totalTimeoutMs = Math.max(PENDING_TIMEOUT_MS, PROCESSING_TIMEOUT_MS),
  } = options

  let stopped = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let processingTimeoutFired = false

  const stop = () => {
    stopped = true
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  const scheduleNext = (delay: number) => {
    if (stopped) return
    timer = setTimeout(runOnce, delay)
  }

  const runOnce = async () => {
    if (stopped) return
    const elapsed = Date.now() - startedAt
    const status = await fetchTransactionStatus(connection, signature)
    if (stopped) return

    onStatus(status)

    switch (status) {
      case 'confirmed':
      case 'failed':
        return // terminal — loop ends naturally
      case 'pending':
      default:
        break
    }

    if (!processingTimeoutFired && elapsed >= processingTimeoutMs) {
      processingTimeoutFired = true
      onProcessingTimeout?.()
    }

    if (elapsed >= totalTimeoutMs) {
      onGiveUp?.()
      return // budget exhausted — caller decides what to show
    }

    scheduleNext(processingTimeoutFired ? PENDING_POLL_INTERVAL_MS : POLL_INTERVAL_MS)
  }

  const startedAt = Date.now()
  void runOnce()

  return { stop, get stopped() { return stopped } }
}
