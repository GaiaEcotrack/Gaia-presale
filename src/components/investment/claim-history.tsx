'use client'

// Claim history table. POST-REMEDIATION: data comes EXCLUSIVELY from the
// backend (PostgreSQL). When the backend is unreachable the component shows
// an explicit SYNC PENDING state — it never renders locally-stored financial
// data because none is ever stored locally.

import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import {
  getClaimHistory,
  type ClaimHistoryResult,
} from '@/lib/api/gaia-backend'
import { formatDateLocal, formatDateTimeUtc, formatDecimalString, shortenTxId } from '@/lib/format'
import { getSolscanTxUrl } from '@/lib/solana/explorer'

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
        if (!cancelled) {
          setResult({ records: [], source: 'sync-pending', authoritative: false })
          setLoading(false)
        }
      }
    })
    return () => {
      cancelled = true
    }
  }, [wallet, refreshKey])

  const records = result?.records ?? []
  const syncPending = result?.source === 'sync-pending'

  return (
    <div className="space-y-3">
      {syncPending && (
        <p
          className="rounded-lg bg-muted/60 border border-border px-3 py-2 text-xs text-muted-foreground"
          role="note"
        >
          SYNC PENDING — waiting for backend verification. Claims appear here
          once confirmed on-chain by the server.
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
      ) : records.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No claims recorded yet.
          </p>
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
                    {formatDecimalString(record.amountClaimed)} GAIA
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
