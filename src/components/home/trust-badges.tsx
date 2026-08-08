'use client'

import { motion } from 'framer-motion'
import { UserCheck, FileCheck, Leaf, CheckCircle } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const BADGES = [
  { icon: UserCheck, label: 'Verified Team', description: 'Transparent leadership with public profiles' },
  { icon: FileCheck, label: 'Built on Solana', description: 'High-speed, low-cost blockchain' },
  { icon: Leaf, label: 'Renewable Energy', description: 'Real projects verified by IoT' },
]

export function TrustBadges() {
  const { ref, isInView } = useInView(0.2)

  return (
    <section ref={ref} className="py-16 bg-muted/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Trusted & Verified
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {BADGES.map((badge, index) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-background border border-border flex items-center justify-center mb-3 shadow-sm">
                <badge.icon className="w-6 h-6" />
              </div>
              <p className="font-medium text-sm">{badge.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Wallet Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <p className="text-center text-sm text-muted-foreground mb-4">
            Supported Wallets
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['Phantom', 'Solflare', 'Backpack'].map((wallet) => (
              <div key={wallet} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {wallet}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
