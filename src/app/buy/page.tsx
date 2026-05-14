'use client'

import { motion } from 'framer-motion'
import { PresaleWidget } from '@/components/shared/presale-widget'
import { TOKEN_CONFIG } from '@/lib/constants'
import { DEFAULT_PRESALE_STAGES } from '@/config/presale-config'
import { CreditCard, Building2, Wallet, Shield, Clock, Gift } from 'lucide-react'

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
            Participate in our token presale and secure your {TOKEN_CONFIG.symbol} tokens at the best price.
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
              
              {/* Transaction History */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Recent Transactions</h3>
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left text-xs font-medium text-muted-foreground p-4">Address</th>
                        <th className="text-left text-xs font-medium text-muted-foreground p-4">Amount</th>
                        <th className="text-left text-xs font-medium text-muted-foreground p-4">Tokens</th>
                        <th className="text-left text-xs font-medium text-muted-foreground p-4">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {[
                        { address: '0x7a3b...f82c', amount: '1.5 ETH', tokens: '437,500', time: '2 min' },
                        { address: '0x9d2e...a15b', amount: '0.8 ETH', tokens: '233,333', time: '5 min' },
                        { address: '0x4c8f...d73a', amount: '3.2 ETH', tokens: '933,333', time: '8 min' },
                        { address: '0x1e5a...c29d', amount: '0.5 ETH', tokens: '145,833', time: '12 min' },
                      ].map((tx, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-mono text-sm">{tx.address}</td>
                          <td className="p-4 text-sm">{tx.amount}</td>
                          <td className="p-4 text-sm font-medium">{tx.tokens} {TOKEN_CONFIG.symbol}</td>
                          <td className="p-4 text-sm text-muted-foreground">{tx.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
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
                      <p className="font-medium text-sm">Crypto (ETH/USDT)</p>
                      <p className="text-xs text-muted-foreground">Direct wallet payment</p>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg opacity-50">
                    <CreditCard className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Credit Card</p>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg opacity-50">
                    <Building2 className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Bank Transfer</p>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bonus Tiers */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Bonus Tiers</h3>
                <div className="space-y-3">
                  {DEFAULT_PRESALE_STAGES.map((stage) => (
                    <div key={stage.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{stage.name}</p>
                        <p className="text-xs text-muted-foreground">${stage.price} per token</p>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400">+{stage.bonus}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Security</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <span className="text-sm">Audited by CertiK</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="text-sm">6-month vesting period</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-green-500" />
                    <span className="text-sm">5% referral bonus</span>
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
