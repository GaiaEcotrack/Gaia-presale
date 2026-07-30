'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FileText, Scale, BarChart3, Users, ArrowRight } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const DOCUMENT_LINKS = [
  {
    icon: FileText,
    label: 'Whitepaper',
    href: '/whitepaper',
    available: true,
  },
  {
    icon: Scale,
    label: 'Legal Framework',
    href: '#',
    available: false,
  },
  {
    icon: BarChart3,
    label: 'Pilot Results',
    href: '#',
    available: false,
  },
  {
    icon: Users,
    label: 'Team Background',
    href: '/team',
    available: true,
  },
]

export function CtaFinal() {
  const { ref, isInView } = useInView(0.1)

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Join the Energy Revolution
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            GAIA Token Launch: September 2026 | Solana Mainnet
          </p>
        </motion.div>

        {/* Document Links Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-20">
          {DOCUMENT_LINKS.map((link, index) => (
            <motion.div
              key={link.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            >
              {link.available ? (
                <Link
                  href={link.href}
                  className="block bg-card border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <link.icon className="w-7 h-7" />
                  </div>
                  <p className="text-base font-bold">{link.label}</p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
                    <span>View</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-6 text-center opacity-60 cursor-not-allowed">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <link.icon className="w-7 h-7" />
                  </div>
                  <p className="text-base font-bold">{link.label}</p>
                  <p className="text-sm text-muted-foreground mt-2">Coming soon</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Closing Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center py-16 lg:py-20 bg-muted/30 border-y border-border"
        >
          <p className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Gaia Ecotrack is not just a token.
            <br />
            <span className="gradient-text">It&apos;s the infrastructure for a decentralized energy future.</span>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
