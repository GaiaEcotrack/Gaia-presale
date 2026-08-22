'use client'

// Investment summary (manual §6.2): totals, first purchase date and per-
// purchase TX links. TX links use REAL signatures only — purchases made in
// another device show a provisional placeholder until backend sync exists.

import { ExternalLink } from 'lucide-react'
import {
  formatDateLocal,
  formatTokenAmount,
  formatUsdAmount,
} from '@/lib/format'
import { TxRow } from '@/components/presale/tx-row'
import { getSolscanAddressUrl } from '@/lib/solana/explorer'
import { VESTING_MESSAGES } from '@/lib/messages'
import { getLocalPurchaseTxs } from '@/lib/api/gaia-backend'
import type { Config } from '@/lib/anchor/config'
import type { NormalizedInvestment } from '@/lib/vesting/adapter'
import type { VestingState } from '@/types/investment'

interface InvestmentSummaryProps {
  investments: NormalizedInvestment[]
  aggregate: VestingState | null
  config: Config | null
}

export function InvestmentSummary({
  investments,
  aggregate,
  config,
}: InvestmentSummaryProps) {
  if (!aggregate || investments.length === 0) return null

  const localTxs = getLocalPurchaseTxs(investments[0]?.purchase.wallet.toBase58() ?? '')

  const paidByCurrency = new Map<string, number>()
  for (const inv of investments) {
    if (!config) break
    const mint = inv.purchase.payment_mint.toBase58()
    const symbol =
      mint === config.usdc_mint.toBase58()
        ? 'USDC'
        : mint === config.usdt_mint.toBase58()
          ? 'USDT'
          : null
    if (!symbol) continue
    paidByCurrency.set(
      symbol,
      (paidByCurrency.get(symbol) ?? 0) + Number(inv.purchase.payment_amount) / 1e6,
    )
  }

  const firstPurchaseAt = investments
    .map((inv) => Number(inv.purchase.timestamp) * 1000)
    .reduce((min, t) => Math.min(min, t), Number.POSITIVE_INFINITY)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            {formatTokenAmount(aggregate.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Total GAIA acquired</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-xl sm:text-2xl font-bold tabular-nums">
            {[...paidByCurrency.entries()].map(([symbol, amount], i) => (
              <span key={symbol}>
                {i > 0 && ' · '}
                {formatUsdAmount(amount)} {symbol}
              </span>
            ))}
            {paidByCurrency.size === 0 && '—'}
          </p>
          <p className="text-xs text-muted-foreground">Total paid</p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-sm sm:text-base font-medium pt-1">
            {Number.isFinite(firstPurchaseAt)
              ? formatDateLocal(new Date(firstPurchaseAt))
              : '—'}
          </p>
          <p className="text-xs text-muted-foreground">First purchase</p>
        </div>
      </div>

      {/* Per-purchase rows */}
      <div className="space-y-2">
        {investments.map((inv) => {
          const purchaseNumber = Number(inv.purchase.purchase_number)
          const localTx = localTxs[String(purchaseNumber)]
          return (
            <div
              key={`${inv.purchase.round_id}-${purchaseNumber}`}
              className="border border-border rounded-lg p-3 flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium text-sm">
                  {inv.round.name || `Round #${inv.round.id}`}
                  <span className="ml-2 text-xs text-muted-foreground">
                    Purchase #{purchaseNumber}
                  </span>
                </p>
                <p className="text-sm tabular-nums">
                  {formatTokenAmount(inv.state.totalAmount)} GAIA
                </p>
              </div>
              {localTx ? (
                <TxRow txId={localTx.txId} />
              ) : (
                <p className="text-xs text-muted-foreground" title="Transaction links sync once the backend service is live. Verify all purchases in the explorer below.">
                  TX link not recorded on this device — check the program explorer.
                </p>
              )}
            </div>
          )
        })}
      </div>

      {config && (
        <a
          href={getSolscanAddressUrl(config.gaia_mint.toBase58())}
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
