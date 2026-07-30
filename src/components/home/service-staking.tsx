'use client'

import { motion } from 'framer-motion'
import { Activity, ShieldCheck, Eye, Lock } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const STAKING_ROLES = [
  {
    icon: Activity,
    title: 'Oracle Operators',
    description: 'Validate and report real-world energy production data from IoT devices.',
  },
  {
    icon: ShieldCheck,
    title: 'Network Validators',
    description: 'Secure the network and verify all energy tokenization transactions.',
  },
  {
    icon: Eye,
    title: 'Curators',
    description: 'Curate and quality-check energy data submissions across the network.',
  },
  {
    icon: Lock,
    title: 'Guardians',
    description: 'Oversee protocol integrity and participate in community governance.',
  },
]

const TRANSFER_FEES = [
  {
    icon: Activity,
    fee: '0.75%',
    allocation: '→ Treasury',
    description: 'Funds infrastructure development and ecosystem growth initiatives.',
  },
  {
    icon: Lock,
    fee: '0.75%',
    allocation: '→ Staking Pool',
    description: 'Rewards active service providers who secure and maintain the network.',
  },
]

export function ServiceStaking() {
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
            Service-based Staking
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Not passive yield. This is active participation.
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
            We reward work, not idle capital.
          </p>
        </motion.div>

        {/* Role Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
          {STAKING_ROLES.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <role.icon className="w-7 h-7" />
              </div>
              <p className="text-base font-bold">{role.title}</p>
              <p className="text-sm text-muted-foreground mt-2">{role.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Transfer Fee Breakdown */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20">
          {TRANSFER_FEES.map((fee, index) => (
            <motion.div
              key={fee.allocation}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="flex items-start gap-4 p-6 bg-muted/30 border border-border rounded-2xl"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <fee.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {fee.fee} {fee.allocation}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{fee.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlight Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            &ldquo;Service-based staking.
            <br />
            <span className="gradient-text">Not speculation. Not securities risk.</span>&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  )
}
