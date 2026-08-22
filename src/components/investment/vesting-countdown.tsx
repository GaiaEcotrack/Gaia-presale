'use client'

// Vesting countdown (manual §9.2.1): local 1s tick against the REAL next
// release timestamp. No API polling — external data refreshes are handled by
// the dashboard's 30s cycle.

import { Clock8 } from 'lucide-react'
import { useCountdown } from '@/hooks/use-countdown'
import { CLAIM_MESSAGES } from '@/lib/messages'

interface VestingCountdownProps {
  /** ISO timestamp of the next release; null when nothing is pending. */
  target: string | null
  compact?: boolean
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function VestingCountdown({ target, compact = false }: VestingCountdownProps) {
  const time = useCountdown(target ?? new Date(0).toISOString())

  if (!target || time.total <= 0) {
    return (
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <Clock8 className="w-4 h-4" aria-hidden />
        {CLAIM_MESSAGES.allReleasesCompleted}
      </p>
    )
  }

  const units = [
    { value: time.days, label: 'Days' },
    { value: time.hours, label: 'Hours' },
    { value: time.minutes, label: 'Min' },
    { value: time.seconds, label: 'Sec' },
  ]

  if (compact) {
    return (
      <span className="font-mono tabular-nums text-sm" role="timer" aria-live="off">
        {time.days}d {pad(time.hours)}h {pad(time.minutes)}m {pad(time.seconds)}s
      </span>
    )
  }

  return (
    <div
      className="flex gap-2 sm:gap-3"
      role="timer"
      aria-label={`Next unlock in ${time.days} days ${time.hours} hours ${time.minutes} minutes ${time.seconds} seconds`}
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          className="flex-1 min-w-[64px] bg-muted/50 rounded-lg px-3 py-2 text-center"
        >
          <p className="text-xl sm:text-2xl font-bold tabular-nums leading-none">
            {pad(unit.value)}
          </p>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wide">
            {unit.label}
          </p>
        </div>
      ))}
    </div>
  )
}
