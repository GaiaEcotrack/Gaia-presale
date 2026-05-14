'use client'

import { motion } from 'framer-motion'
import { TOKEN_CONFIG } from '@/lib/constants'

export default function PrivacyPage() {
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
            Privacy Policy
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
            <h2>1. Information We Collect</h2>
            <p>
              When you participate in the {TOKEN_CONFIG.name} presale, we may collect the following information:
            </p>
            <ul>
              <li><strong>Wallet Address:</strong> Your Ethereum wallet address used for transactions</li>
              <li><strong>Transaction Data:</strong> Amounts, timestamps, and transaction hashes</li>
              <li><strong>Email Address:</strong> If you subscribe to our newsletter</li>
              <li><strong>Usage Data:</strong> Browser type, IP address, pages visited</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the collected information for:</p>
            <ul>
              <li>Processing and verifying your token purchase</li>
              <li>Sending transaction confirmations and updates</li>
              <li>Providing customer support</li>
              <li>Sending newsletters and promotional materials (with your consent)</li>
              <li>Improving our services and user experience</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information. However, no method of 
              transmission over the internet is 100% secure. We cannot guarantee absolute security of your data.
            </p>

            <h2>4. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information. We may share data with:</p>
            <ul>
              <li>Service providers who assist in our operations</li>
              <li>Legal authorities when required by law</li>
              <li>Business partners with your consent</li>
            </ul>

            <h2>5. Blockchain Transparency</h2>
            <p>
              Please note that blockchain transactions are publicly visible. Your wallet address and transaction 
              details will be permanently recorded on the Ethereum blockchain and cannot be deleted.
            </p>

            <h2>6. Cookies</h2>
            <p>
              We use cookies and similar technologies to enhance your browsing experience. You can control cookie 
              settings through your browser preferences.
            </p>

            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (where applicable)</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2>8. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the privacy 
              practices of these external sites. We encourage you to review their privacy policies.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not directed to individuals under 18 years of age. We do not knowingly collect 
              personal information from children.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              For questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@gaiaecotrack.com">privacy@gaiaecotrack.com</a>
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
