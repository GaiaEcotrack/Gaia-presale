'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react'
import { useConnection } from '@solana/wallet-adapter-react'
import {
  getAssociatedTokenAddress,
  getAccount,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import type { SignerWallet } from '@/lib/anchor/wallet'

const USDC_MINT = new PublicKey('x8RWxebgaMKuwx5sT2BBWHcBHSquwXxbqFCZL5dbxbR')

export function useWallet() {
  const {
    publicKey,
    connected,
    connecting,
    disconnect,
    select,
    wallets,
    sendTransaction,
    signTransaction,
    signAllTransactions,
  } = useSolanaWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState('0')
  const [showWalletModal, setShowWalletModal] = useState(false)

  const readStableBalance = useCallback(async (): Promise<string> => {
    if (!publicKey) return '0'
    try {
      const ata = await getAssociatedTokenAddress(USDC_MINT, publicKey)
      const account = await getAccount(connection, ata)
      return (Number(account.amount) / 1e6).toFixed(2)
    } catch {
      return '0'
    }
  }, [publicKey, connection])

  /** Manual re-fetch; kept for existing consumers. */
  const fetchBalance = useCallback(async () => {
    const next = await readStableBalance()
    setBalance(next)
  }, [readStableBalance])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      const next = connected ? await readStableBalance() : '0'
      if (!cancelled) setBalance(next)
    })()
    return () => {
      cancelled = true
    }
  }, [connected, readStableBalance])

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

  /**
   * Real signer wallet for program instructions (buy/claim).
   * Uses the actual adapter context so Solflare/Backpack work too — replaces
   * the previous `window.solana` casts. Null when disconnected.
   */
  const signerWallet: SignerWallet | null = useMemo(
    () =>
      publicKey
        ? { publicKey, sendTransaction, signTransaction, signAllTransactions }
        : null,
    [publicKey, sendTransaction, signTransaction, signAllTransactions],
  )

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
    signTransaction,
    signAllTransactions,
    signerWallet,
  }
}
