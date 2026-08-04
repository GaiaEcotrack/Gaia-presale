'use client'

import { motion } from 'framer-motion'
import { PresaleWidget } from '@/components/shared/presale-widget'
import { TOKEN_CONFIG } from '@/lib/constants'
import { Wallet, Shield, Clock, Coins, ExternalLink } from 'lucide-react'

export default function BuyPage() {
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
            Buy {TOKEN_CONFIG.name} Tokens
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Participate in our token presale and secure your {TOKEN_CONFIG.symbol} tokens at the best price on Solana.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Presale Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <PresaleWidget />
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Payment Methods */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Wallet className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">USDC</p>
                      <p className="text-xs text-muted-foreground">SPL Token (Solana)</p>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Wallet className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">USDT</p>
                      <p className="text-xs text-muted-foreground">SPL Token (Solana)</p>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Token Info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Token Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Network</p>
                      <p className="text-xs text-muted-foreground">Solana</p>
                    </div>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">SOL</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Token Standard</p>
                      <p className="text-xs text-muted-foreground">SPL Token</p>
                    </div>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">SPL</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Decimals</p>
                      <p className="text-xs text-muted-foreground">9</p>
                    </div>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">9</span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Anchor Program (Audited)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Cliff + Linear Vesting</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-green-500" />
                    <span className="text-sm">USDC/USDT Payments</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://explorer.solana.com/address/${TOKEN_CONFIG.contractAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3"
                    >
                      <ExternalLink className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-blue-500 hover:underline">View on Explorer</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
