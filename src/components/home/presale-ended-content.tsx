'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Users, TrendingUp, Package, Calendar, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePresaleStore } from '@/store/presale-store'

export function PresaleEndedContent() {
  const { totalRaised, investors, tokensSold } = usePresaleStore()

  const finalStats = [
    {
      icon: TrendingUp,
      value: `$${totalRaised.toLocaleString()}`,
      label: 'Total Raised',
      description: 'Successfully funded'
    },
    {
      icon: Users,
      value: `${investors.toLocaleString()}+`,
      label: 'Investors',
      description: 'Joined the presale'
    },
    {
      icon: Package,
      value: `${(tokensSold / 1000000).toFixed(1)}M`,
      label: 'Tokens Sold',
      description: 'GAIA tokens allocated'
    },
    {
      icon: Calendar,
      value: '48 Hours',
      label: 'Token Distribution',
      description: 'Starts after presale'
    }
  ]

  const nextSteps = [
    'Token distribution within 48 hours',
    'Listing on decentralized exchanges',
    'Platform beta access for presale participants',
    'Community governance voting opens'
  ]

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
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Presale Successfully Completed! 🎉
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Thank you to all {investors.toLocaleString()} investors who participated in the GAIA presale. 
          Together, we've raised <span className="font-bold text-green-600">${totalRaised.toLocaleString()}</span> 
          to build the future of renewable energy tokenization.
        </p>
      </div>

      {/* Final Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {finalStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-4">
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="font-medium mb-1">{stat.label}</p>
            <p className="text-sm text-muted-foreground">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-2xl p-8 mb-12">
        <h3 className="text-2xl font-bold mb-6 text-center">What Happens Next</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-lg mb-4">Token Distribution Timeline</h4>
            <ul className="space-y-3">
              {nextSteps.map((step, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <span>{step}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Important Information</h4>
            <div className="space-y-4">
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl">
                <p className="font-medium mb-2">Token Claim Process</p>
                <p className="text-sm text-muted-foreground">
                  You will be able to claim your GAIA tokens starting 48 hours after presale ends. 
                  Connect your wallet to the dashboard to claim.
                </p>
              </div>
              
              <div className="p-4 bg-white dark:bg-gray-900 rounded-xl">
                <p className="font-medium mb-2">Vesting Schedule</p>
                <p className="text-sm text-muted-foreground">
                  25% of tokens unlocked at TGE, remaining 75% vested linearly over 6 months.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href="/buy">
          <Button size="lg" className="h-14 px-8 text-lg gap-2">
            View Purchase History
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        
        <Link href="/tokenomics">
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
            View Tokenomics
          </Button>
        </Link>
        
        <Link href="/roadmap">
          <Button size="lg" variant="ghost" className="h-14 px-8 text-lg">
            See Roadmap
          </Button>
        </Link>
      </div>

      {/* Thank You Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-12 pt-8 border-t border-border"
      >
        <p className="text-muted-foreground">
          Thank you for being part of the Gaia Ecotrack journey. 
          Together, we're building a sustainable future powered by blockchain technology.
        </p>
        <p className="font-medium mt-2">- The Gaia Ecotrack Team</p>
      </motion.div>
    </motion.div>
  )
}