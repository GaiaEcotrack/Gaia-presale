// Error normalization for purchase and claim flows (manual §3.3 / Cuadro 5).
//
// Classification priority (per implementation review correction #5):
//   1. Structured Anchor error (error.errorCode.name/number)
//   2. Parsed patterns in message/logs ("Error Code:", "Error Number:",
//      "custom program error: 0x…")
//   3. IDL error NAME lookup (semantic)
//   4. Numeric fallback against the IDL error table
//   5. Generic semantic checks (wallet rejection, network, slippage…)
//   6. Unknown
//
// Raw technical detail is preserved on `technical` for logging/debugging and
// must never be rendered to end users.

import type {
  ClaimErrorKind,
  NormalizedError,
  PurchaseErrorKind,
} from '@/types/investment'
import { CLAIM_MESSAGES, PURCHASE_MESSAGES } from '@/lib/messages'

/** Program error names from src/lib/anchor/idl.json (`errors` section). */
const IDL_ERROR_NAMES = [
  'unauthorized',
  'presalePaused',
  'roundNotActive',
  'roundNotStarted',
  'roundEnded',
  'roundSoldOut',
  'invalidPaymentMint',
  'invalidRound',
  'nothingToClaim',
  'mathOverflow',
  'insufficientFunds',
  'whitelistRequired',
  'alreadyInitialized',
  'roundAlreadyStarted',
  'invalidTimeRange',
  'zeroAmount',
  'invalidAuthority',
  'invalidPurchaseLimits',
  'invalidVestingSchedule',
  'purchaseTooSmall',
  'purchaseTooLarge',
  'walletLimitExceeded',
  'invalidRoundStatus',
  'vaultInsufficientFunds',
  'legalNotCleared',
  'notLegalAuthority',
  'buyerNotWhitelisted',
  'notComplianceAuthority',
  'buyerAlreadyWhitelisted',
  'insufficientVaultBalance',
] as const

type IdlErrorName = (typeof IDL_ERROR_NAMES)[number]

/** Numeric codes as fallback when the name is unavailable. */
const IDL_ERROR_NUMBERS: Record<number, IdlErrorName> = {
  6000: 'unauthorized',
  6001: 'presalePaused',
  6002: 'roundNotActive',
  6003: 'roundNotStarted',
  6004: 'roundEnded',
  6005: 'roundSoldOut',
  6006: 'invalidPaymentMint',
  6007: 'invalidRound',
  6008: 'nothingToClaim',
  6009: 'mathOverflow',
  6010: 'insufficientFunds',
  6011: 'whitelistRequired',
  6012: 'alreadyInitialized',
  6013: 'roundAlreadyStarted',
  6014: 'invalidTimeRange',
  6015: 'zeroAmount',
  6016: 'invalidAuthority',
  6017: 'invalidPurchaseLimits',
  6018: 'invalidVestingSchedule',
  6019: 'purchaseTooSmall',
  6020: 'purchaseTooLarge',
  6021: 'walletLimitExceeded',
  6022: 'invalidRoundStatus',
  6023: 'vaultInsufficientFunds',
  6024: 'legalNotCleared',
  6025: 'notLegalAuthority',
  6026: 'buyerNotWhitelisted',
  6027: 'notComplianceAuthority',
  6028: 'buyerAlreadyWhitelisted',
  6029: 'insufficientVaultBalance',
}

/**
 * Name → kind mapping per flow context.
 * Contextual differences:
 *  - nothingToClaim is only meaningful for claims.
 *  - insufficientFunds maps to the user-funds copy for purchases
 *    (payment transfer failure) and to the generic contract copy for claims.
 */
const NAME_TO_KIND_PURCHASE: Partial<Record<IdlErrorName, PurchaseErrorKind>> = {
  unauthorized: 'contract',
  presalePaused: 'contract',
  roundNotActive: 'contract',
  roundNotStarted: 'contract',
  roundEnded: 'contract',
  roundSoldOut: 'contract',
  invalidPaymentMint: 'contract',
  invalidRound: 'contract',
  mathOverflow: 'contract',
  insufficientFunds: 'insufficient-funds',
  whitelistRequired: 'contract',
  alreadyInitialized: 'contract',
  roundAlreadyStarted: 'contract',
  invalidTimeRange: 'contract',
  zeroAmount: 'contract',
  invalidAuthority: 'contract',
  invalidPurchaseLimits: 'contract',
  invalidVestingSchedule: 'contract',
  purchaseTooSmall: 'contract',
  purchaseTooLarge: 'contract',
  walletLimitExceeded: 'contract',
  invalidRoundStatus: 'contract',
  vaultInsufficientFunds: 'contract',
  legalNotCleared: 'contract',
  notLegalAuthority: 'contract',
  buyerNotWhitelisted: 'contract',
  notComplianceAuthority: 'contract',
  buyerAlreadyWhitelisted: 'contract',
  insufficientVaultBalance: 'contract',
}

