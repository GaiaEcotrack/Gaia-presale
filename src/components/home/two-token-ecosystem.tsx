'use client'

import { motion } from 'framer-motion'
import { Zap, Leaf, Shield, Coins, BarChart3, Gift, Flame } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const GAIA_E_FEATURES = [
  { icon: Zap, text: '1 Verified kWh' },
  { icon: Leaf, text: 'Minted by IoT Oracles' },
  { icon: Flame, text: 'Burned when redeemed' },
  { icon: Shield, text: 'Immutable proof of clean energy' },
]

const GAIA_FEATURES = [
  { icon: Coins, text: 'Ecosystem Value Token' },
  { icon: BarChart3, text: 'Governance' },
  { icon: Gift, text: '20% Subscription Discounts' },
  { icon: Zap, text: 'Service-based Staking' },
  { icon: Flame, text: 'Deflationary Mechanics' },
]

export function TwoTokenEcosystem() {
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
            Two Tokens. One Mission.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            One token represents renewable energy.
            <br className="hidden sm:block" />
            The other powers the entire ecosystem.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* GAIA-E Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Leaf className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">GAIA-E</h3>
            <p className="text-sm text-muted-foreground mb-6">Energy Evidence Token</p>
            <ul className="space-y-3">
              {GAIA_E_FEATURES.map((feature, index) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* GAIA Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Coins className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">GAIA</h3>
            <p className="text-sm text-muted-foreground mb-6">Ecosystem Value Token</p>
            <ul className="space-y-3">
              {GAIA_FEATURES.map((feature, index) => (
                <motion.li
                  key={feature.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <feature.icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-3xl mx-auto text-center"
        >
          <blockquote className="border-l-4 border-foreground pl-6">
            <p className="text-xl sm:text-2xl font-semibold italic text-muted-foreground">
              &ldquo;GAIA is not a promise. It&apos;s a protocol.&rdquo;
            </p>
          </blockquote>
        </motion.div>
      </div>
    </section>
  )
}