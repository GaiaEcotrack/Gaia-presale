'use client'

import { motion } from 'framer-motion'
import { Coins, Lock } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const FEE_BREAKDOWN = [
  {
    icon: Coins,
    fee: '0.75%',
    allocation: '→ Treasury',
    description: 'Operations, expansion, and development.',
  },
  {
    icon: Lock,
    fee: '0.75%',
    allocation: '→ Staking Pool',
    description: 'Rewards for active contributors.',
  },
]

export function TransferFee() {
  const { ref, isInView } = useInView(0.1)

  return (
    <section ref={ref} className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Transfer Fee
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            1.5% fee on every GAIA transfer.
          </p>
        </motion.div>

        {/* Fee Breakdown */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-12">
          {FEE_BREAKDOWN.map((fee, index) => (
            <motion.div
              key={fee.allocation}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="flex items-start gap-4 p-6 bg-muted/30 border border-border rounded-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <fee.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {fee.fee} {fee.allocation}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{fee.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-3xl mx-auto text-center mb-20"
        >
          <p className="text-lg text-muted-foreground">
            Built at the token level via Solana&apos;s SPL Token-2022 extension — automatic, transparent, unavoidable.
          </p>
        </motion.div>

        {/* Highlight Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            &ldquo;Every transaction
            <br />
            <span className="gradient-text">strengthens the ecosystem.&rdquo;</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
