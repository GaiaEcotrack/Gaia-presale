// Domain types for the purchase / vesting / claim experience.
// Source of truth is always on-chain data; these types are the normalized
// frontend representation produced by the vesting adapter layer.

export type PurchaseStatus =
  | 'idle'
  | 'wallet-disconnected'
  | 'signing'
  | 'processing'
  | 'confirmed'
  | 'failed'
  | 'pending'

export type ClaimStatus =
  | 'idle'
  | 'checking'
  | 'signing'
  | 'processing'
  | 'success'
  | 'error'

/** RPC-level transaction determination (never inferred from UI state). */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed'

export interface VestingRelease {
  /** Percentage of the total unlocked at this milestone (0-100). */
  percentage: number
  /** ISO 8601 UTC timestamp derived from on-chain Round/config data. */
  releaseAt: string
  /** Absolute GAIA amount this milestone unlocks, when derivable. */
  amount?: number
}

export interface VestingSchedule {
  tgeAt: string
  cliffEndsAt: string
  releases: VestingRelease[]
}

export interface VestingState {
  totalAmount: number
  unlockedAmount: number
  withdrawnAmount: number
  lockedAmount: number
  claimableAmount: number
  claimedAmount: number
  releases: VestingRelease[]
  nextRelease?: VestingRelease
  fullyClaimed: boolean
}

export type ClaimHistorySource = 'backend' | 'sync-pending'

/**
 * A confirmed claim as reported by the backend.
 * amountClaimed is a DECIMAL STRING — never parsed through Number() so no
 * financial precision is ever lost in transport or display preparation.
 */
export interface ClaimRecord {
  wallet: string
  claimTxId: string
  amountClaimed: string
  /** ISO 8601 UTC */
  timestamp: string
  vestingReleaseIndex?: number
}

export interface ClaimHistoryResult {
  records: ClaimRecord[]
  source: ClaimHistorySource
  /**
   * true ONLY when records come from the authoritative backend. The
   * 'sync-pending' source carries zero records and never pretends otherwise.
   */
  authoritative: boolean
}

export type PurchaseErrorKind =
  | 'slippage'
  | 'insufficient-funds'
  | 'network'
  | 'user-rejected'
  | 'contract'
  | 'unknown'

export type ClaimErrorKind =
  | 'insufficient-sol'
  | 'user-rejected'
  | 'network'
  | 'contract'
  | 'nothing-to-claim'
  | 'ownership-mismatch'
  | 'unknown'

export interface NormalizedError<K extends string = PurchaseErrorKind> {
  kind: K
  title: string
  message: string
  /** Technical detail kept for logging/debugging — never rendered raw to users. */
  technical?: string
}

export interface PurchaseSnapshot {
  wallet: string
  txId: string | null
  /**
   * Display-only estimates as DECIMAL STRINGS produced by integer math.
   * The on-chain Purchase PDA remains the source of truth for real amounts.
   */
  amountGaia: string
  paidAmount: string
  currency: 'USDC' | 'USDT'
  sentAt: string
}
