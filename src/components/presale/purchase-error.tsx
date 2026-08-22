'use client'

// Error state (manual §3.2/§3.3): actionable message only — technical detail
// stays in logs and is never rendered raw.

import Link from 'next/link'
import { motion } from 'framer-motion'
import { HelpCircle, RotateCcw, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PURCHASE_MESSAGES } from '@/lib/messages'

interface PurchaseErrorProps {
  message: string
  onRetry: () => void
}

export function PurchaseError({ message, onRetry }: PurchaseErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6"
      role="alert"
    >
      <div className="flex flex-col items-center gap-2">
        <XCircle className="w-14 h-14 text-red-500" aria-hidden />
        <h3 className="text-xl font-bold">{PURCHASE_MESSAGES.failedTitle}</h3>
      </div>

      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onRetry} className="gap-2 h-12" size="lg">
          <RotateCcw className="w-4 h-4" aria-hidden />
          {PURCHASE_MESSAGES.retry}
        </Button>
        <Button asChild variant="outline" className="gap-2 h-12" size="lg">
          <Link href="/faq">
            <HelpCircle className="w-4 h-4" aria-hidden />
            Help
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
