'use client'

import { motion } from 'framer-motion'
import { useInView } from '@/hooks/use-animations'
import { ArrowRight } from 'lucide-react'

const CYCLE_STEPS = [
  { step: 1, label: 'Investment', description: 'Presale funds → 1MW+ solar farms' },
  { step: 2, label: 'Generation', description: 'Clean energy → Grid sales (USD/COP)' },
  { step: 3, label: 'Buyback', description: 'Revenue → GAIA purchase on open market' },
  { step: 4, label: 'Burn & Reinvestment', description: '50% burn + 50% staking' },
]

const IMPACT_DATA = [
  { label: 'Farm Investment', value: '$500,000 USD' },
  { label: 'First Farm Capacity', value: '1 MW' },
  { label: 'Annual Energy Revenue', value: '$125,000 USD' },
  { label: 'GAIA Purchased Annually', value: '~5,000,000' },
  { label: 'GAIA Burned Annually', value: '~2,500,000' },
  { label: 'Emissions Reduction', value: '~1,500 tCOe/year' },
]

export function SolarFarmsSection() {
  const { ref, isInView } = useInView(0.1)

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
            Virtuous Circle
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            The GAIA Virtuous Circle
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From Investment to Impact: how presale funds solar farms
            that generate revenue to buy back and burn tokens, creating sustainable value.
          </p>
        </motion.div>

        {/* Cycle Diagram */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
          {CYCLE_STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="relative group"
            >
              <div className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl font-bold">{step.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{step.label}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {/* Arrow between steps (desktop) */}
              {i < CYCLE_STEPS.length - 1 && (
                <div className="hidden lg:flex absolute top-1/2 -right-3 z-10 items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.15 }}
                  >
                    <ArrowRight className="w-5 h-5 text-muted-foreground/40" />
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Impact Data */}
        <div className="max-w-4xl mx-auto">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-2xl font-bold text-center mb-8"
          >
            Projected Impact
          </motion.h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IMPACT_DATA.map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.08 }}
                className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-muted/50 transition-colors duration-300"
              >
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="font-bold text-sm">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
