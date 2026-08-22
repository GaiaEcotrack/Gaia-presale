// Gaia backend adapter.
//
// REQUIRES BACKEND IMPLEMENTATION — none of these endpoints exist yet.
// Documented contracts below keep the frontend decoupled; every call is
// feature-flagged by NEXT_PUBLIC_GAIA_API_URL and degrades gracefully
// WITHOUT inventing data (correction #8).
//
// Claim history source priority (correction #1):
//   1. backend            → authoritative        (when API is configured)
//   2. on-chain           → authoritative        (future indexer; not built)
//   3. local-provisional  → NOT authoritative    (real claims captured in this
//     browser only; UI must label it as provisional)

import type {
  ClaimHistoryResult,
  ClaimRecord,
} from '@/types/investment'

export type { ClaimHistoryResult }

const API_BASE = process.env.NEXT_PUBLIC_GAIA_API_URL ?? null

export function isBackendConfigured(): boolean {
  return typeof API_BASE === 'string' && API_BASE.length > 0
}

/* ------------------------------------------------------------------ */
/* Backend contracts (REQUIRES BACKEND IMPLEMENTATION)                 */
/* ------------------------------------------------------------------ */
//
// POST {API_BASE}/v1/purchases
//   Auth      : `X-Gaia-Wallet` header + wallet signature verification
//               performed server-side against the connected public key.
//   Ownership : server derives all records from the verified wallet only.
//   Body      : {
//     wallet: string; txId: string; amountGaia: number; amountUsdc: number;
//     timestamp: string(ISO); vestingSchedule: VestingSchedule;
//     streamflowVault?: string }
//   Idempotent on txId (409 on duplicate must be treated as success).
//   Errors    : 400 invalid payload · 401 signature mismatch · 500 internal.
//
// GET {API_BASE}/v1/investments/{wallet}/claims
//   Auth      : same header scheme; response limited to the verified wallet.
//   Response  : { claims: ClaimRecord[] } (manual Anexo C).
//   Errors    : 404 unknown wallet → empty list · 500 internal.

export interface PurchaseRecordPayload {
  wallet: string
  txId: string
  amountGaia: number
  amountUsdc: number
  currency: 'USDC' | 'USDT'
  timestamp: string
}

/**
 * Fires the purchase record to the backend when configured.
 * Never blocks or fails the UX — persistence is a backend responsibility.
 */
export function postPurchaseRecord(payload: PurchaseRecordPayload): void {
  if (!isBackendConfigured()) return
  void fetch(`${API_BASE}/v1/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Gaia-Wallet': payload.wallet },
    body: JSON.stringify(payload),
  }).catch((err) => {
    // Technical detail stays in logs only.
    console.error('[gaia-backend] purchase record failed:', err)
  })
}

/* ------------------------------------------------------------------ */
/* Claim history                                                       */
/* ------------------------------------------------------------------ */

const LOCAL_KEY_PREFIX = 'gaia-claim-history:'
const LOCAL_PURCHASE_KEY_PREFIX = 'gaia-purchase-tx:'

export interface LocalPurchaseTx {
  purchaseNumber: number
  txId: string
  timestamp: string
}

function localKey(wallet: string): string {
  return `${LOCAL_KEY_PREFIX}${wallet.toLowerCase()}`
}

function localPurchaseKey(wallet: string): string {
  return `${LOCAL_PURCHASE_KEY_PREFIX}${wallet.toLowerCase()}`
}

function sortDesc(records: ClaimRecord[]): ClaimRecord[] {
  return [...records].sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

/** Reads provisional local records; tolerant of corrupt/unavailable storage. */
function readLocalRecords(wallet: string): ClaimRecord[] {
  try {
    const raw = window.localStorage.getItem(localKey(wallet))
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is ClaimRecord =>
        !!r &&
        typeof r === 'object' &&
        typeof (r as ClaimRecord).claimTxId === 'string' &&
        typeof (r as ClaimRecord).amountClaimed === 'number' &&
        typeof (r as ClaimRecord).timestamp === 'string',
    )
  } catch {
    // Corrupt or unavailable localStorage — treat as empty, never throw.
    return []
  }
}

/**
 * Persists a REAL claim (executed in this browser) as a provisional record.
 * These are actual transaction signatures — never fabricated entries.
 */
export function recordLocalClaim(wallet: string, record: ClaimRecord): void {
  try {
    const existing = readLocalRecords(wallet)
    const deduped = existing.filter((r) => r.claimTxId !== record.claimTxId)
    deduped.push(record)
    window.localStorage.setItem(
      localKey(wallet),
      JSON.stringify(sortDesc(deduped).slice(0, 200)),
    )
  } catch (err) {
    console.error('[gaia-backend] could not persist local claim history:', err)
  }
}

/* ------------------------------------------------------------------ */
/* Provisional purchase TX links (real signatures, this browser only)  */
/* ------------------------------------------------------------------ */

/**
 * Persists the real signature of a purchase executed in this browser so the
 * dashboard can link it to its on-chain Purchase PDA (matched by
 * purchaseNumber). Provisional until the backend stores authoritative links.
 */
export function recordLocalPurchase(
  wallet: string,
  record: LocalPurchaseTx,
): void {
  try {
    const raw = window.localStorage.getItem(localPurchaseKey(wallet))
    const parsed: unknown = raw ? JSON.parse(raw) : {}
    const map =
      parsed && typeof parsed === 'object'
        ? (parsed as Record<string, LocalPurchaseTx>)
        : {}
    map[String(record.purchaseNumber)] = record
    window.localStorage.setItem(
      localPurchaseKey(wallet),
      JSON.stringify(map),
    )
  } catch (err) {
    console.error('[gaia-backend] could not persist local purchase tx:', err)
  }
}

/** Tolerant read — corrupt/unavailable storage yields an empty map. */
export function getLocalPurchaseTxs(wallet: string): Record<string, LocalPurchaseTx> {
  try {
    const raw = window.localStorage.getItem(localPurchaseKey(wallet))
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
    const out: Record<string, LocalPurchaseTx> = {}
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      const v = value as Partial<LocalPurchaseTx> | null
      if (
        v &&
        typeof v.purchaseNumber === 'number' &&
        typeof v.txId === 'string'
      ) {
        out[key] = { purchaseNumber: v.purchaseNumber, txId: v.txId, timestamp: String(v.timestamp ?? '') }
      }
    }
    return out
  } catch {
    return {}
  }
}

/**
 * Returns claim history following the source-priority rules:
 * backend (authoritative) → local-provisional (clearly labeled).
 * On-chain indexed history will slot in at priority 2 once available.
 */
export async function getClaimHistory(wallet: string): Promise<ClaimHistoryResult> {
  if (isBackendConfigured()) {
    try {
      const res = await fetch(`${API_BASE}/v1/investments/${wallet}/claims`, {
        headers: { 'X-Gaia-Wallet': wallet },
      })
      if (res.ok) {
        const data = (await res.json()) as { claims?: ClaimRecord[] }
        if (Array.isArray(data.claims)) {
          return {
            records: sortDesc(data.claims),
            source: 'backend',
            authoritative: true,
          }
        }
      }
      // Non-OK responses fall through to provisional rather than failing UI.
      console.error(`[gaia-backend] claims endpoint returned ${res.status}`)
    } catch (err) {
      console.error('[gaia-backend] claims fetch failed:', err)
    }
  }

  return {
    records: sortDesc(readLocalRecords(wallet)),
    source: 'local-provisional',
    authoritative: false,
  }
}
