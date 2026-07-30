'use client'

import { motion } from 'framer-motion'
import { Sun, Factory, Flame, Percent } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const BACKING_CARDS = [
  {
    icon: Sun,
    value: '1 GAIA-E',
    label: '= 1 Verified kWh',
    description: 'Every token represents real energy production verified by IoT devices.',
  },
  {
    icon: Factory,
    value: 'Treasury invests in',
    label: '1 MW Solar Farms',
    description: 'Proprietary solar infrastructure backing token value.',
  },
  {
    icon: Flame,
    value: '50% Buyback',
    label: '× Burn',
    description: 'Half of all buybacks are permanently removed from circulation.',
  },
  {
    icon: Percent,
    value: '20% Discount',
    label: 'When Paying With GAIA',
    description: 'Exclusive discount for GAIA holders on subscriptions.',
  },
]

export function RealWorldBacking() {
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
            Real-World Backing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            GAIA is not backed by promises — it&apos;s backed by photons.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {BACKING_CARDS.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <card.icon className="w-7 h-7" />
              </div>
              <p className="text-xl font-bold">{card.value}</p>
              <p className="text-lg font-semibold mt-1">{card.label}</p>
              <p className="text-sm text-muted-foreground mt-2">{card.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Highlight Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-20 text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            We don&apos;t just tokenize energy.
            <br />
            <span className="gradient-text">We generate it.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}