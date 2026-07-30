'use client'

import { motion } from 'framer-motion'
import { Shield, Flame, Check } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

export function GaiaScarcity() {
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
            Scarcity by Design
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A fixed supply token with programmed deflation mechanics built into the ecosystem.
          </p>
        </motion.div>

        {/* Grid 2 columns */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
          {/* Fixed Supply */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-8 lg:p-12 text-center hover:shadow-lg transition-shadow overflow-hidden"
          >
            <Shield className="w-12 h-12 mx-auto mb-6 text-muted-foreground" />
            <p className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              1,000,000,000
            </p>
            <p className="text-lg font-medium text-muted-foreground mt-2">
              GAIA Total Supply
            </p>
            <div className="w-16 h-0.5 bg-border mx-auto my-6" />
            <p className="text-base text-muted-foreground">
              Fixed supply.
              <br />
              No additional minting. Ever.
            </p>
          </motion.div>

          {/* Programmed Burn */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card border border-border rounded-2xl p-8 lg:p-12 text-center hover:shadow-lg transition-shadow overflow-hidden"
          >
            <Flame className="w-12 h-12 mx-auto mb-6 text-orange-500" />
            <p className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight gradient-text">
              50%
            </p>
            <p className="text-base text-muted-foreground mt-4 max-w-xs mx-auto">
              GAIA collected from subscriptions is permanently burned
            </p>

            <div className="w-16 h-0.5 bg-border mx-auto my-6" />

            <div className="space-y-4 text-left max-w-sm mx-auto">
              {[
                { icon: Flame, text: 'Supply decreases with adoption', color: 'text-orange-500' },
                { icon: Check, text: 'Transparent on-chain execution', color: 'text-green-500' },
                { icon: Check, text: 'Every burn is verifiable', color: 'text-green-500' },
              ].map((point, index) => (
                <motion.div
                  key={point.text}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <point.icon className={`w-4 h-4 ${point.color}`} />
                  </div>
                  <span className="text-sm">{point.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Highlight Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            &ldquo;The more the platform grows,
            <br />
            the scarcer GAIA becomes.&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  )
}