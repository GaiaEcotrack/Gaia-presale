'use client'

// Dynamic claim button (manual §9.3.1).
// Disabled state shows the live countdown to the next REAL release; enabled
// state offers the exact fresh claimable amount. Gas-blocked wallets keep it
// disabled with an explanatory tooltip.

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VestingCountdown } from '@/components/investment/vesting-countdown'
import { formatTokenAmount } from '@/lib/format'
import { CLAIM_MESSAGES, SOL_THRESHOLDS } from '@/lib/messages'
import type { VestingRelease } from '@/types/investment'

interface ClaimButtonProps {
  claimable: number
  nextRelease: VestingRelease | null
  fullyClaimed: boolean
  /** Round gate (parity with /claim): claims are only possible after the round ends. */
  roundEnded: boolean
  solBalance: number | null
  /** True while the claim flow is running (checking/signing/processing). */
  claiming: boolean
  onClaim: () => void
}

export function ClaimButton({
  claimable,
  nextRelease,
  fullyClaimed,
  roundEnded,
  solBalance,
  claiming,
  onClaim,
}: ClaimButtonProps) {
  const gasBlocked = solBalance !== null && solBalance < SOL_THRESHOLDS.BLOCK

  if (!roundEnded) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full" size="lg" variant="outline">
          Round not ended yet
        </Button>
      </div>
    )
  }

  if (fullyClaimed) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full" size="lg" variant="outline">
          {CLAIM_MESSAGES.allReleasesCompleted}
        </Button>
        <VestingCountdown target={null} />
      </div>
    )
  }

  if (claimable <= 0) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full gap-2" size="lg">
          {CLAIM_MESSAGES.nextUnlockIn}
        </Button>
        <VestingCountdown compact={false} target={nextRelease?.releaseAt ?? null} />
        {gasBlocked && (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">
            {CLAIM_MESSAGES.insufficientSolTooltip}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={onClaim}
        disabled={claiming || gasBlocked}
        title={
          gasBlocked ? CLAIM_MESSAGES.insufficientSolTooltip : undefined
        }
        aria-disabled={gasBlocked}
        className="w-full gap-2"
        size="lg"
      >
        {claiming ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            {CLAIM_MESSAGES.claiming}
          </>
        ) : (
          <>
            {CLAIM_MESSAGES.claim} {formatTokenAmount(claimable)} GAIA
          </>
        )}
      </Button>
    </div>
  )
}
