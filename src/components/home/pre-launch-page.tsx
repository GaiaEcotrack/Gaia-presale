'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { CountdownToStart } from '@/components/shared/countdown-to-start'
import { usePresaleConfigReadonly } from '@/hooks/use-presale-config'

interface PreLaunchPageProps {
  onTransitionComplete?: () => void
}

export function PreLaunchPage({ onTransitionComplete }: PreLaunchPageProps) {
  const { isBeforeFirstSale, firstSaleStartDate, formattedFirstSaleDate } = usePresaleConfigReadonly()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [hasTransitioned, setHasTransitioned] = useState(false)
  
  // Check localStorage for previous transition
  useEffect(() => {
    const checkTransitionStatus = () => {
      const hasSeenPreLaunch = localStorage.getItem('prelaunch-transition-complete')
      if (hasSeenPreLaunch === 'true') {
        setHasTransitioned(true)
        onTransitionComplete?.()
      }
    }
    
    checkTransitionStatus()
  }, [onTransitionComplete])
  
  // Handle countdown completion
  const handleCountdownComplete = () => {
    setIsTransitioning(true)
    
    // Store in localStorage that transition has happened
    localStorage.setItem('prelaunch-transition-complete', 'true')
    
    // Wait for fade out animation to complete
    setTimeout(() => {
      setHasTransitioned(true)
      onTransitionComplete?.()
    }, 1000) // Match fade out duration
  }
  
  // If we've already transitioned, don't show pre-launch page
  if (hasTransitioned || !isBeforeFirstSale) {
    return null
  }
  
  return (
    <AnimatePresence>
      {!hasTransitioned && (
        <motion.div
          key="prelaunch-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-4"
        >
          {/* Fade out overlay when transitioning */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isTransitioning ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white z-10"
          />
          
          <div className="relative z-20 w-full max-w-4xl mx-auto text-center">
            {/* Coming Soon */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-black mb-4">
                Coming Soon
              </h1>
              <div className="h-1 w-24 bg-black mx-auto mb-6" />
            </motion.div>
            
            {/* Project Name */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800">
                Gaia Ecotrack Presale
              </h2>
              <p className="text-gray-600 mt-2 text-lg">
                The future of eco-friendly blockchain technology
              </p>
            </motion.div>
            
            {/* Countdown Timer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
              className="mb-12"
            >
              <CountdownToStart 
                targetDate={firstSaleStartDate || undefined}
                size="xl"
                className="text-black"
                onCountdownStart={handleCountdownComplete}
                showStageInfo={false}
              />
            </motion.div>
            
            {/* Start Date */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <div className="inline-block bg-gray-100 rounded-full px-6 py-3">
                <p className="text-gray-700 font-medium">
                  <span className="text-black font-semibold">Launch Date:</span>{' '}
                  {formattedFirstSaleDate || 'February 21, 2026'}
                </p>
              </div>
            </motion.div>
            
            {/* Email Notification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <div className="max-w-md mx-auto">
                <p className="text-gray-600 mb-4">
                  Get notified when we launch
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-black"
                  />
                  <button
                    type="button"
                    className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Notify Me
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  We'll only email you about the launch. No spam.
                </p>
              </div>
            </motion.div>
            
            {/* Minimal Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 pt-8 border-t border-gray-200"
            >
              <p className="text-gray-500 text-sm">
                © {new Date().getFullYear()} Gaia Ecotrack. All rights reserved.
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}