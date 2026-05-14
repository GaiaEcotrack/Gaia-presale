'use client'

import { motion } from 'framer-motion'
import { FileText, Download, BookOpen, Zap, Shield, Globe, Users, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TOKEN_CONFIG } from '@/lib/constants'

const SECTIONS = [
  {
    icon: Leaf,
    title: 'Vision',
    content:
      'Gaia Ecotrack aims to accelerate the global transition toward renewable energy by creating a decentralized ecosystem where clean energy production becomes a tokenized digital asset. Our vision is to empower individuals, communities, and companies to participate directly in the sustainable energy economy through blockchain technology.',
  },
  {
    icon: Zap,
    title: 'Technology',
    content:
      'The Gaia Ecotrack ecosystem integrates IoT energy monitoring devices with blockchain infrastructure to record and verify real-world energy production. This allows transparent tracking of renewable generation, token issuance based on energy output, and secure transactions across a decentralized network.',
  },
  {
    icon: Shield,
    title: 'Token Utility',
    content:
      'The GAIA token powers the ecosystem by enabling access to energy projects, staking rewards, platform services, and participation in the renewable energy marketplace. Token holders benefit from ecosystem growth, sustainability incentives, and early participation opportunities through the presale.',
  },
  {
    icon: Globe,
    title: 'Tokenomics',
    content:
      'Gaia Ecotrack tokenomics are designed to support long-term ecosystem growth through strategic allocation for development, community incentives, renewable infrastructure expansion, and liquidity. The model aligns economic incentives with environmental impact by linking token value to real-world energy production.',
  },
  {
    icon: Users,
    title: 'Governance',
    content:
      'Future governance mechanisms will allow token holders to participate in ecosystem decisions, including project funding, protocol upgrades, and sustainability initiatives. Gaia Ecotrack promotes transparency, decentralization, and community-driven growth.',
  },
]

export default function WhitepaperPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-2 mb-6"
          >
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Technical Documentation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Gaia Ecotrack Whitepaper
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Comprehensive documentation of the {TOKEN_CONFIG.name} ecosystem, including renewable energy tokenization,
            blockchain infrastructure, tokenomics, and roadmap for the decentralized energy future.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button className="gap-2" size="lg">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Executive Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Gaia Ecotrack introduces a new paradigm where renewable energy production becomes a digital asset
                through blockchain technology. By combining IoT monitoring, decentralized infrastructure, and token
                economics, the platform enables transparent verification of energy generation and the creation of a
                sustainable financial ecosystem connected to real-world environmental impact.
              </p>

              <p className="text-muted-foreground leading-relaxed mt-4">
                The GAIA token presale provides early supporters the opportunity to participate in the growth of a
                decentralized renewable energy network. Funds raised will support infrastructure deployment,
                technology development, ecosystem expansion, and strategic partnerships across global markets.
              </p>

              <p className="text-muted-foreground leading-relaxed mt-4">
                Gaia Ecotrack aims to bridge the gap between clean energy production and digital finance by creating
                an ecosystem where sustainability and economic incentives coexist, driving adoption and accelerating
                the transition toward a greener future.
              </p>
            </div>
          </motion.div>

          {/* Sections */}
          <div className="space-y-12">
            {SECTIONS.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 lg:p-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <section.icon className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3">{section.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Document Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-4">Document Preview</h2>

            <div className="bg-muted/50 border border-border rounded-xl p-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />

                <p className="text-muted-foreground mb-4">
                  Full Gaia Ecotrack whitepaper document preview
                </p>

                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download Full PDF
                </Button>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  )
}
