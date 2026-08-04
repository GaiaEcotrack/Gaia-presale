import { PublicKey } from "@solana/web3.js";
import {
  GAIA_DECIMALS,
  type RoundStatus,
  type RoundType,
  type Config,
  type Round,
  type BuyerProfile,
  type Purchase,
} from "./config";

function toBigInt(value: unknown): bigint {
  if (value === null || value === undefined) return 0n;
  if (typeof value === "bigint") return value;
  if (typeof value === "number") return BigInt(value);
  if (typeof value === "object" && value !== null && "toString" in value) {
    return BigInt((value as { toString: () => string }).toString());
  }
  if (typeof value === "string") return BigInt(value);
  return 0n;
}

function toNumberU8(value: unknown): number {
  return Number(toBigInt(value) & 0xffn);
}

function toPubkey(value: unknown): PublicKey {
  if (value instanceof PublicKey) return value;
  if (value && typeof value === "object" && "toBuffer" in value) {
    return new PublicKey(
      (value as { toBuffer: () => Buffer }).toBuffer(),
    );
  }
  return PublicKey.default;
}

function toBool(value: unknown): boolean {
  return Boolean(value);
}

function toRoundStatus(value: unknown): RoundStatus {
  if (!value || typeof value !== "object") return "Upcoming";
  const variant = Object.keys(value)[0]?.toLowerCase();
  switch (variant) {
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "ended":
      return "Ended";
    default:
      return "Upcoming";
  }
}

function toRoundType(value: unknown): RoundType {
  if (!value || typeof value !== "object") return "Public";
  const variant = Object.keys(value)[0]?.toLowerCase();
  return variant === "seed" ? "Seed" : "Public";
}

export function mapConfig(raw: Record<string, unknown>): Config | null {
  if (!raw) return null;
  return {
    admin: toPubkey(raw.admin),
    treasury: toPubkey(raw.treasury),
    gaia_mint: toPubkey(raw.gaiaMint),
    usdc_mint: toPubkey(raw.usdcMint),
    usdt_mint: toPubkey(raw.usdtMint),
    tge_timestamp: toBigInt(raw.tgeTimestamp),
    current_round: toNumberU8(raw.currentRound),
    total_tokens_sold: toBigInt(raw.totalTokensSold),
    total_usdc_raised: toBigInt(raw.totalUsdcRaised),
    total_usdt_raised: toBigInt(raw.totalUsdtRaised),
    paused: toBool(raw.paused),
    gaia_vault: toPubkey(raw.gaiaVault),
    legal_authority: toPubkey(raw.legalAuthority),
    legal_cleared: toBool(raw.legalCleared),
    compliance_authority: toPubkey(raw.complianceAuthority),
    bump: toNumberU8(raw.bump),
    gaia_vault_bump: toNumberU8(raw.gaiaVaultBump),
  };
}

export function mapRound(raw: Record<string, unknown>): Round | null {
  if (!raw) return null;
  return {
    id: toNumberU8(raw.id),
    name: typeof raw.name === "string" ? raw.name : "",
    price_micro_usd: toBigInt(raw.priceMicroUsd),
    tokens_available: toBigInt(raw.tokensAvailable),
    tokens_sold: toBigInt(raw.tokensSold),
    start_time: toBigInt(raw.startTime),
    end_time: toBigInt(raw.endTime),
    cliff_seconds: toBigInt(raw.cliffSeconds),
    vesting_duration_seconds: toBigInt(raw.vestingDurationSeconds),
    minimum_purchase: toBigInt(raw.minimumPurchase),
    maximum_purchase: toBigInt(raw.maximumPurchase),
    maximum_per_wallet: toBigInt(raw.maximumPerWallet),
    whitelist_enabled: toBool(raw.whitelistEnabled),
    round_type: toRoundType(raw.roundType),
    status: toRoundStatus(raw.status),
    bump: toNumberU8(raw.bump),
  };
}

export function mapBuyerProfile(
  raw: Record<string, unknown>,
): BuyerProfile | null {
  if (!raw) return null;
  return {
    wallet: toPubkey(raw.wallet),
    total_purchased: toBigInt(raw.totalPurchased),
    total_claimed: toBigInt(raw.totalClaimed),
    total_paid: toBigInt(raw.totalPaid),
    purchase_count: toBigInt(raw.purchaseCount),
    created_at: toBigInt(raw.createdAt),
    bump: toNumberU8(raw.bump),
  };
}

export function mapPurchase(raw: Record<string, unknown>): Purchase | null {
  if (!raw) return null;
  return {
    wallet: toPubkey(raw.wallet),
    round_id: toNumberU8(raw.roundId),
    purchase_number: toBigInt(raw.purchaseNumber),
    payment_amount: toBigInt(raw.paymentAmount),
    payment_mint: toPubkey(raw.paymentMint),
    token_amount: toBigInt(raw.tokenAmount),
    claimed_amount: toBigInt(raw.claimedAmount),
    price_micro_usd: toBigInt(raw.priceMicroUsd),
    timestamp: toBigInt(raw.timestamp),
    bump: toNumberU8(raw.bump),
  };
}
