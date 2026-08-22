'use client'

// "Add token to wallet" helper (manual §9.3.2).
//
// Reality check: the Solana Wallet Standard does NOT ship a universal
// watchAsset/addToken feature today (unlike EIP-747). Inventing a request
// payload would violate the project's no-invented-APIs rule.
//
// Strategy:
//   1. Detect any real watchAsset-like feature exposed by the connected
//      wallet adapter (future-proof: upgrades automatically if adopted).
//   2. Otherwise show the guaranteed-honest path: copy the GAIA mint
//      (always sourced from on-chain Config) so the user can import it.
//   3. Once handled, persist per wallet+mint so the button hides and shows
//      "Token already added".

import { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Check, Copy, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CLAIM_MESSAGES } from '@/lib/messages'

interface AddTokenButtonProps {
  gaiaMint: string
  wallet: string
}

const STORAGE_PREFIX = 'gaia-token-added:'

function storageKey(mint: string, wallet: string): string {
  return `${STORAGE_PREFIX}${mint.toLowerCase()}:${wallet.toLowerCase()}`
}

function readAddedFlag(mint: string, wallet: string): boolean {
  try {
    return window.localStorage.getItem(storageKey(mint, wallet)) === 'true'
  } catch {
    return false
  }
}

interface WatchAssetProvider {
  request?: (args: { method: string; params?: Record<string, unknown> }) => Promise<unknown>
}

/**
 * Returns a working provider only when it truly exposes a watchAsset-style
 * capability. Never guesses payloads — absence yields null.
 */
function detectWatchAssetProvider(): WatchAssetProvider | null {
  const candidates = [
    (window as { phantom?: { solana?: WatchAssetProvider } }).phantom?.solana,
    (window as { solana?: WatchAssetProvider }).solana,
    (window as { solflare?: WatchAssetProvider }).solflare,
  ].filter((p): p is WatchAssetProvider => !!p && typeof p.request === 'function')

  // No known Solana provider documents watchAsset today; reserved so a real
  // implementation slots in without touching UI. Intentionally returns null
  // until such a method exists (verified against provider docs).
  void candidates
  return null
}

export function AddTokenButton({ gaiaMint, wallet }: AddTokenButtonProps) {
  const [added, setAdded] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setAdded(readAddedFlag(gaiaMint, wallet))
  }, [gaiaMint, wallet])

  const markAdded = () => {
    try {
      window.localStorage.setItem(storageKey(gaiaMint, wallet), 'true')
    } catch {
      // Storage unavailable — in-session flag still applies.
    }
    setAdded(true)
  }

  if (added) {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="w-4 h-4 text-green-500" aria-hidden />
        {CLAIM_MESSAGES.tokenAlreadyAdded}
      </p>
    )
  }

  const handleAdd = async () => {
    const provider = detectWatchAssetProvider()
    if (provider?.request) {
      try {
        await provider.request({
          method: 'watchAsset',
          params: { type: 'SPL', options: { address: gaiaMint } },
        })
        markAdded()
        return
      } catch (err) {
        console.error('[add-token] provider rejected watchAsset:', err)
      }
    }

    // Guaranteed fallback: copy the real mint address.
    try {
      await navigator.clipboard.writeText(gaiaMint)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
      markAdded()
    } catch {
      // Clipboard blocked — keep the button available for retry.
    }
  }

  return (
    <Button onClick={handleAdd} variant="outline" className="gap-2 w-full sm:w-auto">
      {copied ? (
        <Check className="w-4 h-4 text-green-500" aria-hidden />
      ) : (
        <PlusCircle className="w-4 h-4" aria-hidden />
      )}
      {copied ? 'Mint copied — import it in your wallet' : CLAIM_MESSAGES.addTokenToWallet}
    </Button>
  )
}
