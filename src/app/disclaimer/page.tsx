'use client'

import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { TOKEN_CONFIG } from '@/lib/constants'

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold mb-6"
          >
            Disclaimer
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            Last updated: January 2025
          </motion.p>
        </div>
      </section>

      {/* Warning Banner */}
      <section className="bg-red-50 dark:bg-red-950/20 border-y border-red-200 dark:border-red-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                Important Risk Warning
              </h2>
              <p className="text-red-700 dark:text-red-300">
                <strong>This is not financial advice. Cryptocurrency investments carry significant risk.</strong>
                {' '}You could lose all or a substantial portion of your investment. Past performance does not 
                guarantee future results. Only invest what you can afford to lose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-neutral dark:prose-invert max-w-none"
          >
            <h2>General Disclaimer</h2>
            <p>
              The information provided on this website and any related materials regarding the {TOKEN_CONFIG.name} 
              ({TOKEN_CONFIG.symbol}) token presale is for general informational purposes only. It does not 
              constitute financial, investment, legal, tax, or any other form of professional advice.
            </p>

            <h2>No Guarantee of Returns</h2>
            <p>
              There is no guarantee that {TOKEN_CONFIG.symbol} tokens will increase in value or provide any return 
              on investment. The cryptocurrency market is highly volatile and unpredictable. Token prices can 
              fluctuate widely, and you may lose some or all of your investment.
            </p>

            <h2>Regulatory Uncertainty</h2>
            <p>
              The regulatory landscape for cryptocurrencies and digital assets is evolving. Changes in regulations 
              could adversely affect the value, legality, or utility of {TOKEN_CONFIG.symbol} tokens. You are 
              responsible for understanding and complying with applicable laws in your jurisdiction.
            </p>

            <h2>Technical Risks</h2>
            <p>
              Blockchain technology and smart contracts carry inherent technical risks, including but not limited to:
            </p>
            <ul>
              <li>Smart contract vulnerabilities or bugs</li>
              <li>Network congestion and high transaction fees</li>
              <li>Potential forks in the underlying blockchain</li>
              <li>Security breaches and hacking attempts</li>
              <li>Loss of private keys or wallet access</li>
            </ul>

            <h2>No Liability</h2>
            <p>
              The {TOKEN_CONFIG.name} Protocol team, its founders, employees, advisors, and affiliates shall not 
              be liable for any direct, indirect, incidental, special, consequential, or punitive damages 
              resulting from your participation in the token presale or use of the tokens.
            </p>

            <h2>Forward-Looking Statements</h2>
            <p>
              Any forward-looking statements regarding the {TOKEN_CONFIG.name} Protocol, including roadmap 
              milestones, features, and expectations, are based on current expectations and assumptions. 
              Actual results may differ materially from those projected.
            </p>

            <h2>Independent Verification</h2>
            <p>
              You are solely responsible for conducting your own research and due diligence before participating 
              in the presale. Do not rely solely on information provided on this website. Consult with independent 
              financial, legal, and tax advisors before making any investment decisions.
            </p>

            <h2>Acknowledgment</h2>
            <p>
              By participating in the {TOKEN_CONFIG.name} token presale, you acknowledge that you have read, 
              understood, and accept all risks associated with cryptocurrency investments, and you agree that 
              the {TOKEN_CONFIG.name} Protocol team shall not be held responsible for any losses you may incur.
            </p>

            <h2>Contact</h2>
            <p>
              For questions about this disclaimer, please contact us at{' '}
              <a href="mailto:legal@nexusprotocol.io">legal@nexusprotocol.io</a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
