'use client'

import { HeroSection } from '@/components/home/hero-section'
import { TrustBadges } from '@/components/home/trust-badges'
import { AboutSection } from '@/components/home/about-section'
import { TokenomicsPreview } from '@/components/home/tokenomics-preview'
import { RoadmapPreview } from '@/components/home/roadmap-preview'
import { HowToBuyPreview } from '@/components/home/how-to-buy-preview'
import { NewsletterSection } from '@/components/home/newsletter-section'
import { PresaleWidget } from '@/components/shared/presale-widget'

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBadges />
      
      {/* Presale Widget Section */}
        <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Join the Gaia Ecotrack Presale
              </h2>

              <p className="text-lg text-muted-foreground mb-8">
                Be part of the renewable energy revolution. The GAIA token connects
                blockchain technology with real-world clean energy production,
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
                      Presale participants receive exclusive token bonuses and priority allocation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Lowest Entry Price</p>
                    <p className="text-sm text-muted-foreground">
                      Secure GAIA tokens before public exchange listing at the most favorable price.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Real-World Utility</p>
                    <p className="text-sm text-muted-foreground">
                      Tokens are linked to renewable energy generation, carbon credits,
                      and ecosystem services within the Gaia Ecotrack platform.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-medium">Secure Blockchain Infrastructure</p>
                    <p className="text-sm text-muted-foreground">
                      Built using advanced decentralized technology ensuring transparency,
                      traceability, and security for all transactions.
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
      <TokenomicsPreview />
      <RoadmapPreview />
      <HowToBuyPreview />
      <NewsletterSection />
    </>
  )
}
