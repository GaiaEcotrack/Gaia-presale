// Gaia backend adapter (PostgreSQL + Solana RPC Verification).
//
// POST-REMEDIATION CONTRACT (GAP-6):
//   The backend is the ONLY financial persistence. localStorage/sessionStorage/
//   indexedDB are NEVER used for purchases, claims or any financial history.
//   When the backend is unreachable the UI receives an explicit
//   'sync-pending' result — we never fabricate data from local storage.

import type {
  ClaimHistoryResult,
  ClaimRecord,
} from '@/types/investment'

export type { ClaimHistoryResult }

export interface PurchaseRecordPayload {
  wallet: string
  txId: string
  amountGaia?: number
  amountUsdc?: number
  currency?: 'USDC' | 'USDT'
  timestamp?: string
}

function getApiUrl(path: string): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`
  }
  const base = process.env.NEXT_PUBLIC_GAIA_API_URL || 'http://localhost:3000'
  return `${base}${path}`
}

/**
 * Fires-and-forgets purchase verification/persistence to the canonical API.
 * Never blocks or fails the UX — persistence is idempotent server-side.
 */
export function postPurchaseRecord(payload: PurchaseRecordPayload): void {
  void fetch(getApiUrl('/api/sync/purchase'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      txSignature: payload.txId,
      wallet: payload.wallet,
    }),
  }).catch((err) => {
    console.error('[gaia-backend] purchase sync failed:', err)
  })
}

/**
 * Fires-and-forgets claim verification/persistence to the canonical API.
 */
export function postClaimSync(wallet: string, txSignature: string): void {
  void fetch(getApiUrl('/api/sync/claim'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      txSignature,
      wallet,
    }),
  }).catch((err) => {
    console.error('[gaia-backend] claim sync failed:', err)
  })
}

/**
 * Retrieves the AUTHORITATIVE claim history from PostgreSQL via the canonical
 * API. On network/API failure returns an explicit SYNC-PENDING result —
 * records stay empty and nothing is ever read from local storage.
 */
export async function getClaimHistory(wallet: string): Promise<ClaimHistoryResult> {
  try {
    const res = await fetch(getApiUrl(`/api/investment/${encodeURIComponent(wallet)}`))
    if (!res.ok) {
      return { records: [], source: 'sync-pending', authoritative: false }
    }
    const json = (await res.json()) as {
      success?: boolean
      data?: { claims?: { txSignature: string; amountGaia: string; createdAt: string }[] }
    }
    if (json.success && Array.isArray(json.data?.claims)) {
      const records: ClaimRecord[] = (json.data?.claims ?? []).map((c) => ({
        wallet,
        claimTxId: c.txSignature,
        // Decimal-safe transport: amounts travel as strings end-to-end.
        amountClaimed: c.amountGaia,
        timestamp: c.createdAt,
      }))
      return { records, source: 'backend', authoritative: true }
    }
    return { records: [], source: 'sync-pending', authoritative: false }
  } catch {
    return { records: [], source: 'sync-pending', authoritative: false }
  }
}
