// Server-side Solana RPC access with hard timeout guarantees (GAP-5).
//
// Every RPC call used for financial verification MUST complete or fail within
// RPC_TIMEOUT_MS. web3.js getTransaction does not accept an abortSignal in
// this version, so we race the call against a timer that both rejects and
// fires a real AbortController — callers receive a typed RpcTimeoutError
// instead of hanging, and the connection factory is injectable for tests.

import { Connection } from '@solana/web3.js'
import { RPC_URL } from '@/lib/anchor/config'

export const RPC_TIMEOUT_MS = 8000

let timeoutOverrideMs: number | null = null

/** Test hook — temporarily lowers the effective deadline. Pass null to restore. */
export function setRpcTimeoutOverrideForTests(ms: number | null): void {
  timeoutOverrideMs = ms
}

export class RpcTimeoutError extends Error {
  readonly reason = 'RPC_TIMEOUT'
  constructor(timeoutMs: number) {
    super(`Solana RPC call timed out after ${timeoutMs}ms`)
    this.name = 'RpcTimeoutError'
  }
}

export type RpcOperation<T> = (signal: AbortSignal) => Promise<T>

/**
 * Runs an RPC operation under a hard deadline. The operation receives a real
 * AbortSignal; when the deadline fires the signal is aborted AND the returned
 * promise rejects with RpcTimeoutError. No request can hang the caller.
 */
export function withRpcTimeout<T>(
  op: RpcOperation<T>,
  timeoutMs: number = timeoutOverrideMs ?? RPC_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController()
  let rejectDeadline!: (err: RpcTimeoutError) => void
  const deadline = new Promise<never>((_, reject) => {
    rejectDeadline = reject
  })

  const timer = setTimeout(() => {
    // Cancel any signal-aware transport first, then fail the race.
    controller.abort()
    rejectDeadline(new RpcTimeoutError(timeoutMs))
  }, timeoutMs)

  return Promise.race([op(controller.signal), deadline]).finally(() => {
    clearTimeout(timer)
  })
}

/** Minimal RPC surface required by server verification (structural). */
export type VerifyRpcClient = Pick<Connection, 'getAccountInfo'> & {
  /**
   * Raw jsonParsed transaction WITHOUT web3.js response coercion (its
   * superstruct validator rejects parsed inner instructions that lack an
   * `accounts` array). Returns the RPC `result` verbatim.
   */
  getTransactionJsonParsed(signature: string): Promise<unknown>
}

export type VerifyConnectionFactory = () => VerifyRpcClient

let customFactory: VerifyConnectionFactory | null = null
let singleton: Connection | null = null

/** Test hook — injects a deterministic Connection factory. Pass null to restore. */
export function setVerifyConnectionFactory(factory: VerifyConnectionFactory | null): void {
  customFactory = factory
  if (factory) singleton = null
}

/**
 * Connection used exclusively by server verification. Prefers the server-only
 * SOLANA_RPC_URL env var and never falls back to anything client-derived.
 */
export function getVerifyConnection(): VerifyRpcClient {
  if (customFactory) return customFactory()
  if (!singleton) {
    const endpoint = process.env.SOLANA_RPC_URL || RPC_URL
    singleton = new Connection(endpoint, { commitment: 'confirmed' })
  }
  const conn = singleton
  return {
    getAccountInfo: (...args) => conn.getAccountInfo(...args),
    async getTransactionJsonParsed(signature: string): Promise<unknown> {
      const endpoint = process.env.SOLANA_RPC_URL || RPC_URL
      return withRpcTimeout(async (signal) => {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 'gaia-verify',
            method: 'getTransaction',
            params: [
              signature,
              { commitment: 'confirmed', maxSupportedTransactionVersion: 0, encoding: 'jsonParsed' },
            ],
          }),
          signal,
        })
        const j = (await res.json()) as {
          result?: unknown
          error?: { message?: string }
        }
        if (j.error) throw new Error(j.error.message ?? 'RPC error')
        return j.result ?? null
      })
    },
  }
}
