'use client'

import { motion } from 'framer-motion'
import { TOKEN_CONFIG } from '@/lib/constants'

export default function TermsPage() {
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
            Terms & Conditions
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

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-neutral dark:prose-invert max-w-none"
          >
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and participating in the {TOKEN_CONFIG.name} token presale, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of 
              these terms, you must not participate in the presale.
            </p>

            <h2>2. Token Sale</h2>
            <p>
              The {TOKEN_CONFIG.name} ({TOKEN_CONFIG.symbol}) token presale is conducted on a first-come, first-served basis. 
              By purchasing tokens, you acknowledge that:
            </p>
            <ul>
              <li>Tokens are digital assets on the Ethereum blockchain</li>
              <li>Token purchases are final and non-refundable</li>
              <li>Tokens may be subject to vesting periods</li>
              <li>Token value may fluctuate significantly</li>
            </ul>

            <h2>3. Eligibility</h2>
            <p>
              To participate in the presale, you must:
            </p>
            <ul>
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Not be a resident of any jurisdiction where participation is prohibited</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>

            <h2>4. Risks</h2>
            <p>
              Participating in cryptocurrency presales involves significant risks, including but not limited to:
            </p>
            <ul>
              <li>Market volatility and potential loss of investment</li>
              <li>Regulatory changes affecting token value or legality</li>
              <li>Technical risks including smart contract vulnerabilities</li>
              <li>Liquidity risks and inability to sell tokens</li>
            </ul>

            <h2>5. No Financial Advice</h2>
            <p>
              Nothing in this website or any related materials constitutes financial, investment, legal, or tax advice. 
              You should consult with independent professional advisors before making any investment decisions.
            </p>

            <h2>6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, {TOKEN_CONFIG.name} Protocol and its team members shall not be 
              liable for any direct, indirect, incidental, consequential, or punitive damages arising from your 
              participation in the presale.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
              All content, trademarks, and intellectual property on this website are owned by {TOKEN_CONFIG.name} Protocol. 
              You may not use, reproduce, or distribute any content without prior written permission.
            </p>

            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Continued participation in the 
              presale after changes constitutes acceptance of the modified terms.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the 
              jurisdiction in which {TOKEN_CONFIG.name} Protocol is organized, without regard to conflict of law principles.
            </p>

            <h2>10. Contact</h2>
            <p>
              For questions about these Terms and Conditions, please contact us at{' '}
              <a href="mailto:legal@nexusprotocol.io">legal@nexusprotocol.io</a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
