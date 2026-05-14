'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TOKENOMICS, TOKEN_CONFIG, GAIA_FEATURES } from '@/lib/constants'
import { useInView } from '@/hooks/use-animations'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const chartData = Object.entries(TOKENOMICS).map(([key, value]) => ({
  name: value.label,
  value: value.percentage,
  color: value.color,
}))

export function TokenomicsPreview() {
  const { ref, isInView } = useInView(0.1)

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Tokenomics</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            GAIA token distribution designed for sustainable growth and community value.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[350px] sm:h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={140}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{payload[0].name}</p>
                          <p className="text-sm text-muted-foreground">{payload[0].value}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold">1B</p>
                <p className="text-sm text-muted-foreground">Total Supply</p>
              </div>
            </div>
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            {Object.entries(TOKENOMICS).map(([key, value], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: value.color }}
                  />
                  <span className="font-medium">{value.label}</span>
                </div>
                <span className="text-lg font-bold">{value.percentage}%</span>
              </motion.div>
            ))}

            <Link href="/tokenomics" className="block mt-6">
              <Button variant="outline" className="w-full gap-2">
                View Full Tokenomics
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        >
          {[
            { label: 'Total Supply', value: '1,000,000,000' },
            { label: 'Presale Price', value: '$0.012' },
            { label: 'Listing Price', value: '$0.025' },
            { label: 'Vesting Period', value: '6 Months' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-4">
              <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
