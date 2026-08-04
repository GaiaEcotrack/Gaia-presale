import type { PublicKey } from "@solana/web3.js";

export const PROGRAM_ID = "6Pez7dr7vaZdxtgbsboLT3FmVDaS4JgqJE7AquoXmF24" as const;

export const CLUSTER = "devnet" as const;

export const RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC ?? `https://api.${CLUSTER}.solana.com`;

export const GAIA_DECIMALS = 6;
export const STABLE_DECIMALS = 6;
export const MICRO_USD_PER_USD = BigInt(1_000_000);

export type RoundStatus = "Upcoming" | "Active" | "Paused" | "Ended";
export type RoundType = "Seed" | "Public";

export interface Config {
  admin: PublicKey;
  treasury: PublicKey;
  gaia_mint: PublicKey;
  usdc_mint: PublicKey;
  usdt_mint: PublicKey;
  tge_timestamp: bigint;
  current_round: number;
  total_tokens_sold: bigint;
  total_usdc_raised: bigint;
  total_usdt_raised: bigint;
  paused: boolean;
  gaia_vault: PublicKey;
  legal_authority: PublicKey;
  legal_cleared: boolean;
  compliance_authority: PublicKey;
  bump: number;
  gaia_vault_bump: number;
}

export interface Round {
  id: number;
  name: string;
  price_micro_usd: bigint;
  tokens_available: bigint;
  tokens_sold: bigint;
  start_time: bigint;
  end_time: bigint;
  cliff_seconds: bigint;
  vesting_duration_seconds: bigint;
  minimum_purchase: bigint;
  maximum_purchase: bigint;
  maximum_per_wallet: bigint;
  whitelist_enabled: boolean;
  round_type: RoundType;
  status: RoundStatus;
  bump: number;
}

export interface BuyerProfile {
  wallet: PublicKey;
  total_purchased: bigint;
  total_claimed: bigint;
  total_paid: bigint;
  purchase_count: bigint;
  created_at: bigint;
  bump: number;
}

export interface Purchase {
  wallet: PublicKey;
  round_id: number;
  purchase_number: bigint;
  payment_amount: bigint;
  payment_mint: PublicKey;
  token_amount: bigint;
  claimed_amount: bigint;
  price_micro_usd: bigint;
  timestamp: bigint;
  bump: number;
}
