'use client'

// Investment summary — BACKEND-DRIVEN. Totals and per-purchase rows render
// exclusively from GET /api/investment/[wallet] payload. Every purchase row
// links its REAL verified txSignature via Solscan. No localStorage anywhere.

import { ExternalLink } from 'lucide-react'
import {
  formatDateLocal,
  formatTokenAmount,
  formatDecimalString,
} from '@/lib/format'
import { getSolscanTxUrl, getSolscanAddressUrl } from '@/lib/solana/explorer'
import type { BackendPurchase } from '@/hooks/use-investments'
import type { VestingState } from '@/types/investment'

interface SummaryStrings {
  totalPurchasedUsdc: string
  totalAcquiredGaia: string
  unlockedGaia: string
  withdrawnGaia: string
  claimableGaia: string
  lockedGaia: string
}

interface InvestmentSummaryProps {
  summary: SummaryStrings
  purchases: BackendPurchase[]
  aggregate: VestingState | null
  gaiaMintAddress: string | null
}

export function InvestmentSummary({
  summary,
  purchases,
  aggregate,
  gaiaMintAddress,
}: InvestmentSummaryProps) {
  if (!aggregate || purchases.length === 0) return null

  const firstPurchaseAt = purchases
    .map((p) => new Date(p.createdAt).getTime())
    .reduce((min, t) => Math.min(min, t), Number.POSITIVE_INFINITY)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            {formatDecimalString(summary.totalAcquiredGaia)}
          </p>
          <p className="text-xs text-muted-foreground">Total GAIA acquired</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm sm:text-base font-medium pt-1">
            {formatDecimalString(summary.totalPurchasedUsdc)} USD
          </p>
          <p className="text-xs text-muted-foreground">Total paid</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm sm:text-base font-medium pt-1">
            {Number.isFinite(firstPurchaseAt)
              ? formatDateLocal(new Date(firstPurchaseAt))
              : '—'}
          </p>
          <p className="text-xs text-muted-foreground">First purchase</p>
        </div>
      </div>

      {/* Per-purchase rows — real verified signatures from PostgreSQL */}
      <div className="space-y-2">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="border border-border rounded-lg p-3 flex flex-col gap-2"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium text-sm">
                Round #{purchase.roundId}
                {purchase.purchaseNumber !== null && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    Purchase #{purchase.purchaseNumber}
                  </span>
                )}
              </p>
              <p className="text-sm tabular-nums">
                {formatTokenAmount(Number(purchase.amountGaia))} GAIA ·{' '}
                {formatDecimalString(purchase.amountUsdc)} {purchase.currency}
              </p>
            </div>
            <a
              href={getSolscanTxUrl(purchase.txSignature)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-blue-500 hover:underline truncate"
            >
              {purchase.txSignature}
            </a>
          </div>
        ))}
      </div>

      {gaiaMintAddress && (
        <a
          href={getSolscanAddressUrl(gaiaMintAddress)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
        >
          GAIA token on Solscan
          <ExternalLink className="w-3 h-3" aria-hidden />
        </a>
      )}
    </div>
  )
}
