'use client'

// Gas fee banner (manual §9.4.2): subtle warning below 0.01 SOL, prominent
// blocking alert below 0.005 SOL. Hidden when balance is unknown.

import { AlertTriangle, TriangleAlert } from 'lucide-react'
import { formatSolAmount } from '@/lib/format'
import { CLAIM_MESSAGES, SOL_THRESHOLDS } from '@/lib/messages'

interface GasWarningProps {
  solBalance: number | null
}

export function GasWarning({ solBalance }: GasWarningProps) {
  if (solBalance === null) return null

  if (solBalance < SOL_THRESHOLDS.BLOCK) {
    return (
      <div
        className="flex items-start gap-2 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-3 py-2 text-sm text-red-700 dark:text-red-400"
        role="alert"
      >
        <TriangleAlert className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
        <span>
          {CLAIM_MESSAGES.gasBlocked}{' '}
          <span className="opacity-80">
            ({formatSolAmount(solBalance)} SOL available)
          </span>
        </span>
      </div>
    )
  }

  if (solBalance < SOL_THRESHOLDS.WARN) {
    return (
      <div
        className="flex items-start gap-2 rounded-lg border border-yellow-300 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/40 px-3 py-2 text-xs text-yellow-800 dark:text-yellow-400"
        role="status"
      >
        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden />
        <span>{CLAIM_MESSAGES.gasWarning}</span>
      </div>
    )
  }

  return null
}
