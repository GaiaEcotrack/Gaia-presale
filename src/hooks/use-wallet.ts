'use client'

import { useCallback, useState, useEffect } from 'react'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import {
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'

const USDC_MINT = new PublicKey('x8RWxebgaMKuwx5sT2BBWHcBHSquwXxbqFCZL5dbxbR')

export function useWallet() {
  const { publicKey, connected, connecting, disconnect, select, wallets, sendTransaction } = useSolanaWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState('0')
  const [showWalletModal, setShowWalletModal] = useState(false)

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance('0')
      return
    }
    try {
      const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey)
      const account = await getAccount(connection, ata)
      setBalance((Number(account.amount) / 1e6).toFixed(2))
    } catch {
      setBalance('0')
    }
  }, [publicKey, connection])

  useEffect(() => {
    if (connected) {
      fetchBalance()
    } else {
      setBalance('0')
    }
  }, [connected, fetchBalance])

  const connectWallet = useCallback(() => {
    const phantom = wallets.find((w) => w.adapter.name === 'Phantom')
    if (phantom) {
      select(phantom.adapter.name)
    }
    setShowWalletModal(false)
  }, [wallets, select])

  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  const formatAddress = useCallback((addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  const copyAddress = useCallback(() => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
    }
  }, [publicKey])

  const address = publicKey?.toBase58() ?? null
  const isCorrectNetwork = true

  return {
    address,
    isConnected: connected,
    isConnecting: connecting,
    isSwitching: false,
    isCorrectNetwork,
    balance,
    chain: null,
    showWalletModal,
    connectError: null,
    connectors: [],

    connectWallet,
    disconnectWallet,
    formatAddress,
    copyAddress,
    switchToMainnet: () => {},
    setShowWalletModal,
    sendTransaction,
  }
}
