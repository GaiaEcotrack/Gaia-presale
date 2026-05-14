'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Wallet, CreditCard, Link2, Coins, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInView } from '@/hooks/use-animations'

const STEPS = [
  {
    icon: Wallet,
    step: '01',
    title: 'Create Wallet',
    description: 'Download MetaMask or your preferred Web3 wallet and create a new wallet.',
  },
  {
    icon: CreditCard,
    step: '02',
    title: 'Fund Wallet',
    description: 'Purchase ETH from an exchange and transfer it to your wallet address.',
  },
  {
    icon: Link2,
    step: '03',
    title: 'Connect Wallet',
    description: 'Connect your wallet to our platform using the "Connect Wallet" button.',
  },
  {
    icon: Coins,
    step: '04',
    title: 'Buy Tokens',
    description: 'Enter the amount of ETH you want to invest and confirm the transaction.',
  },
  {
    icon: Gift,
    step: '05',
    title: 'Claim Tokens',
    description: 'After the presale ends, claim your tokens using our claim portal.',
  },
]

export function HowToBuyPreview() {
  const { ref, isInView } = useInView(0.1)

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How To Buy</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in just a few simple steps.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="bg-card border border-border rounded-2xl p-6 h-full hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-muted-foreground/20 mb-4">
                  {step.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>

              {/* Arrow between steps */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/how-to-buy">
            <Button variant="outline" className="gap-2">
              Detailed Guide
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
