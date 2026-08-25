'use client'

import { motion } from 'framer-motion'
import { ClaimWidget } from '@/components/shared/claim-widget'
import { Shield, Clock, Coins, ExternalLink } from 'lucide-react'
import { TOKEN_CONFIG } from '@/lib/constants'
import { getSolscanAddressUrl } from '@/lib/solana/explorer'

export default function ClaimPage() {
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
            Claim {TOKEN_CONFIG.symbol} Tokens
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            View your vesting schedule and claim your vested {TOKEN_CONFIG.symbol} tokens.
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Claim Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <ClaimWidget />
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Vesting Info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">How Vesting Works</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Cliff Period</p>
                      <p className="text-xs text-muted-foreground">
                        Tokens are locked during the cliff period after TGE (Token Generation Event).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Coins className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Linear Vesting</p>
                      <p className="text-xs text-muted-foreground">
                        Después del cliff de 6 meses, los tokens se liberan de forma LINEAL y continua durante el periodo de vesting definido por la ronda (mismo cálculo que ejecuta el contrato on-chain).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">On-Chain Claims</p>
                      <p className="text-xs text-muted-foreground">
                        Each claim is a Solana transaction. Claim whenever you want after tokens vest.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Explorer Link */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">Contract Info</h3>
                <div className="space-y-3">
                  <a
                    href={getSolscanAddressUrl(TOKEN_CONFIG.contractAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm">View on Solscan</p>
                      <p className="text-xs text-muted-foreground">Check contract state</p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
