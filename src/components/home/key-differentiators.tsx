'use client'

import { motion } from 'framer-motion'
import { useInView } from '@/hooks/use-animations'

const COMPARISONS = [
  {
    feature: 'Blockchain',
    gaia: 'Solana ($0.0005/tx, sub-second finality)',
    others: 'Legacy chains (high fees)',
  },
  {
    feature: 'Token Type',
    gaia: 'SPL Token-2022 (Transfer Fee Extension)',
    others: 'Standard tokens',
  },
  {
    feature: 'Staking',
    gaia: 'Service-based (work rewarded)',
    others: 'Capital-based (security risk)',
  },
  {
    feature: 'Real Backing',
    gaia: 'Solar farms + GAIA-E (1:1 energy)',
    others: 'Pure speculation',
  },
  {
    feature: 'Legal Foundation',
    gaia: 'Colombian framework + international standards',
    others: 'Often unclear',
  },
  {
    feature: 'Deflation',
    gaia: 'Programmed burn + revenue buybacks',
    others: 'None or limited',
  },
  {
    feature: 'Vesting',
    gaia: '4-year cliff + 12-month lock',
    others: 'Often shorter',
  },
]

export function KeyDifferentiators() {
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
            Key Differentiators
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            What sets Gaia Ecotrack apart.
          </p>
        </motion.div>

        {/* Mobile: Stacked Cards */}
        <div className="sm:hidden space-y-4 max-w-3xl mx-auto mb-20">
          {COMPARISONS.map((row, index) => (
            <motion.div
              key={row.feature}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <p className="text-sm font-semibold text-muted-foreground mb-3">{row.feature}</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-green-600 dark:text-green-400 mt-0.5">Gaia</span>
                  <span className="text-sm">{row.gaia}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-muted-foreground mt-0.5">Others</span>
                  <span className="text-sm text-muted-foreground">{row.others}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: Table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden sm:block bg-card border border-border rounded-2xl overflow-hidden max-w-5xl mx-auto mb-20"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Feature</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Gaia Ecotrack</th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Others</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISONS.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4">{row.gaia}</td>
                    <td className="p-4 text-muted-foreground">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Highlight Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Built different.
            <br />
            <span className="gradient-text">Built to last.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
