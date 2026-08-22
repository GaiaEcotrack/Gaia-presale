'use client'

// Streamflow panel (manual §5.3/§5.4). No Streamflow integration exists yet:
// when no real vault is configured we show the honest fallback — an
// explanation plus the on-chain program vault. URLs are never invented.

import { ExternalLink, ShieldCheck } from 'lucide-react'
import { getSolscanAddressUrl } from '@/lib/solana/explorer'
import { shortenAddress } from '@/lib/format'
import { VESTING_MESSAGES } from '@/lib/messages'

interface StreamflowPanelProps {
  /** Real Streamflow vault address when one exists for this purchase. */
  vaultAddress?: string | null
  /** On-chain GAIA vault PDA of the presale program. */
  programGaiaVault?: string | null
}

export function StreamflowPanel({
  vaultAddress,
  programGaiaVault,
}: StreamflowPanelProps) {
  if (vaultAddress) {
    return (
      <a
        href={`https://app.streamflow.finance/vesting/${vaultAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline"
      >
        View on Streamflow ({shortenAddress(vaultAddress)})
        <ExternalLink className="w-3 h-3" aria-hidden />
      </a>
    )
  }

  return (
    <div className="space-y-2 text-sm">
      <p className="flex items-start gap-2 text-muted-foreground">
        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-green-600" aria-hidden />
        {VESTING_MESSAGES.streamflowManagedOnChain}
      </p>
      {programGaiaVault && (
        <a
          href={getSolscanAddressUrl(programGaiaVault)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-mono text-blue-500 hover:underline"
        >
          Program vault: {shortenAddress(programGaiaVault)}
          <ExternalLink className="w-3 h-3" aria-hidden />
        </a>
      )}
    </div>
  )
}
