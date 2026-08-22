'use client'

// Vesting progress bar (manual §9.2.2): Locked (gray) / Claimable (green) /
// Claimed (blue). Percentages come from REAL on-chain amounts via the vesting
// adapter — never from dates alone.

import { formatTokenAmount } from '@/lib/format'
import { VESTING_MESSAGES } from '@/lib/messages'
import type { VestingState } from '@/types/investment'

interface VestingProgressProps {
  state: VestingState
}

export function VestingProgress({ state }: VestingProgressProps) {
  const total = state.totalAmount
  const pctOf = (value: number): number =>
    total > 0 ? Math.min((value / total) * 100, 100) : 0

  const claimedPct = pctOf(state.claimedAmount)
  const claimablePct = pctOf(state.claimableAmount)
  const lockedPct = Math.max(100 - claimedPct - claimablePct, 0)

  const legend = [
    { label: VESTING_MESSAGES.locked, pct: lockedPct, amount: state.lockedAmount, dotClass: 'bg-muted-foreground/40' },
    { label: VESTING_MESSAGES.claimable, pct: claimablePct, amount: state.claimableAmount, dotClass: 'bg-green-500' },
    { label: VESTING_MESSAGES.claimed, pct: claimedPct, amount: state.claimedAmount, dotClass: 'bg-blue-500' },
  ]

  return (
    <div className="space-y-3">
      <div
        className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`Locked ${lockedPct.toFixed(0)}%, Claimable ${claimablePct.toFixed(0)}%, Claimed ${claimedPct.toFixed(0)}%`}
      >
        <div className="h-full bg-muted-foreground/40 transition-all" style={{ width: `${lockedPct}%` }} />
        <div className="h-full bg-green-500 transition-all" style={{ width: `${claimablePct}%` }} />
        <div className="h-full bg-blue-500 transition-all" style={{ width: `${claimedPct}%` }} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.dotClass}`} aria-hidden />
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-medium ml-auto tabular-nums">
              {item.pct.toFixed(0)}%
              <span className="block text-xs text-muted-foreground font-normal">
                {formatTokenAmount(item.amount)} GAIA
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
