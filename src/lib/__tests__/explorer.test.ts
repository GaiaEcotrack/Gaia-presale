import { describe, it, expect } from 'vitest'
import {
  getSolscanTxUrl,
  getSolanaExplorerTxUrl,
  getSolscanAddressUrl,
  getStreamflowVaultUrl,
} from '@/lib/solana/explorer'
import { CLUSTER } from '@/lib/anchor/config'

// Widen the literal so mainnet-branch assertions stay valid.
const cluster: string = CLUSTER
const IS_MAINNET = cluster === 'mainnet-beta' || cluster === 'mainnet'

const TX = '5x8f9a2b7c1d3e5f6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
const ADDR = '5aXDAUUjG8HbZ8YXmrPx5kA9U1usqiyKSFhL4eY3bwLS'

describe('explorer URL builders (manual §4)', () => {
  it('Solscan is primary and derives cluster from config — never hardcoded', () => {
    const url = getSolscanTxUrl(TX)
    expect(url.startsWith(`https://solscan.io/tx/${TX}`)).toBe(true)
    if (IS_MAINNET) {
      expect(url).not.toContain('cluster=')
    } else {
      expect(url).toContain(`cluster=${cluster}`)
    }
  })

  it('Solana Explorer fallback mirrors the same cluster handling', () => {
    const url = getSolanaExplorerTxUrl(TX)
    expect(url.startsWith(`https://explorer.solana.com/tx/${TX}`)).toBe(true)
    expect(url.endsWith(`?cluster=${cluster}`)).toBe(!IS_MAINNET)
  })

  it('account URLs include the address', () => {
    expect(getSolscanAddressUrl(ADDR)).toContain(`/account/${ADDR}`)
  })
})

describe('streamflow link (manual §5.3)', () => {
  it('builds a vault URL only for real addresses', () => {
    expect(getStreamflowVaultUrl(null)).toBeNull()
    expect(getStreamflowVaultUrl(undefined)).toBeNull()
    expect(getStreamflowVaultUrl('')).toBeNull()
    expect(getStreamflowVaultUrl('vault123')).toBe(
      'https://app.streamflow.finance/vesting/vault123',
    )
  })
})
