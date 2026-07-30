'use client'

import { motion } from 'framer-motion'
import { Shield, Users, Rocket, Lock, Coins, Zap } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const ALLOCATIONS = [
  {
    icon: Coins,
    percentage: '25%',
    label: 'Ecosystem Treasury',
    vesting: '4-year linear release',
    color: 'text-purple-500',
  },
  {
    icon: Shield,
    percentage: '20%',
    label: 'Team & Founders',
    vesting: '4-year vesting, 12-month cliff',
    color: 'text-muted-foreground',
  },
  {
    icon: Rocket,
    percentage: '20%',
    label: 'Public Presale',
    vesting: '6-month lock, 25% monthly release',
    color: 'text-green-500',
  },
  {
    icon: Lock,
    percentage: '15%',
    label: 'DEX Liquidity',
    vesting: '24-month Streamflow lock',
    color: 'text-blue-500',
  },
  {
    icon: Zap,
    percentage: '10%',
    label: 'Staking Rewards',
    vesting: '5-year programmed emissions',
    color: 'text-amber-500',
  },
  {
    icon: Users,
    percentage: '10%',
    label: 'Seed Investors',
    vesting: '2-year vesting',
    color: 'text-muted-foreground',
  },
]

const TRUST_SIGNALS = [
  {
    icon: Shield,
    title: '12-Month Cliff',
    description: 'No team tokens unlock in the first year.',
  },
  {
    icon: Lock,
    title: 'Liquidity Locked',
    description: '24 months secured through Streamflow.',
  },
  {
    icon: Users,
    title: 'Community Alignment',
    description: 'Long-term vesting aligns the team with ecosystem growth.',
  },
]

export function TokenAllocation() {
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
            Transparent Token Allocation
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every allocation is designed to align long-term incentives with the growth of the ecosystem.
          </p>
        </motion.div>

        {/* Allocation Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {ALLOCATIONS.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <p className="text-3xl font-bold tracking-tight">{item.percentage}</p>
              <p className="text-base font-medium mt-1">{item.label}</p>
              <p className="text-sm text-muted-foreground mt-2">{item.vesting}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust Signals — horizontal band */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20"
        >
          {TRUST_SIGNALS.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-4 p-6 bg-muted/30 border border-border rounded-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <signal.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{signal.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{signal.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Highlight Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            &ldquo;Transparency builds trust.
            <br />
            Trust builds ecosystems.&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  )
}