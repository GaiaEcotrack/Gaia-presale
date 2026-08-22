// Centralized explorer URL builders (manual §4).
// Solscan is the primary explorer; Solana Explorer is the fallback.
// Cluster handling is driven by the existing CLUSTER constant — never hardcoded.

import { CLUSTER } from '@/lib/anchor/config'

// Widen the literal type so cluster comparisons stay valid if CLUSTER changes.
const CLUSTER_NAME: string = CLUSTER

function clusterQuery(): string {
  // Both explorers accept `?cluster=devnet|testnet`; mainnet takes no param.
  if (CLUSTER_NAME === 'mainnet-beta' || CLUSTER_NAME === 'mainnet') return ''
  return `?cluster=${CLUSTER_NAME}`
}

/** Primary explorer link for a transaction (manual §4.2). */
export function getSolscanTxUrl(txId: string): string {
  return `https://solscan.io/tx/${txId}${clusterQuery()}`
}

/** Fallback explorer link for a transaction. */
export function getSolanaExplorerTxUrl(txId: string): string {
  return `https://explorer.solana.com/tx/${txId}${clusterQuery()}`
}

/** Primary explorer link for an address (mint, program, vault…). */
export function getSolscanAddressUrl(address: string): string {
  return `https://solscan.io/account/${address}${clusterQuery()}`
}

/** Fallback explorer link for an address. */
export function getSolanaExplorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}${clusterQuery()}`
}

/**
 * Public Streamflow vesting view for a vault (manual §5.3).
 * Returns null when no real vault address is configured — we never
 * invent vault addresses or URLs.
 */
export function getStreamflowVaultUrl(vaultAddress: string | null | undefined): string | null {
  if (!vaultAddress) return null
  return `https://app.streamflow.finance/vesting/${vaultAddress}`
}
