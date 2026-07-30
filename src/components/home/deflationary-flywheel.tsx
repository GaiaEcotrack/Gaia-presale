'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  Flame,
  Lock,
  Sun,
  Zap,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  DollarSign,
  ArrowRightLeft,
  Leaf,
  FileCheck,
  Database,
  Link2,
} from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const FLYWHEEL_STEPS_TOP = [
  {
    icon: TrendingUp,
    value: '→',
    title: 'Subscription Growth',
    description: 'GAIA collected from platform subscriptions.',
  },
  {
    icon: Flame,
    value: '50%',
    title: 'Burned',
    description: 'Collected GAIA permanently destroyed.',
  },
  {
    icon: Lock,
    value: '50%',
    title: 'Staking Pool',
    description: 'Remaining GAIA funds active contributors.',
  },
]

const FLYWHEEL_STEPS_BOTTOM = [
  {
    icon: Flame,
    value: '↑',
    title: 'More Burns',
    description: '50% of buybacks permanently destroyed.',
  },
  {
    icon: Zap,
    value: 'Buyback',
    title: 'Buyback & Burn',
    description: 'Revenue used to buy back and burn GAIA.',
  },
  {
    icon: Sun,
    value: '←',
    title: 'Solar Farm Revenue',
    description: 'Treasury invests in proprietary solar infrastructure.',
  },
]

const REVENUE_STREAMS = [
  {
    icon: DollarSign,
    value: '$120–$6,000',
    label: 'Annual Subscriptions',
    description: '20% discount for GAIA payments.',
    color: 'text-green-500',
  },
  {
    icon: ArrowRightLeft,
    value: '1.5%',
    label: 'Transfer Fees',
    description: 'On all GAIA transactions.',
    color: 'text-blue-500',
  },
  {
    icon: Leaf,
    value: '10–15%',
    label: 'Carbon Credits',
    description: 'Fee on aggregated carbon projects.',
    color: 'text-emerald-500',
  },
  {
    icon: FileCheck,
    value: '5–8%',
    label: 'RECs/I-RECs',
    description: 'Fee on certificate conversions.',
    color: 'text-purple-500',
  },
  {
    icon: Database,
    value: 'Monetizing',
    label: 'Data Oracles',
    description: 'Anonymized energy data.',
    color: 'text-amber-500',
  },
  {
    icon: Link2,
    value: '0.25–0.5%',
    label: 'Cross-Chain Bridges',
    description: 'Fee on wraps and unwraps.',
    color: 'text-cyan-500',
  },
  {
    icon: Sun,
    value: '50% Buyback',
    label: 'Solar Farm Revenue',
    description: 'Used for GAIA buybacks & burns.',
    color: 'text-orange-500',
  },
]

export function DeflationaryFlywheel() {
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
            The Deflationary Flywheel
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            How GAIA creates value over time.
          </p>
        </motion.div>

        {/* Flywheel Visual */}
        <div className="max-w-5xl mx-auto mb-20">
          {/* Top Row — Left to Right */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center mb-6">
            {FLYWHEEL_STEPS_TOP.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold tracking-tight">{step.value}</p>
                <p className="text-base font-medium mt-1">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Vertical Connector — Down */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.35 }}
            className="flex justify-center my-4"
          >
            <ArrowDown className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>

          {/* Center Insight — Connection Point */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-muted/30 border border-border rounded-2xl p-6 text-center max-w-md mx-auto mb-4"
          >
            <p className="text-xl font-bold tracking-tight">
              Platform growth = GAIA scarcity = value appreciation
            </p>
          </motion.div>

          {/* Vertical Connector — Up */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="flex justify-center my-4"
          >
            <ArrowUp className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>

          {/* Bottom Row — Right to Left */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {FLYWHEEL_STEPS_BOTTOM.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold tracking-tight">{step.value}</p>
                <p className="text-base font-medium mt-1">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-2">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Revenue Model Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Revenue Model
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sustainability by Design.
          </p>
        </motion.div>

        {/* Revenue Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {REVENUE_STREAMS.map((stream, index) => (
            <motion.div
              key={stream.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <stream.icon className={`w-7 h-7 ${stream.color}`} />
              </div>
              <p className="text-3xl font-bold tracking-tight">{stream.value}</p>
              <p className="text-base font-medium mt-1">{stream.label}</p>
              <p className="text-sm text-muted-foreground mt-2">{stream.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Highlight Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            7 revenue streams.
            <br />
            <span className="gradient-text">1 token. Infinite potential.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
