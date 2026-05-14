'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wallet } from 'lucide-react'
import { TOKEN_CONFIG } from '@/lib/constants'

// Mock purchase data
const MOCK_PURCHASES = [
  { address: '0x7a3b...f82c', amount: '1.5 ETH', tokens: '437,500', time: '2 min ago' },
  { address: '0x9d2e...a15b', amount: '0.8 ETH', tokens: '233,333', time: '5 min ago' },
  { address: '0x4c8f...d73a', amount: '3.2 ETH', tokens: '933,333', time: '8 min ago' },
  { address: '0x1e5a...c29d', amount: '0.5 ETH', tokens: '145,833', time: '12 min ago' },
  { address: '0x8b7c...e46f', amount: '2.1 ETH', tokens: '612,500', time: '15 min ago' },
]

export function LivePurchases() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentPurchase, setCurrentPurchase] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return

    const showTimer = setInterval(() => {
      setIsVisible(true)
      setCurrentPurchase((prev) => (prev + 1) % MOCK_PURCHASES.length)
      
      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false)
      }, 5000)
    }, 15000)

    // Show first notification after 3 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true)
      setTimeout(() => setIsVisible(false), 5000)
    }, 3000)

    return () => {
      clearInterval(showTimer)
      clearTimeout(initialTimer)
    }
  }, [dismissed])

  if (dismissed) return null

  const purchase = MOCK_PURCHASES[currentPurchase]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed bottom-4 left-4 z-50 max-w-xs"
        >
          <div className="bg-card border border-border rounded-xl shadow-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">New Purchase!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="font-mono">{purchase.address}</span> bought {purchase.amount}
                </p>
                <p className="text-xs text-muted-foreground">
                  +{purchase.tokens} {TOKEN_CONFIG.symbol}
                </p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="p-1 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