const NAME_TO_KIND_CLAIM: Partial<Record<IdlErrorName, ClaimErrorKind>> = {
  unauthorized: 'contract',
  presalePaused: 'contract',
  roundNotActive: 'contract',
  roundNotStarted: 'contract',
  roundEnded: 'contract',
  roundSoldOut: 'contract',
  invalidRound: 'contract',
  mathOverflow: 'contract',
  insufficientFunds: 'contract',
  invalidVestingSchedule: 'contract',
  invalidRoundStatus: 'contract',
  vaultInsufficientFunds: 'contract',
  insufficientVaultBalance: 'contract',
  nothingToClaim: 'nothing-to-claim',
}

function isIdlErrorName(value: string): value is IdlErrorName {
  return (IDL_ERROR_NAMES as readonly string[]).includes(value)
}

export interface AnchorErrorInfo {
  name?: string
  number?: number
}

/** Extracts program-error identity from structured fields, message or logs. */
export function extractAnchorErrorInfo(error: unknown): AnchorErrorInfo {
  const anyErr = error as {
    message?: string
    logs?: string[]
    error?: { errorCode?: { code?: string | number; number?: number } }
  } | null

  if (!anyErr) return {}

  // 1. Structured AnchorError
  const structured = anyErr.error?.errorCode
  if (structured) {
    const number =
      typeof structured.number === 'number' ? structured.number : undefined
    const code =
      typeof structured.code === 'string' ? structured.code : undefined
    if (code !== undefined || number !== undefined) {
      return { name: code, number }
    }
  }

  // 2. Patterns inside message / program logs
  const haystack = [String(anyErr.message ?? ''), ...(anyErr.logs ?? [])].join(
    ' | ',
  )

  const nameMatch = haystack.match(/Error Code:\s*([A-Za-z][A-Za-z0-9_]*)/)
  const numMatch = haystack.match(/Error Number:\s*(\d+)/)
  const hexMatch = haystack.match(/custom program error:\s*0x([0-9a-fA-F]+)/)

  let number: number | undefined
  if (numMatch) {
    number = parseInt(numMatch[1], 10)
  } else if (hexMatch) {
    const parsed = parseInt(hexMatch[1], 16)
    // Only accept values inside the program's custom error range (6000+).
    if (parsed >= 0x1770 && parsed < 0x1900) number = parsed
  }

  const name = nameMatch?.[1]
  if (name !== undefined || number !== undefined) return { name, number }

  return {}
}

const USER_REJECTED_RE =
  /(user rejected|rejected the request|request rejected|user denied|cancell?ed by (the )?user|wallet window closed)/i
const WALLET_ERROR_NAMES_RE =
  /(WalletSignTransactionError|WalletSendTransactionError|WalletWindowClosedError|WalletDisconnectionError|WalletNotConnectedError)/i
const NETWORK_RE =
  /(failed to fetch|network error|network request failed|connection (error|refused|closed)|too many requests|[^\d]429[^\d]|[^\d]503[^\d]|[^\d]500[^\d]|blockhash not found|BlockhashNotFound|transaction expired|timeout|timed out|socket)/i
const SLIPPAGE_RE =
  /(slippage|price moved|exceeded the (maximum|allowed) (price|slippage))/i
const INSUFFICIENT_FUNDS_RE =
  /(insufficient funds|insufficient balance|not enough (usdc|usdt|funds)|transfer: insufficient)/i

function normalizeRaw(error: unknown): string {
  const base =
    error instanceof Error ? error.message : String((error as Error)?.message ?? error)
  const logs = (error as { logs?: string[] })?.logs ?? []
  return [base, ...logs].join(' | ')
}

function semanticPurchaseKind(raw: string): PurchaseErrorKind | null {
  if (SLIPPAGE_RE.test(raw)) return 'slippage'
  if (INSUFFICIENT_FUNDS_RE.test(raw)) return 'insufficient-funds'
  if (NETWORK_RE.test(raw)) return 'network'
  return null
}

function isWalletRejection(error: unknown, raw: string): boolean {
  const name = String((error as { name?: string })?.name ?? '')
  return (
    WALLET_ERROR_NAMES_RE.test(name) &&
    (USER_REJECTED_RE.test(raw) || /[^\d]4001/.test(raw))
  )
}

