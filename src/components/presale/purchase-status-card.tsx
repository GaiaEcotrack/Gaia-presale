'use client'

// Orchestrates the visual states of a purchase (manual §26):
// signing → processing → confirmed | failed | pending.
// Rendered in place of the form while a flow is active.

import { AnimatePresence, motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { PurchaseSuccess } from '@/components/presale/purchase-success'
import { PurchasePending } from '@/components/presale/purchase-pending'
import { PurchaseError } from '@/components/presale/purchase-error'
import {
  PURCHASE_MESSAGES,
} from '@/lib/messages'
import type { PurchaseSnapshot, VestingSchedule } from '@/types/investment'

interface PurchaseStatusCardProps {
  status: 'idle' | 'wallet-disconnected' | 'signing' | 'processing' | 'confirmed' | 'failed' | 'pending'
  txId: string | null
  errorMessage: string | null
  snapshot: PurchaseSnapshot | null
  schedule: VestingSchedule | null
  onRetry: () => void
  onReset: () => void
}

export function PurchaseStatusCard({
  status,
  txId,
  errorMessage,
  snapshot,
  schedule,
  onRetry,
  onReset,
}: PurchaseStatusCardProps) {
  if (status === 'idle' || status === 'wallet-disconnected') return null

  return (
    <AnimatePresence mode="wait">
      {(status === 'signing' || status === 'processing') && (
        <motion.div
          key="in-flight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center gap-3 py-12"
          role="status"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" aria-hidden />
          <p className="font-semibold">
            {status === 'signing'
              ? PURCHASE_MESSAGES.signingTitle
              : PURCHASE_MESSAGES.processingTitle}
          </p>
          <p className="text-sm text-muted-foreground">
            {status === 'signing'
              ? PURCHASE_MESSAGES.signingBody
              : PURCHASE_MESSAGES.processingBody}
          </p>
        </motion.div>
      )}

      {status === 'confirmed' && snapshot?.txId && (
        <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PurchaseSuccess
            snapshot={{ ...snapshot, txId: snapshot.txId }}
            schedule={schedule}
          />
          <button
            type="button"
            onClick={onReset}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            {PURCHASE_MESSAGES.newPurchase}
          </button>
        </motion.div>
      )}

      {status === 'pending' && txId && (
        <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PurchasePending txId={txId} />
        </motion.div>
      )}

      {status === 'failed' && (
        <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <PurchaseError message={errorMessage ?? PURCHASE_MESSAGES.errors.unknown} onRetry={onRetry} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
