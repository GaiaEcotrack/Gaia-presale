'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield, Users, TrendingUp, Clock, Leaf, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/shared/countdown-timer'
import { CountdownToStart } from '@/components/shared/countdown-to-start'
import { AnimatedCounter, StatsCard } from '@/components/shared/animated-counter'
import { ParticleExplosion } from '@/components/shared/particle-explosion'
import { PresaleEndedContent } from '@/components/home/presale-ended-content'
import { PresaleStartingContent } from '@/components/home/presale-starting-content'
import { TOKEN_CONFIG } from '@/lib/constants'
import { usePresaleStore } from '@/store/presale-store'
import { useWallet } from '@/hooks/use-wallet'
import { useInView } from '@/hooks/use-animations'
import { useState, useEffect } from 'react'
import { getPresaleStatus } from '@/lib/presale-utils'
import { usePresaleConfigReadonly } from '@/hooks/use-presale-config'

export function HeroSection() {
  const { totalRaised, investors, tokensSold } = usePresaleStore()
  const { isConnected, connectWallet, connectors } = useWallet()
  const { ref, isInView } = useInView(0.1)
  
  const { activeStage, nextStage, isPresaleActive, presaleEndDate, nextStageStartDate } = usePresaleConfigReadonly()
  const [isPresaleEnded, setIsPresaleEnded] = useState(false)
  const [isPresaleStarting, setIsPresaleStarting] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const [hasShownAnimation, setHasShownAnimation] = useState(false)
  const [presaleStatus, setPresaleStatus] = useState(() => getPresaleStatus())

  const handleConnect = () => {
    if (connectors.length > 0) {
      connectWallet(connectors[0].id)
    }
  }

  const handleCountdownEnd = () => {
    if (!hasShownAnimation) {
      setShowParticles(true)
      setHasShownAnimation(true)
    }
  }

  const handleCountdownStart = () => {
    setIsPresaleStarting(true)
    // You could trigger a different animation here if needed
  }

  const handleParticleComplete = () => {
    setShowParticles(false)
    setIsPresaleEnded(true)
  }

  useEffect(() => {
    const now = new Date()
    
    // Check if presale has ended
    if (activeStage && now >= activeStage.endDate && !hasShownAnimation) {
      setIsPresaleEnded(true)
    }
    
    // Update presale status periodically
    const interval = setInterval(() => {
      setPresaleStatus(getPresaleStatus())
    }, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [activeStage, hasShownAnimation])

  // Determine which countdown to show
  const showStartCountdown = !isPresaleActive && nextStage !== null
  const showEndCountdown = isPresaleActive && activeStage !== null
  const showPresaleEnded = isPresaleEnded
  const showPresaleStarting = isPresaleStarting

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-black/5 dark:bg-white/5 rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-muted rounded-full px-4 py-2 mb-8"
          >
            {showStartCountdown ? (
              <Rocket className="w-4 h-4 text-purple-500" />
            ) : showEndCountdown ? (
              <Clock className="w-4 h-4 text-blue-500" />
            ) : (
              <Leaf className="w-4 h-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {showStartCountdown ? 'Next Presale Stage Starting Soon' : 
               showEndCountdown ? 'Presale Live - Limited Time' :
               'Tokenizing Renewable Energy on Vara Network'}
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Transform Clean Energy
            <br />
            <span className="gradient-text">Into Digital Assets</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          >
            Gaia Ecotrack tokenizes renewable energy, enabling anyone to participate in the 
            green economy. Join {investors.toLocaleString()}+ investors building a sustainable future.
          </motion.p>

          {/* Countdown Timer Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10 relative min-h-[200px]"
          >
            <ParticleExplosion 
              isActive={showParticles}
              onComplete={handleParticleComplete}
              className="z-20"
            />
            
            {showPresaleEnded ? (
              <PresaleEndedContent />
            ) : showPresaleStarting ? (
              <PresaleStartingContent />
            ) : showStartCountdown ? (
              <>
                <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                  Next Presale Stage Starts In
                </p>
                <CountdownToStart 
                  size="lg" 
                  onCountdownStart={handleCountdownStart}
                  showStageInfo={true}
                />
              </>
            ) : showEndCountdown && activeStage ? (
              <>
                <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider">
                  {activeStage.name} Ends In
                </p>
                <CountdownTimer 
                  targetDate={activeStage.endDate} 
                  size="lg" 
                  onCountdownEnd={handleCountdownEnd}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active or upcoming presale stages</p>
              </div>
            )}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/buy">
              <Button size="lg" className="h-14 px-8 text-lg gap-2">
                Buy GAIA Tokens
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            {!isConnected && (
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg gap-2"
                onClick={handleConnect}
              >
                Connect Wallet
              </Button>
            )}
            <Link href="/whitepaper">
              <Button size="lg" variant="ghost" className="h-14 px-8 text-lg">
                Read Whitepaper
              </Button>
            </Link>
          </motion.div>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-4xl mx-auto"
          >
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                <AnimatedCounter end={totalRaised} prefix="$" decimals={0} separator />
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Raised</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                <AnimatedCounter end={investors} decimals={0} separator />
              </p>
              <p className="text-sm text-muted-foreground mt-1">Investors</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                <AnimatedCounter end={5} suffix="M+" decimals={0} />
              </p>
              <p className="text-sm text-muted-foreground mt-1">kWh Tokenized</p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
               <p className="text-2xl sm:text-3xl font-bold">
                 ${activeStage?.price.toFixed(3) || '0.000'}
               </p>
              <p className="text-sm text-muted-foreground mt-1">Current Price</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-border rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-foreground rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
