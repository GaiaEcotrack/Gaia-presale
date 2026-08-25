// Formatting utilities shared across the presale / investment experience.

const TX_SHORT_START = 4
const TX_SHORT_END = 4

/**
 * Shortens a transaction id for display: `5x8f…k9p`.
 * Returns the input unchanged when it is already short enough.
 */
export function shortenTxId(
  txId: string,
  start: number = TX_SHORT_START,
  end: number = TX_SHORT_END,
): string {
  if (!txId) return ''
  if (txId.length <= start + end + 1) return txId
  return `${txId.slice(0, start)}\u2026${txId.slice(-end)}`
}

/** Shortens a wallet/address for display (same convention as header). */
export function shortenAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}\u2026${address.slice(-4)}`
}

/**
 * Formats a GAIA token amount for display, e.g. `1,250` or `312.5`.
 * GAIA uses 6 decimals on-chain; UI shows up to 2 fraction digits
 * unless more are needed for small amounts.
 */
export function formatTokenAmount(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.abs(safe) > 0 && Math.abs(safe) < 1 ? 6 : 2,
  }).format(safe)
}

/** Formats a USD/stable payment amount, e.g. `250 USDC`. */
export function formatUsdAmount(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safe)
}

/**
 * Formats a DECIMAL STRING financial amount (e.g. "12500.000000000000000000")
 * for display WITHOUT ever converting through floating-point numbers.
 * Integer part gets thousands grouping; fraction digits are truncated to
 * `maxFractionDigits` (never rounded up, never parsed via parseFloat).
 */
export function formatDecimalString(
  value: string,
  maxFractionDigits: number = 2,
): string {
  if (!value || typeof value !== 'string') return '0'
  const trimmed = value.trim()
  const negative = trimmed.startsWith('-')
  const unsigned = negative ? trimmed.slice(1) : trimmed
  const [intPartRaw, fracPartRaw = ''] = unsigned.split('.')
  const intDigits = intPartRaw.replace(/\D/g, '') || '0'
  const groupedInt = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const frac = fracPartRaw.replace(/\D/g, '').slice(0, maxFractionDigits)
  const sign = negative && intDigits !== '0' ? '-' : ''
  return frac.length > 0 ? `${sign}${groupedInt}.${frac}` : `${sign}${groupedInt}`
}

/** Converts micro-USD (on-chain unit) to a plain USD number. */
export function fromMicroUsd(micro: bigint | number): number {
  return Number(micro) / 1_000_000
}

/**
 * Converts a base-unit BigInt amount into a plain decimal string using pure
 * integer math — never through floating-point Number().
 */
export function bigintToDecimalString(baseUnits: bigint, decimals: number = 6): string {
  const negative = baseUnits < 0n
  const abs = negative ? -baseUnits : baseUnits
  const divisor = 10n ** BigInt(decimals)
  const intPart = abs / divisor
  const fracPart = abs % divisor
  const sign = negative ? '-' : ''
  return `${sign}${intPart.toString()}.${fracPart.toString().padStart(decimals, '0')}`
}

/**
 * Local date/time in the browser timezone, e.g. `August 13, 2026 - 09:32`.
 * The manual requires local time and UTC to be shown separately.
 */
export function formatDateLocal(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return ''
  const datePart = date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timePart = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${datePart} - ${timePart}`
}

/** Standard ISO 8601 UTC representation, e.g. `2026-08-13T14:32Z`-style. */
export function formatDateTimeUtc(input: Date | string | number): string {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return ''
  const iso = date.toISOString()
  return iso.replace(/\.\d{3}Z$/, 'Z')
}

/** Formats SOL balance with enough precision for fee-threshold UX. */
export function formatSolAmount(sol: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(sol)
}
