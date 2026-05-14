'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ArrowRight, Loader2, Check, AlertCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@/hooks/use-wallet'
import { usePresale } from '@/hooks/use-presale'
import { useCountdown } from '@/hooks/use-countdown'
import { TOKEN_CONFIG } from '@/lib/constants'
import { DEFAULT_PRESALE_STAGES } from '@/config/presale-config'
import { useReferralStore } from '@/store/presale-store'
import { useToast } from '@/hooks/use-toast'

interface PresaleWidgetProps {
  compact?: boolean
}

export function PresaleWidget({ compact = false }: PresaleWidgetProps) {
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<'ETH' | 'USDT'>('ETH')
  
  const { isConnected, address, connectWallet, connectors, balance, formatAddress } = useWallet()
  const { calculateTokens, purchaseTokens, stage, progress, totalRaised, investors, currentPrice } = usePresale()
  const { referralCode, setReferralCode } = useReferralStore()
  const { toast } = useToast()

  const countdown = useCountdown(stage.endDate)

  const tokens = amount ? calculateTokens(parseFloat(amount) || 0) : 0
  const bonusTokens = referralCode ? Math.floor(tokens * 0.05) : 0
  const totalTokens = tokens + bonusTokens

  const handlePurchase = async () => {
    if (!isConnected) {
      connectWallet(connectors[0]?.id)
      return
    }

    const ethAmount = parseFloat(amount)
    if (!ethAmount || ethAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount to purchase.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      const result = await purchaseTokens(ethAmount)
      if (result.success) {
        setShowSuccess(true)
        setAmount('')
        toast({
          title: 'Purchase successful!',
          description: `You will receive ${totalTokens.toLocaleString()} ${TOKEN_CONFIG.symbol} tokens.`,
        })
        setTimeout(() => setShowSuccess(false), 3000)
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: 'Transaction failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const quickAmounts = [0.1, 0.5, 1, 5]

  return (
    <div className={`bg-card border border-border rounded-2xl shadow-xl overflow-hidden ${compact ? '' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Presale {stage.name}</h3>
          <span className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full">
            Stage {stage.id}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Ends in</span>
          <span className="font-mono font-medium text-foreground">
            {countdown.days}d {countdown.hours}h {countdown.minutes}m
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress.toFixed(1)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>${(totalRaised / 1000000).toFixed(2)}M raised</span>
          <span>Goal: ${(TOKEN_CONFIG.hardCap / 1000000).toFixed(0)}M</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/50 rounded-xl">
        <div className="text-center">
          <p className="text-lg sm:text-xl font-bold">${currentPrice.toFixed(3)}</p>
          <p className="text-xs text-muted-foreground">Price</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-lg sm:text-xl font-bold">{(investors / 1000).toFixed(1)}K</p>
          <p className="text-xs text-muted-foreground">Investors</p>
        </div>
        <div className="text-center">
          <p className="text-lg sm:text-xl font-bold">+{stage.bonus}%</p>
          <p className="text-xs text-muted-foreground">Bonus</p>
        </div>
      </div>

      {/* Wallet Status */}
      {!isConnected ? (
        <Button
          onClick={() => connectWallet(connectors[0]?.id)}
          className="w-full h-14 text-lg gap-2"
          size="lg"
        >
          <Wallet className="w-5 h-5" />
          Connect Wallet
        </Button>
      ) : (
        <>
          {/* Currency Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setSelectedCurrency('ETH')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                selectedCurrency === 'ETH'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent border-border hover:bg-muted'
              }`}
            >
              ETH
            </button>
            <button
              onClick={() => setSelectedCurrency('USDT')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                selectedCurrency === 'USDT'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent border-border hover:bg-muted'
              }`}
            >
              USDT
            </button>
          </div>

          {/* Amount Input */}
          <div className="relative mb-4">
            <Input
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 text-xl pr-16 pl-4"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              {selectedCurrency}
            </span>
          </div>

          {/* Quick Amounts */}
          <div className="flex gap-2 mb-4">
            {quickAmounts.map((qty) => (
              <button
                key={qty}
                onClick={() => setAmount(qty.toString())}
                className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
              >
                {qty} {selectedCurrency}
              </button>
            ))}
          </div>

          {/* Referral Code */}
          <div className="mb-4">
            <Input
              type="text"
              placeholder="Referral code (optional)"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="h-10"
            />
          </div>

          {/* Token Calculation */}
          {amount && parseFloat(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-muted/50 rounded-xl p-4 mb-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tokens</span>
                  <span className="font-medium">{tokens.toLocaleString()} {TOKEN_CONFIG.symbol}</span>
                </div>
                {bonusTokens > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Referral Bonus</span>
                    <span className="font-medium text-green-600">+{bonusTokens.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-base pt-2 border-t border-border">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">{totalTokens.toLocaleString()} {TOKEN_CONFIG.symbol}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Balance */}
          <div className="flex justify-between text-sm text-muted-foreground mb-4">
            <span>Balance: {parseFloat(balance).toFixed(4)} {selectedCurrency}</span>
            <button
              onClick={() => setAmount(balance)}
              className="hover:text-foreground transition-colors"
            >
              Max
            </button>
          </div>

          {/* Buy Button */}
          <Button
            onClick={handlePurchase}
            disabled={isProcessing || !amount || parseFloat(amount) <= 0}
            className="w-full h-14 text-lg gap-2"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : showSuccess ? (
              <>
                <Check className="w-5 h-5" />
                Success!
              </>
            ) : (
              <>
                Buy {TOKEN_CONFIG.symbol}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </>
      )}
    </div>
  )
}
