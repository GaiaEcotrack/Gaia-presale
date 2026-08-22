'use client'

// Pending state (manual §3.4): shown after 60s without confirmation.
// NEVER presented as an error — the network is still processing.

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Clock8 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TxRow } from '@/components/presale/tx-row'
import { PURCHASE_MESSAGES } from '@/lib/messages'

interface PurchasePendingProps {
  txId: string
}

export function PurchasePending({ txId }: PurchasePendingProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6"
      role="status"
    >
      <div className="flex flex-col items-center gap-2">
        <Clock8 className="w-14 h-14 text-yellow-500 animate-pulse" aria-hidden />
        <h3 className="text-xl font-bold">{PURCHASE_MESSAGES.pendingTitle}</h3>
      </div>

      <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-left">
        <div className="space-y-1 text-sm">
          <span className="block text-muted-foreground">TX ID</span>
          <TxRow txId={txId} showFallback />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {PURCHASE_MESSAGES.pendingBody}
      </p>

      <Button asChild variant="outline" className="w-full h-12 gap-2" size="lg">
        <Link href="/dashboard/investment">
          {PURCHASE_MESSAGES.goToDashboard}
          <ArrowRight className="w-4 h-4" aria-hidden />
        </Link>
      </Button>
    </motion.div>
  )
}
