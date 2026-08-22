// Shared helper: builds a classifiable error payload from an on-chain
// transaction's meta/logs so BOTH purchase and claim flows classify failures
// with the same accuracy.

import type { Connection } from '@solana/web3.js'

export interface OnChainFailureDetail {
  message: string
  logs: string[]
}

/** Returns null when the transaction cannot be fetched (caller falls back). */
export async function fetchOnChainFailureDetail(
  connection: Connection,
  signature: string,
): Promise<OnChainFailureDetail | null> {
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })
    if (!tx?.meta) return null
    return {
      message: JSON.stringify(tx.meta.err ?? {}),
      logs: tx.meta.logMessages ?? [],
    }
  } catch (err) {
    console.error('[tx-failure] getTransaction failed:', err)
    return null
  }
}
