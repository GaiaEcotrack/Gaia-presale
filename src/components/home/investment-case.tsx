'use client'

import { motion } from 'framer-motion'
import { Rocket, TrendingUp, Shield, Coins, Flame, Users } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const INVESTMENT_POINTS = [
  {
    icon: Rocket,
    title: 'Real Traction',
    description: '18-month pilot with validated technology. SMA, Huawei, Fronius, SolarEdge compatibility.',
  },
  {
    icon: TrendingUp,
    title: 'Massive Market',
    description: 'Colombia\'s solar capacity grew to 4,580 MW (2026). Global renewable tokenization market: $4.5B (2026), projected $25–35B (2033).',
  },
  {
    icon: Shield,
    title: 'Regulatory Preparation',
    description: 'Legal opinions, KYC/AML design, sandbox application in progress.',
  },
  {
    icon: Coins,
    title: 'Dual-Token Model',
    description: 'Utility (GAIA-E) + Value (GAIA) separates evidence from speculation.',
  },
  {
    icon: Flame,
    title: 'Deflationary Mechanics',
    description: 'Programmed burn + real-world asset backing.',
  },
  {
    icon: Users,
    title: 'Transparent Vesting',
    description: 'No hidden team unlocks. Service-based staking reduces regulatory risk.',
  },
]

export function InvestmentCase() {
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
            The Investment Case
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Why GAIA Matters
          </p>
        </motion.div>

        {/* Concept Declaration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="text-2xl sm:text-3xl font-semibold text-muted-foreground">
            This is not a meme coin. This is infrastructure.
          </p>
        </motion.div>

        {/* Investment Points Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {INVESTMENT_POINTS.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <point.icon className="w-7 h-7" />
              </div>
              <p className="text-base font-bold">{point.title}</p>
              <p className="text-sm text-muted-foreground mt-2">{point.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Highlight Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Not a meme coin.
            <br />
            <span className="gradient-text">Not speculation. Infrastructure.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
