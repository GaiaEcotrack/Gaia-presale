'use client'

import { motion } from 'framer-motion'
import { Rocket, Zap, Gift, Users, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePresaleConfigReadonly } from '@/hooks/use-presale-config'

export function PresaleStartingContent() {
  const { nextStage } = usePresaleConfigReadonly()

  const features = [
    {
      icon: Zap,
      title: 'Early Bird Bonus',
      description: 'Up to 30% bonus tokens for early participants'
    },
    {
      icon: Gift,
      title: 'Exclusive Rewards',
      description: 'Special NFTs and rewards for presale investors'
    },
    {
      icon: Users,
      title: 'Community Access',
      description: 'Join our exclusive investor community'
    }
  ]

  const preparationSteps = [
    'Connect your Web3 wallet',
    'Ensure you have enough ETH/USDT',
    'Set up gas fees for faster transactions',
    'Join our Telegram for real-time updates'
  ]

  if (!nextStage) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center p-8"
      >
        <h3 className="text-2xl font-bold mb-4">Presale Information</h3>
        <p className="text-muted-foreground">
          No upcoming presale stages scheduled at the moment.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto"
    >
      {/* Celebration Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-6"
        >
          <Rocket className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          {nextStage.name} is Live! 🚀
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The {nextStage.name} has officially started! Join now to get GAIA tokens at 
          <span className="font-bold text-purple-600"> ${nextStage.price.toFixed(3)} each</span> 
          with <span className="font-bold text-green-600">{nextStage.bonus}% bonus</span>.
        </p>
      </div>

      {/* Stage Details */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Stage Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Token Price</span>
              <span className="font-bold">${nextStage.price.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bonus</span>
              <span className="font-bold text-green-600">{nextStage.bonus}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Minimum Purchase</span>
              <span className="font-bold">{nextStage.minPurchase} ETH</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tokens Available</span>
              <span className="font-bold">{(nextStage.supply / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ends</span>
              <span className="font-bold">
                {nextStage.endDate.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4">Why Participate Now</h3>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Preparation Steps */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl p-8 mb-12">
        <h3 className="text-2xl font-bold mb-6 text-center">Get Ready to Participate</h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">Preparation Checklist</h4>
            <ul className="space-y-3">
              {preparationSteps.map((step, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                  </div>
                  <span>{step}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Important Notes</h4>
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl">
                <p className="font-medium mb-2">Gas Fees</p>
                <p className="text-sm text-muted-foreground">
                  Ensure you have enough ETH for gas fees. Higher gas = faster transaction.
                </p>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl">
                <p className="font-medium mb-2">Wallet Security</p>
                <p className="text-sm text-muted-foreground">
                  Only connect to official links. Never share your private keys.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/buy">
          <Button size="lg" className="h-14 px-8 text-lg gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
            Buy GAIA Tokens Now
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        
        <Link href="/how-to-buy">
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
            How to Buy Guide
          </Button>
        </Link>
        
        <Link href="/faq">
          <Button size="lg" variant="ghost" className="h-14 px-8 text-lg">
            Read FAQ
          </Button>
        </Link>
      </div>

      {/* Countdown to Stage End */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-12 pt-8 border-t border-border"
      >
        <p className="text-muted-foreground mb-2">
          This stage ends {nextStage.endDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <p className="font-medium">Don't miss this opportunity!</p>
      </motion.div>
    </motion.div>
  )
}