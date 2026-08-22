'use client'

// Vesting timeline: renders the release milestones derived from live
// on-chain round data (dates/percentages are never hardcoded).

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock8 } from 'lucide-react'
import { formatDateLocal } from '@/lib/format'
import type { VestingRelease } from '@/types/investment'

interface VestingTimelineProps {
  releases: VestingRelease[]
  /** ISO timestamp marking "now" for done/upcoming classification. */
  nowIso?: string
}

export function VestingTimeline({ releases, nowIso }: VestingTimelineProps) {
  const now = nowIso ?? new Date().toISOString()

  if (releases.length === 0) return null

  return (
    <ol className="relative space-y-3">
      {releases.map((release, index) => {
        const isDone = release.releaseAt <= now
        return (
          <motion.li
            key={`${release.releaseAt}-${index}`}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className="flex items-start gap-3"
          >
            {isDone ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500 shrink-0" aria-hidden />
            ) : (
              <Circle className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">
                {release.percentage}% unlocked
                {isDone && (
                  <span className="ml-2 inline-flex items-center text-xs text-muted-foreground">
                    <Clock8 className="w-3 h-3 mr-1" aria-hidden />
                    reached
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateLocal(release.releaseAt)}
              </p>
            </div>
          </motion.li>
        )
      })}
    </ol>
  )
}
