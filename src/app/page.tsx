'use client'

import { HeroSection } from '@/components/home/hero-section'
import { TrustBadges } from '@/components/home/trust-badges'
import { TokenAllocation } from '@/components/home/token-allocation'
import { ProblemSection } from '@/components/home/problem-section'
import { ProjectsSection } from '@/components/home/projects-section'
import { TokenFlowSection } from '@/components/home/token-flow-section'
import { SolarFarmsSection } from '@/components/home/solar-farms-section'
import { AboutSection } from '@/components/home/about-section'
import { KeyDifferentiators } from '@/components/home/key-differentiators'
import { TokenomicsPreview } from '@/components/home/tokenomics-preview'
import { RoadmapPreview } from '@/components/home/roadmap-preview'
import { HowToBuyPreview } from '@/components/home/how-to-buy-preview'
import { CtaFinal } from '@/components/home/cta-final'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { PresaleWidget } from '@/components/shared/presale-widget'

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      <ProblemSection />
      <ProjectsSection />
      <TokenFlowSection />
      <SolarFarmsSection />
      <TokenAllocation />

      {/* Presale Widget Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Join the GAIA Presale
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                Be part of the renewable energy revolution. The GAIA token connects
                blockchain technology with real clean energy production,
                giving early supporters access to one of the most innovative
                sustainability ecosystems in Web3.
              </p>
              
              <div className="space-y-4">

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Early Investor Bonus</p>
                    <p className="text-sm text-muted-foreground">
                      Presale participants receive exclusive tokens and priority allocation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Best Entry Price</p>
                    <p className="text-sm text-muted-foreground">
                      Secure GAIA tokens before public listing at the best price.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Real Utility</p>
                    <p className="text-sm text-muted-foreground">
                      Tokens backed by real renewable energy and carbon credits
                      within the Gaia Ecotrack ecosystem.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Secure Infrastructure</p>
                    <p className="text-sm text-muted-foreground">
                      Built on Solana with decentralized technology ensuring
                      transparency, traceability and security.
                    </p>
                  </div>
                </div>

              </div>
            </div>
            
            <div>
              <PresaleWidget />
            </div>

          </div>
        </div>
      </section>  
      
      <AboutSection />
      <KeyDifferentiators />
      <TokenomicsPreview />
      <RoadmapPreview />
      <HowToBuyPreview />
      <CtaFinal />
      <NewsletterSection />
    </>
  )
}
