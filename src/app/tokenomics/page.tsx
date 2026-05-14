'use client'

import { motion } from 'framer-motion'
import { TOKENOMICS, TOKEN_CONFIG } from '@/lib/constants'
import { useInView } from '@/hooks/use-animations'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Clock, Users, Lock, TrendingUp } from 'lucide-react'

const chartData = Object.entries(TOKENOMICS).map(([key, value]) => ({
  name: value.label,
  value: value.percentage,
  color: value.color,
}))

const VESTING_SCHEDULE = [
  { category: 'Presale', tge: '25%', vesting: '6 months linear', total: '100%' },
  { category: 'Team', tge: '0%', vesting: '12 months cliff, 24 months linear', total: '100%' },
  { category: 'Advisors', tge: '0%', vesting: '6 months cliff, 18 months linear', total: '100%' },
  { category: 'Liquidity', tge: '100%', vesting: 'Unlocked at TGE', total: '100%' },
  { category: 'Marketing', tge: '10%', vesting: '24 months linear', total: '100%' },
  { category: 'Development', tge: '0%', vesting: '6 months cliff, 24 months linear', total: '100%' },
]

export default function TokenomicsPage() {
  const { ref, isInView } = useInView(0.1)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Tokenomics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            A sustainable token economy designed for long-term growth and community value.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section ref={ref} className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Supply Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-3xl sm:text-4xl font-bold">1B</p>
              <p className="text-sm text-muted-foreground mt-2">Total Supply</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-3xl sm:text-4xl font-bold">$0.012</p>
              <p className="text-sm text-muted-foreground mt-2">Presale Price</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-3xl sm:text-4xl font-bold">$0.025</p>
              <p className="text-sm text-muted-foreground mt-2">Listing Price</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <p className="text-3xl sm:text-4xl font-bold">18</p>
              <p className="text-sm text-muted-foreground mt-2">Decimals</p>
            </div>
          </motion.div>

          {/* Chart Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="relative h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={160}
                    paddingAngle={3}
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
                  <p className="text-4xl font-bold">1B</p>
                  <p className="text-sm text-muted-foreground">{TOKEN_CONFIG.symbol}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold mb-6">Token Distribution</h2>
              {Object.entries(TOKENOMICS).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: value.color }}
                    />
                    <span className="font-medium">{value.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{value.percentage}%</span>
                    <p className="text-xs text-muted-foreground">
                      {((TOKEN_CONFIG.totalSupply * value.percentage) / 100).toLocaleString()} tokens
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Vesting Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6">Vesting Schedule</h2>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Category</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">TGE Unlock</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Vesting Period</th>
                      <th className="text-left text-sm font-medium text-muted-foreground p-4">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {VESTING_SCHEDULE.map((item, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">{item.category}</td>
                        <td className="p-4">{item.tge}</td>
                        <td className="p-4 text-muted-foreground">{item.vesting}</td>
                        <td className="p-4">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Key Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
          >
            <div className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Fair Vesting</p>
                <p className="text-sm text-muted-foreground">Reasonable lock-up periods for all stakeholders</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Community First</p>
                <p className="text-sm text-muted-foreground">40% allocated to public presale</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Locked Liquidity</p>
                <p className="text-sm text-muted-foreground">Liquidity locked for 2 years</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Deflationary</p>
                <p className="text-sm text-muted-foreground">Buyback and burn mechanism</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
