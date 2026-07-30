'use client'

import { motion } from 'framer-motion'
import { Shield, Scale, Lock, Zap, FileCheck } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const LEGAL_PRINCIPLES = [
  {
    icon: Shield,
    title: 'Token Classification',
    description: 'GAIA-E: verified evidence token. GAIA: utility token with service-based staking.',
  },
  {
    icon: Scale,
    title: 'Regulatory Framework',
    description: 'Designed under Colombian Law 2158/2021, Decree 1732/2021 (digital assets sandbox).',
  },
  {
    icon: Lock,
    title: 'Data Privacy',
    description: 'Hybrid architecture: personal data off-chain, financial state on-chain.',
  },
]

const TRUST_SIGNALS = [
  {
    icon: Zap,
    title: 'No Energy Trading',
    description: 'Gaia never buys or sells electricity — only tokenizes evidence already settled by regulated markets.',
  },
  {
    icon: FileCheck,
    title: 'Legal Compliance',
    description: 'KYC/AML design, sandbox application in progress.',
  },
]

export function LegalFoundation() {
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
            Built on Compliance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We operate within the law. We don&apos;t evade it.
          </p>
        </motion.div>

        {/* Legal Principles Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {LEGAL_PRINCIPLES.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <principle.icon className="w-7 h-7" />
              </div>
              <p className="text-base font-bold">{principle.title}</p>
              <p className="text-sm text-muted-foreground mt-2">{principle.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20">
          {TRUST_SIGNALS.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
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
        </div>

        {/* Highlight Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            &ldquo;We operate within the law.
            <br />
            <span className="gradient-text">We don&apos;t evade it.</span>&rdquo;
          </p>
        </motion.div>
      </div>
    </section>
  )
}
