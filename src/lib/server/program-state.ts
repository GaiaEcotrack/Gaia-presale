// Server-side decoding of program PDAs using the REAL Anchor IDL (GAP-1/GAP-4).
//
// Financial facts (roundId, amounts, currency, purchaseNumber) and expected
// mint identities are read exclusively from chain state — never hardcoded,
// never trusted from client payloads. If a required program account cannot be
// fetched or decoded, callers must REJECT the sync instead of guessing.

import { BorshAccountsCoder, BN, type Idl } from '@coral-xyz/anchor'
import { PublicKey, type AccountInfo } from '@solana/web3.js'
import idl from '@/lib/anchor/idl.json'
import { PROGRAM_ID } from '@/lib/anchor/config'
import {
  findConfigPda,
  findRoundPda,
} from '@/lib/anchor/pda'
import { withRpcTimeout, type VerifyRpcClient } from './rpc'

export const VERIFIED_PROGRAM_ID = PROGRAM_ID

const coder = new BorshAccountsCoder(idl as unknown as Idl)

export interface OnChainConfig {
  treasury: PublicKey
  gaiaMint: PublicKey
  usdcMint: PublicKey
  usdtMint: PublicKey
  gaiaVault: PublicKey
  tgeTimestamp: bigint
}

export interface OnChainPurchaseRecord {
  address: PublicKey
  wallet: PublicKey
  roundId: number
  purchaseNumber: bigint
  paymentAmount: bigint
  paymentMint: PublicKey
  tokenAmount: bigint
  claimedAmount: bigint
  priceMicroUsd: bigint
  timestamp: bigint
}

export interface OnChainRound {
  id: number
  priceMicroUsd: bigint
  cliffSeconds: bigint
  vestingDurationSeconds: bigint
}

function toBigInt(value: BN | bigint | number): bigint {
  if (typeof value === 'bigint') return value
  if (typeof value === 'number') return BigInt(Math.trunc(value))
  return BigInt(value.toString())
}

/**
 * Fetches FULL account data under the hard RPC deadline.
 */
async function fetchFullAccountInfo(
  connection: VerifyRpcClient,
  address: PublicKey,
): Promise<AccountInfo<Buffer> | null> {
  return withRpcTimeout(
    () =>
      connection.getAccountInfo(address, 'confirmed') as Promise<
        AccountInfo<Buffer> | null
      >,
  )
}

/** Decodes any program account defined in the IDL. Throws on mismatch. */
function decodeProgramAccount<T>(accountName: string, data: Buffer): T {
  return coder.decode(accountName, data) as T
}

// ---------------------------------------------------------------------------
// Config PDA (mint identities + TGE) — cached briefly to avoid per-request RPC.
// ---------------------------------------------------------------------------

const CONFIG_CACHE_TTL_MS = 60_000
let configCache: { value: OnChainConfig; expiresAt: number } | null = null

export function invalidateConfigCache(): void {
  configCache = null
}

export async function fetchProgramConfig(
  connection: VerifyRpcClient,
): Promise<OnChainConfig | null> {
  if (configCache && configCache.expiresAt > Date.now()) {
    return configCache.value
  }

  const programId = new PublicKey(VERIFIED_PROGRAM_ID)
  const address = findConfigPda(programId)
  const info = await fetchFullAccountInfo(connection, address)
  if (!info || !info.data || info.data.length === 0) return null

  let raw: {
    gaia_mint: PublicKey
    usdc_mint: PublicKey
    usdt_mint: PublicKey
    treasury: PublicKey
    gaia_vault: PublicKey
    tge_timestamp: BN
  }
  try {
    raw = decodeProgramAccount('Config', info.data)
  } catch {
    return null
  }

  const value: OnChainConfig = {
    treasury: raw.treasury,
    gaiaMint: raw.gaia_mint,
    usdcMint: raw.usdc_mint,
    usdtMint: raw.usdt_mint,
    gaiaVault: raw.gaia_vault,
    tgeTimestamp: toBigInt(raw.tge_timestamp),
  }
  configCache = { value, expiresAt: Date.now() + CONFIG_CACHE_TTL_MS }
  return value
}

// ---------------------------------------------------------------------------
// Purchase PDA — authoritative financial facts written by the program itself.
// ---------------------------------------------------------------------------

export async function fetchPurchaseRecord(
  connection: VerifyRpcClient,
  address: PublicKey,
): Promise<OnChainPurchaseRecord | null> {
  const info = await fetchFullAccountInfo(connection, address)
  if (!info || !info.data || info.data.length === 0) return null

  try {
    const raw = decodeProgramAccount<{
      wallet: PublicKey
      round_id: number
      purchase_number: BN
      payment_amount: BN
      payment_mint: PublicKey
      token_amount: BN
      claimed_amount: BN
      price_micro_usd: BN
      timestamp: BN
    }>('Purchase', info.data)

    return {
      address,
      wallet: raw.wallet,
      roundId: raw.round_id,
      purchaseNumber: toBigInt(raw.purchase_number),
      paymentAmount: toBigInt(raw.payment_amount),
      paymentMint: raw.payment_mint,
      tokenAmount: toBigInt(raw.token_amount),
      claimedAmount: toBigInt(raw.claimed_amount),
      priceMicroUsd: toBigInt(raw.price_micro_usd),
      timestamp: toBigInt(raw.timestamp),
    }
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Round PDA — canonical vesting parameters (cliff + linear duration).
// ---------------------------------------------------------------------------

export async function fetchRoundRecord(
  connection: VerifyRpcClient,
  roundId: number,
): Promise<OnChainRound | null> {
  const programId = new PublicKey(VERIFIED_PROGRAM_ID)
  const address = findRoundPda(roundId, programId)
  const info = await fetchFullAccountInfo(connection, address)
  if (!info || !info.data || info.data.length === 0) return null

  try {
    const raw = decodeProgramAccount<{
      id: number
      price_micro_usd: BN
      cliff_seconds: BN
      vesting_duration_seconds: BN
    }>('Round', info.data)

    return {
      id: raw.id,
      priceMicroUsd: toBigInt(raw.price_micro_usd),
      cliffSeconds: toBigInt(raw.cliff_seconds),
      vestingDurationSeconds: toBigInt(raw.vesting_duration_seconds),
    }
  } catch {
    return null
  }
}
