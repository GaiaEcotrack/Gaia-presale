'use client'

// Success confirmation (manual §3.1 — all mandatory elements):
// check header, acquired GAIA, paid amount, LOCAL date/time + UTC line,
// TX id with copy + Solscan, vesting schedule derived from on-chain data,
// and the dashboard CTA.

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TxRow } from '@/components/presale/tx-row'
import {
  formatDateLocal,
  formatDateTimeUtc,
  formatDecimalString,
} from '@/lib/format'
import { PURCHASE_MESSAGES, VESTING_MESSAGES } from '@/lib/messages'
import type { PurchaseSnapshot, VestingSchedule } from '@/types/investment'

interface PurchaseSuccessProps {
  snapshot: PurchaseSnapshot & { txId: string }
  schedule: VestingSchedule | null
}

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th']

function ordinal(index: number): string {
  return ORDINALS[index] ?? `${index + 1}th`
}

export function PurchaseSuccess({ snapshot, schedule }: PurchaseSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
      role="status"
    >
      <div className="flex flex-col items-center gap-2">
        <CheckCircle2 className="w-14 h-14 text-green-500" aria-hidden />
        <h3 className="text-2xl font-bold">{PURCHASE_MESSAGES.successTitle}</h3>
      </div>

      <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-left">
        <p className="text-lg font-semibold text-center">
          You have acquired{' '}
          <span className="text-primary">
            {formatDecimalString(snapshot.amountGaia)} GAIA
          </span>
        </p>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Paid</span>
          <span className="font-medium">
            {formatDecimalString(snapshot.paidAmount)} {snapshot.currency}
          </span>
        </div>

        <div className="space-y-1 text-sm">
          <span className="block text-muted-foreground">Date/Time</span>
          <span className="block font-medium">
            {formatDateLocal(snapshot.sentAt)}
          </span>
          <span className="block text-xs text-muted-foreground font-mono">
            UTC: {formatDateTimeUtc(snapshot.sentAt)}
          </span>
        </div>

        <div className="space-y-1 text-sm">
          <span className="block text-muted-foreground">Transaction</span>
          <TxRow txId={snapshot.txId} showFallback />
        </div>
      </div>

      {/* Vesting schedule — always derived from live on-chain round data */}
      {schedule && (
        <div className="border border-border rounded-xl p-4 space-y-3 text-left">
          <p className="font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4" aria-hidden />
            {VESTING_MESSAGES.vestingActive}
          </p>
          <ul className="space-y-1.5 text-sm">
            <li className="flex justify-between gap-2">
              <span className="text-muted-foreground">Full lock (6 months)</span>
              <span className="font-medium">
                {formatDateLocal(schedule.cliffEndsAt)}
              </span>
            </li>
            {schedule.releases.map((release, index) => (
              <li
                key={`${index}-${release.releaseAt}`}
                className="flex justify-between gap-2"
              >
                <span className="text-muted-foreground">
                  {ordinal(index)} unlock ({release.percentage}%)
                </span>
                <span className="font-medium">
                  {formatDateLocal(release.releaseAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button asChild className="w-full h-12 gap-2" size="lg">
        <Link href="/dashboard/investment">
          {PURCHASE_MESSAGES.goToDashboard}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </Button>
    </motion.div>
  )
}
