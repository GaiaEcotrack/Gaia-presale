'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, ArrowRight, Loader2, Check, ExternalLink, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@/hooks/use-wallet'
import { useToast } from '@/hooks/use-toast'
import { getReadProgram } from '@/lib/anchor/program'
import { fetchConfig, fetchAllRounds } from '@/lib/anchor/fetch'
import { executeBuy } from '@/lib/anchor/instructions/buy'
import { PublicKey } from '@solana/web3.js'
import type { Config, Round } from '@/lib/anchor/config'

interface PresaleWidgetProps {
  compact?: boolean
}

export function PresaleWidget({ compact = false }: PresaleWidgetProps) {
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [txUrl, setTxUrl] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState<'USDC' | 'USDT'>('USDC')
  const [config, setConfig] = useState<Config | null>(null)
  const [round, setRound] = useState<Round | null>(null)
  const [loading, setLoading] = useState(true)

  const { isConnected, address, connectWallet, balance, sendTransaction } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    async function loadData() {
      try {
        const program = getReadProgram()
        const fetchedConfig = await fetchConfig(program)
        setConfig(fetchedConfig)
        const allRounds = await fetchAllRounds(program)
        const activeRound = allRounds.find(
          r => r.status === "Active" && !(fetchedConfig?.paused),
        )
        setRound(activeRound ?? null)
      } catch (err) {
        console.error('Failed to load presale data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const pricePerToken = round
    ? Number(round.price_micro_usd) / 1_000_000
    : 0

  const tokensAvailable = round
    ? Number(round.tokens_available - round.tokens_sold) / 1e6
    : 0

  const totalTokens = round ? Number(round.tokens_available) / 1e6 : 1
  const tokensSold = round ? Number(round.tokens_sold) / 1e6 : 0
  const progress = totalTokens > 0 ? (tokensSold / totalTokens) * 100 : 0

  const calculateTokens = useCallback(
    (usdAmount: number): number => {
      if (pricePerToken <= 0) return 0
      return Math.floor(usdAmount / pricePerToken)
    },
    [pricePerToken],
  )

  const tokens = amount ? calculateTokens(parseFloat(amount) || 0) : 0

  const handlePurchase = async () => {
    if (!isConnected) {
      connectWallet()
      return
    }

    const usdAmount = parseFloat(amount)
    if (!usdAmount || usdAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount to purchase.',
        variant: 'destructive',
      })
      return
    }

    if (!config || !round) {
      toast({
        title: 'Loading',
        description: 'Please wait for presale data to load.',
        variant: 'destructive',
      })
      return
    }

    setIsProcessing(true)
    try {
      const paymentMint = selectedCurrency === 'USDC'
        ? config.usdc_mint
        : config.usdt_mint

      const paymentAmount = BigInt(Math.floor(usdAmount * 1_000_000))

      const result = await executeBuy(
        { publicKey: new PublicKey(address!), sendTransaction, signTransaction: (window as any).solana?.signTransaction, signAllTransactions: (window as any).solana?.signAllTransactions } as any,
        {
          roundId: round.id,
          paymentMint,
          paymentAmount,
        },
      )

      setTxUrl(result.explorerUrl)
      setShowSuccess(true)
      setAmount('')
      toast({
        title: 'Purchase successful!',
        description: `You will receive ${tokens.toLocaleString()} GAIA tokens.`,
      })
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

  const quickAmounts = [10, 25, 50, 100]

  if (loading) {
    return (
      <div className={`bg-card border border-border rounded-2xl shadow-xl overflow-hidden ${compact ? '' : 'p-6'}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading presale data...</span>
        </div>
      </div>
    )
  }

  if (!config || !round) {
    return (
      <div className={`bg-card border border-border rounded-2xl shadow-xl overflow-hidden ${compact ? '' : 'p-6'}`}>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Presale not initialized on-chain.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card border border-border rounded-2xl shadow-xl overflow-hidden ${compact ? '' : 'p-6'}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{round.name || 'Presale Round'}</h3>
          <span className="text-xs bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full">
            Round {round.id}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Status:</span>
          <span className={`font-medium ${
            round.status === 'Active' ? 'text-green-600' :
            round.status === 'Paused' ? 'text-yellow-600' :
            round.status === 'Ended' ? 'text-red-600' :
            'text-muted-foreground'
          }`}>
            {round.status}
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
          <span>{tokensSold.toLocaleString()} tokens sold</span>
          <span>{totalTokens.toLocaleString()} total</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 p-3 sm:p-4 bg-muted/50 rounded-xl">
        <div className="text-center">
          <p className="text-sm sm:text-lg sm:text-xl font-bold">${pricePerToken.toFixed(4)}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Price</p>
        </div>
        <div className="text-center border-x border-border">
          <p className="text-sm sm:text-lg sm:text-xl font-bold">{tokensAvailable.toLocaleString()}</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Available</p>
        </div>
        <div className="text-center">
          <p className="text-sm sm:text-lg sm:text-xl font-bold">GAIA</p>
          <p className="text-[10px] sm:text-xs text-muted-foreground">Token</p>
        </div>
      </div>

      {/* Wallet Status */}
      {!isConnected ? (
        <Button
          onClick={connectWallet}
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
              onClick={() => setSelectedCurrency('USDC')}
              className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${
                selectedCurrency === 'USDC'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : 'bg-transparent border-border hover:bg-muted'
              }`}
            >
              USDC
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

          {/* Token Calculation */}
          {amount && parseFloat(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-muted/50 rounded-xl p-4 mb-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">You will receive</span>
                  <span className="font-medium flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {tokens.toLocaleString()} GAIA
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price per token</span>
                  <span className="font-medium">${pricePerToken.toFixed(4)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Balance */}
          <div className="flex justify-between text-sm text-muted-foreground mb-4">
            <span>Balance: {balance} {selectedCurrency}</span>
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
                Buy GAIA
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>

          {/* Transaction Link */}
          {showSuccess && txUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center"
            >
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:underline inline-flex items-center gap-1"
              >
                View on Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
