'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Loader2, Check, ExternalLink, Coins, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useWallet } from '@/hooks/use-wallet'
import { useToast } from '@/hooks/use-toast'
import { getReadProgram } from '@/lib/anchor/program'
import { fetchConfig, fetchRound, fetchBuyerProfile, fetchPurchasesForWallet } from '@/lib/anchor/fetch'
import { executeClaim } from '@/lib/anchor/instructions/claim'
import { computeVesting, type VestingBreakdown } from '@/lib/anchor/vesting'
import { PublicKey } from '@solana/web3.js'
import type { Config, Round, Purchase } from '@/lib/anchor/config'

interface PurchaseWithVesting {
  purchase: Purchase
  round: Round
  vesting: VestingBreakdown
}

export function ClaimWidget() {
  const [config, setConfig] = useState<Config | null>(null)
  const [purchases, setPurchases] = useState<PurchaseWithVesting[]>([])
  const [loading, setLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)
  const [txUrl, setTxUrl] = useState('')

  const { isConnected, address, connectWallet } = useWallet()
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    if (!address) {
      setLoading(false)
      return
    }
    try {
      const program = getReadProgram()
      const fetchedConfig = await fetchConfig(program)
      setConfig(fetchedConfig)

      if (fetchedConfig) {
        const buyerProfile = await fetchBuyerProfile(program, new PublicKey(address))
        if (buyerProfile && buyerProfile.purchase_count > 0n) {
          const allPurchases = await fetchPurchasesForWallet(
            program,
            new PublicKey(address),
            buyerProfile.purchase_count,
          )

          const withVesting: PurchaseWithVesting[] = []
          for (const purchase of allPurchases) {
            const round = await fetchRound(program, purchase.round_id)
            if (round && fetchedConfig) {
              const vesting = computeVesting(purchase, round, fetchedConfig)
              withVesting.push({ purchase, round, vesting })
            }
          }
          setPurchases(withVesting)
        }
      }
    } catch (err) {
      console.error('Failed to load claim data:', err)
    } finally {
      setLoading(false)
    }
  }, [address])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleClaim = async (p: PurchaseWithVesting) => {
    const claimKey = `${p.purchase.round_id}-${p.purchase.purchase_number}`
    setClaimingId(claimKey)
    setSuccessId(null)
    try {
      const result = await executeClaim(
        { publicKey: new PublicKey(address!), signTransaction: (window as any).solana?.signTransaction, signAllTransactions: (window as any).solana?.signAllTransactions } as any,
        {
          roundId: p.purchase.round_id,
          purchaseNumber: p.purchase.purchase_number,
        },
      )
      setTxUrl(result.explorerUrl)
      setSuccessId(claimKey)
      toast({
        title: 'Claim successful!',
        description: `You claimed ${(Number(p.vesting.claimable) / 1e6).toLocaleString()} GAIA tokens.`,
      })
      loadData()
    } catch (error: any) {
      toast({
        title: 'Claim failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setClaimingId(null)
    }
  }

  const handleClaimAll = async () => {
    const claimable = purchases.filter(p => p.vesting.claimable > 0n)
    for (const p of claimable) {
      await handleClaim(p)
    }
  }

  const totalClaimable = purchases.reduce((sum, p) => {
    const roundEnded = p.round.status === 'Ended' || Math.floor(Date.now() / 1000) > Number(p.round.end_time)
    return roundEnded ? sum + p.vesting.claimable : sum
  }, 0n)
  const totalClaimed = purchases.reduce((sum, p) => sum + p.vesting.claimed, 0n)
  const totalPurchased = purchases.reduce((sum, p) => sum + p.vesting.total, 0n)

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading your purchases...</span>
        </div>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-xl p-6">
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <Wallet className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">Connect your wallet to view and claim tokens.</p>
          <Button onClick={connectWallet} className="gap-2">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
      {/* Summary */}
      <div className="p-6 border-b border-border">
        <h3 className="font-semibold text-lg mb-4">Claim Summary</h3>
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
          <div className="text-center">
            <p className="text-xl font-bold">{(Number(totalPurchased) / 1e6).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Purchased</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-xl font-bold text-green-600">{(Number(totalClaimed) / 1e6).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Claimed</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-blue-600">{(Number(totalClaimable) / 1e6).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
        </div>
        {totalClaimable > 0n && (
          <Button onClick={handleClaimAll} className="w-full mt-4 gap-2" size="lg">
            <Coins className="w-4 h-4" />
            Claim All Available
          </Button>
        )}
      </div>

      {/* Purchases */}
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-4">Your Purchases</h3>
        {purchases.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No purchases found for this wallet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((p) => {
              const claimKey = `${p.purchase.round_id}-${p.purchase.purchase_number}`
              const isClaiming = claimingId === claimKey
              const isSuccess = successId === claimKey
              const roundEnded = p.round.status === 'Ended' || Math.floor(Date.now() / 1000) > Number(p.round.end_time)
              const canClaim = p.vesting.claimable > 0n && !isClaiming && roundEnded

              return (
                <motion.div
                  key={claimKey}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{p.round.name || `Round #${p.round.id}`}</p>
                      <p className="text-xs text-muted-foreground">
                        Purchased: {(Number(p.vesting.total) / 1e6).toLocaleString()} GAIA
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      !roundEnded ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' :
                      p.vesting.fullyUnlocked ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                      p.vesting.cliffPassed ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600'
                    }`}>
                      {!roundEnded ? 'Round Active' :
                       p.vesting.fullyUnlocked ? 'Fully Unlocked' :
                       p.vesting.cliffPassed ? 'Vesting' : 'Cliff Active'}
                    </span>
                  </div>

                  {/* Vesting Progress */}
                  <div className="mb-3">
                    <Progress value={p.vesting.vestedFraction * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Vested: {(p.vesting.vestedFraction * 100).toFixed(1)}%</span>
                      <span>{(Number(p.vesting.claimed) / 1e6).toLocaleString()} / {(Number(p.vesting.total) / 1e6).toLocaleString()} claimed</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Coins className="w-3 h-3" />
                      Claimable: {(Number(p.vesting.claimable) / 1e6).toLocaleString()} GAIA
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      Pending: {(Number(p.vesting.pending) / 1e6).toLocaleString()} GAIA
                    </div>
                  </div>

                  {/* Claim Button */}
                  <Button
                    onClick={() => handleClaim(p)}
                    disabled={!canClaim}
                    className="w-full gap-2"
                    size="sm"
                  >
                    {isClaiming ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Claiming...
                      </>
                    ) : isSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        Claimed!
                      </>
                    ) : p.vesting.claimable > 0n ? (
                      <>
                        Claim {(Number(p.vesting.claimable) / 1e6).toLocaleString()} GAIA
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : !roundEnded ? (
                      'Round not ended yet'
                    ) : !p.vesting.cliffPassed ? (
                      'Cliff not reached'
                    ) : (
                      'Nothing to claim'
                    )}
                  </Button>

                  {/* Transaction Link */}
                  {isSuccess && txUrl && (
                    <div className="mt-2 text-center">
                      <a
                        href={txUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline inline-flex items-center gap-1"
                      >
                        View on Explorer <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
