'use client'

import { useCallback } from 'react'
import { usePresaleStore } from '@/store/presale-store'
import { usePresaleConfigReadonly } from './use-presale-config'

export function usePresale() {
  const {
    totalRaised,
    investors,
    tokensSold,
    currentStage,
    currentPrice,
    presaleEndDate,
    minPurchase,
    maxPurchase,
    isPresaleActive,
    updateStats,
    addInvestment,
  } = usePresaleStore()

  const { activeStage, config } = usePresaleConfigReadonly()

  const getStage = useCallback(() => {
    if (activeStage) return activeStage
    // Si no hay stage activo, usar el primero de la configuración
    return config.stages[0]
  }, [activeStage, config.stages])

  const calculateTokens = useCallback(
    (ethAmount: number): number => {
      // Convert ETH to USD (mock price: $3,500 per ETH)
      const ethPrice = 3500
      const usdValue = ethAmount * ethPrice
      const tokens = usdValue / currentPrice
      return Math.floor(tokens)
    },
    [currentPrice]
  )

  const getProgress = useCallback(() => {
    const stage = getStage()
    const progress = (stage.sold / stage.supply) * 100
    return Math.min(progress, 100)
  }, [getStage])

  const purchaseTokens = useCallback(
    async (ethAmount: number): Promise<{ success: boolean; txHash?: string; error?: string }> => {
      try {
        // Mock purchase simulation
        const tokens = calculateTokens(ethAmount)
        
        // Simulate transaction delay
        await new Promise((resolve) => setTimeout(resolve, 2000))
        
        // Update stats
        addInvestment(ethAmount, tokens)
        
        // Generate mock tx hash
        const txHash = `0x${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
        
        return { success: true, txHash }
      } catch (error) {
        return { success: false, error: 'Transaction failed' }
      }
    },
    [calculateTokens, addInvestment]
  )

  const stage = getStage()
  const progress = getProgress()

  return {
    // State
    totalRaised,
    investors,
    tokensSold,
    currentStage: stage.id,
    currentPrice: stage.price,
    presaleEndDate: stage.endDate,
    minPurchase: stage.minPurchase,
    maxPurchase,
    isPresaleActive: activeStage !== null,
    
    // Computed
    stage,
    progress,
    
    // Actions
    calculateTokens,
    purchaseTokens,
    updateStats,
    setStage: () => {
      console.log('setStage deprecado - usar usePresaleConfig en su lugar')
    },
  }
}
