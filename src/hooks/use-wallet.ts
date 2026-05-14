'use client'

import { useCallback, useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { formatEther } from 'viem'

export function useWallet() {
  const { address, isConnected, chain } = useAccount()
  const { connectors, connect, isPending: isConnecting, error: connectError } = useConnect()
  const { disconnect } = useDisconnect()
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
  })
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  const [showWalletModal, setShowWalletModal] = useState(false)

  const connectWallet = useCallback((connectorId?: string) => {
    const connector = connectors.find((c) => c.id === connectorId) || connectors[0]
    if (connector) {
      connect({ connector })
    }
    setShowWalletModal(false)
  }, [connectors, connect])

  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  const formatAddress = useCallback((addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  const copyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address)
    }
  }, [address])

  // Refetch balance when address changes
  useEffect(() => {
    if (address) {
      refetchBalance()
    }
  }, [address, refetchBalance])

  const isCorrectNetwork = chain?.id === 1 // Ethereum mainnet

  const switchToMainnet = useCallback(() => {
    switchChain?.({ chainId: 1 })
  }, [switchChain])

  const formattedBalance = balance ? Number(formatEther(balance.value)).toFixed(4) : '0'

  return {
    // State
    address,
    isConnected,
    isConnecting,
    isSwitching,
    isCorrectNetwork,
    balance: formattedBalance,
    chain,
    showWalletModal,
    connectError,
    connectors,

    // Actions
    connectWallet,
    disconnectWallet,
    formatAddress,
    copyAddress,
    switchToMainnet,
    setShowWalletModal,
  }
}
