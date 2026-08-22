'use client'

// Claim history table (manual §9.4.1). Source priority (correction #1):
// backend → on-chain (future) → local-provisional, and the provisional source
// is ALWAYS labeled as such — never presented as the full authoritative list.

import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import {
  getClaimHistory,
  isBackendConfigured,
  type ClaimHistoryResult,
} from '@/lib/api/gaia-backend'
import { formatDateLocal, formatDateTimeUtc, formatTokenAmount, shortenTxId } from '@/lib/format'
import { getSolscanTxUrl } from '@/lib/solana/explorer'
import { CLAIM_MESSAGES } from '@/lib/messages'

interface ClaimHistoryProps {
  wallet: string | null
  /** Bump to reload (e.g. right after a successful claim). */
  refreshKey?: number
}

export function ClaimHistory({ wallet, refreshKey = 0 }: ClaimHistoryProps) {
  const [result, setResult] = useState<ClaimHistoryResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    queueMicrotask(async () => {
      if (!wallet) {
        if (!cancelled) {
          setResult(null)
          setLoading(false)
        }
        return
      }
      if (!cancelled) setLoading(true)
      try {
        const res = await getClaimHistory(wallet)
        if (!cancelled) {
          setResult(res)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [wallet, refreshKey])

  const records = result?.records ?? []
  const provisional = result?.source === 'local-provisional'

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Claim history</h3>

      {provisional && records.length > 0 && (
        <p
          className="rounded-lg bg-muted/60 border border-border px-3 py-2 text-xs text-muted-foreground"
          role="note"
        >
          {CLAIM_MESSAGES.historyProvisionalNote}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
      ) : records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No claims recorded yet.
          </p>
          {!isBackendConfigured() && (
            <p className="text-xs text-muted-foreground mt-1 opacity-80">
              Historical sync will activate once the backend service is live.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium text-right">Amount</th>
                <th className="px-4 py-2.5 font-medium">TX ID</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.claimTxId} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <span className="block">{formatDateLocal(record.timestamp)}</span>
                    <span className="block text-xs text-muted-foreground font-mono">
                      UTC: {formatDateTimeUtc(record.timestamp)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                    {formatTokenAmount(record.amountClaimed)} GAIA
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {shortenTxId(record.claimTxId)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={getSolscanTxUrl(record.claimTxId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-500 hover:underline"
                      aria-label={`View claim transaction ${shortenTxId(record.claimTxId)} on Solscan`}
                    >
                      View
                      <ExternalLink className="w-3 h-3" aria-hidden />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
