'use client'

// Reusable on-chain transaction row: shortened id + copy + Solscan link.

import { useState } from 'react'
import { Check, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { shortenTxId } from '@/lib/format'
import {
  getSolanaExplorerTxUrl,
  getSolscanTxUrl,
} from '@/lib/solana/explorer'
import { PURCHASE_MESSAGES } from '@/lib/messages'

interface TxRowProps {
  txId: string
  /** Show the fallback explorer link next to Solscan. */
  showFallback?: boolean
}

export function TxRow({ txId, showFallback = false }: TxRowProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(txId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable — user can still select the text.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded bg-muted px-2 py-1 font-mono text-xs break-all">
        {shortenTxId(txId)}
      </code>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? PURCHASE_MESSAGES.copied : PURCHASE_MESSAGES.copy}
        className="h-7 px-2 gap-1"
      >
        {copied ? (
          <Check className="w-3 h-3" />
        ) : (
          <Copy className="w-3 h-3" />
        )}
        <span className="text-xs">
          {copied ? PURCHASE_MESSAGES.copied : PURCHASE_MESSAGES.copy}
        </span>
      </Button>
      <a
        href={getSolscanTxUrl(txId)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
      >
        {PURCHASE_MESSAGES.viewOnSolscan}
        <ExternalLink className="w-3 h-3" />
      </a>
      {showFallback && (
        <a
          href={getSolanaExplorerTxUrl(txId)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Solana Explorer
        </a>
      )}
    </div>
  )
}
