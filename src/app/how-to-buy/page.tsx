'use client'

import { motion } from 'framer-motion'
import { Wallet, CreditCard, Link2, Coins, Gift, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TOKEN_CONFIG } from '@/lib/constants'
import { useInView } from '@/hooks/use-animations'

const STEPS = [
  {
    step: '01',
    icon: Wallet,
    title: 'Create a Wallet',
    description: 'Download and install a Web3-compatible wallet. We recommend MetaMask for the best experience.',
    details: [
      'Visit metamask.io and download the extension',
      'Create a new wallet with a strong password',
      'Write down your seed phrase and store it safely',
      'Never share your seed phrase with anyone',
    ],
  },
  {
    step: '02',
    icon: CreditCard,
    title: 'Fund Your Wallet',
    description: 'Purchase ETH from a cryptocurrency exchange and transfer it to your wallet address.',
    details: [
      'Create an account on an exchange (Coinbase, Binance, etc.)',
      'Complete identity verification if required',
      'Purchase ETH using your preferred payment method',
      'Withdraw ETH to your wallet address',
    ],
  },
  {
    step: '03',
    icon: Link2,
    title: 'Connect Your Wallet',
    description: 'Connect your wallet to our presale platform using the "Connect Wallet" button.',
    details: [
      'Click "Connect Wallet" in the top right corner',
      'Select your wallet type (MetaMask, WalletConnect, etc.)',
      'Approve the connection request in your wallet',
      'Ensure you\'re on the Ethereum mainnet',
    ],
  },
  {
    step: '04',
    icon: Coins,
    title: 'Buy Tokens',
    description: 'Enter the amount of ETH you want to invest and confirm the transaction.',
    details: [
      'Enter the ETH amount you wish to invest',
      'Review the token amount you\'ll receive',
      'Add a referral code for bonus tokens (optional)',
      'Click "Buy Tokens" and confirm in your wallet',
    ],
  },
  {
    step: '05',
    icon: Gift,
    title: 'Claim Your Tokens',
    description: 'After the presale ends, claim your tokens through our claim portal.',
    details: [
      'Wait for the presale to conclude',
      'Visit our claim portal after TGE',
      'Connect the wallet used for purchase',
      'Click "Claim Tokens" to receive your GAIA',
    ],
  },
]

export default function HowToBuyPage() {
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
            How To Buy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Follow these simple steps to participate in the {TOKEN_CONFIG.name} token presale.
          </motion.p>
        </div>
      </section>

      {/* Steps */}
      <section ref={ref} className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {STEPS.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Content */}
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-5xl font-bold text-muted-foreground/20">{step.step}</span>
                      <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                        <step.icon className="w-6 h-6" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground mb-6">{step.description}</p>
                    <ul className="space-y-3">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual */}
                  <div className={`bg-muted/50 border border-border rounded-2xl p-8 flex items-center justify-center min-h-[250px] ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="w-20 h-20 rounded-2xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                      <step.icon className="w-10 h-10" />
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                {index < STEPS.length - 1 && (
                  <div className="hidden lg:flex justify-center mt-8">
                    <ArrowRight className="w-6 h-6 text-muted-foreground/30 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="text-center mt-16"
          >
            <Button size="lg" className="gap-2">
              Buy Tokens Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Supported Wallets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
            className="mt-16 bg-card border border-border rounded-2xl p-8"
          >
            <h3 className="text-xl font-semibold text-center mb-6">Supported Wallets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['MetaMask', 'WalletConnect', 'Trust Wallet', 'Coinbase Wallet'].map((wallet) => (
                <div key={wallet} className="flex items-center justify-center gap-2 p-4 bg-muted/50 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="font-medium text-sm">{wallet}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <p className="text-muted-foreground">
              Need help?{' '}
              <a href="#" className="text-foreground underline hover:no-underline">
                Contact our support team
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