function technicalOf(error: unknown): string {
  return normalizeRaw(error)
}

/**
 * Classifies a purchase (buy) failure into a normalized, user-safe error.
 */
export function classifyPurchaseError(
  error: unknown,
): NormalizedError<PurchaseErrorKind> {
  const technical = technicalOf(error)
  const raw = normalizeRaw(error)

  // Priority 1–2: Anchor identity (structured or parsed).
  const anchor = extractAnchorErrorInfo(error)
  let idlName: IdlErrorName | undefined
  if (anchor.name && isIdlErrorName(anchor.name)) {
    idlName = anchor.name
  } else if (anchor.number !== undefined && IDL_ERROR_NUMBERS[anchor.number]) {
    idlName = IDL_ERROR_NUMBERS[anchor.number]
  }

  if (idlName) {
    const kind = NAME_TO_KIND_PURCHASE[idlName] ?? 'contract'
    return {
      kind,
      title: PURCHASE_MESSAGES.failedTitle,
      message: PURCHASE_MESSAGES.errors[kind] ?? PURCHASE_MESSAGES.errors.contract,
      technical,
    }
  }
  // Program error with an unrecognizable identity is still a contract error.
  if (anchor.name !== undefined || anchor.number !== undefined) {
    return {
      kind: 'contract',
      title: PURCHASE_MESSAGES.failedTitle,
      message: PURCHASE_MESSAGES.errors.contract,
      technical,
    }
  }

  // Priority 3: semantic checks.
  if (isWalletRejection(error, raw)) {
    return {
      kind: 'user-rejected',
      title: PURCHASE_MESSAGES.failedTitle,
      message: PURCHASE_MESSAGES.errors['user-rejected'],
      technical,
    }
  }
  const semantic = semanticPurchaseKind(raw)
  if (semantic) {
    return {
      kind: semantic,
      title: PURCHASE_MESSAGES.failedTitle,
      message: PURCHASE_MESSAGES.errors[semantic],
      technical,
    }
  }

  return {
    kind: 'unknown',
    title: PURCHASE_MESSAGES.failedTitle,
    message: PURCHASE_MESSAGES.errors.unknown,
    technical,
  }
}

/**
 * Classifies a claim failure into a normalized, user-safe error.
 * SOL-balance gating and ownership validation happen BEFORE execution and are
 * surfaced through dedicated kinds; this function only interprets failures.
 */
export function classifyClaimError(
  error: unknown,
): NormalizedError<ClaimErrorKind> {
  const technical = technicalOf(error)
  const raw = normalizeRaw(error)

  // Priority 1–2: Anchor identity.
  const anchor = extractAnchorErrorInfo(error)
  let idlName: IdlErrorName | undefined
  if (anchor.name && isIdlErrorName(anchor.name)) {
    idlName = anchor.name
  } else if (anchor.number !== undefined && IDL_ERROR_NUMBERS[anchor.number]) {
    idlName = IDL_ERROR_NUMBERS[anchor.number]
  }

  if (idlName) {
    const kind = NAME_TO_KIND_CLAIM[idlName] ?? 'contract'
    return {
      kind,
      title: CLAIM_MESSAGES.claiming,
      message: CLAIM_MESSAGES.errors[kind] ?? CLAIM_MESSAGES.errors.contract,
      technical,
    }
  }
  if (anchor.name !== undefined || anchor.number !== undefined) {
    return {
      kind: 'contract',
      title: CLAIM_MESSAGES.claiming,
      message: CLAIM_MESSAGES.errors.contract,
      technical,
    }
  }

  // Priority 3: semantic checks.
  if (isWalletRejection(error, raw)) {
    return {
      kind: 'user-rejected',
      title: CLAIM_MESSAGES.claiming,
      message: CLAIM_MESSAGES.errors['user-rejected'],
      technical,
    }
  }
  if (NETWORK_RE.test(raw)) {
    return {
      kind: 'network',
      title: CLAIM_MESSAGES.claiming,
      message: CLAIM_MESSAGES.errors.network,
      technical,
    }
  }
  if (INSUFFICIENT_FUNDS_RE.test(raw)) {
    return {
      kind: 'insufficient-sol',
      title: CLAIM_MESSAGES.claiming,
      message: CLAIM_MESSAGES.errors['insufficient-sol'],
      technical,
    }
  }

  return {
    kind: 'unknown',
    title: CLAIM_MESSAGES.claiming,
    message: CLAIM_MESSAGES.errors.unknown,
    technical,
  }
}
