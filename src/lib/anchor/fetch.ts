import type { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { findConfigPda, findRoundPda, findBuyerProfilePda, findPurchasePda } from "./pda";
import { mapConfig, mapRound, mapBuyerProfile, mapPurchase } from "./mappers";
import type { Config, Round, BuyerProfile, Purchase } from "./config";

export async function fetchConfig(
  program: Program,
): Promise<Config | null> {
  const pda = findConfigPda(program.programId);
  try {
    const raw = await (program.account as any).config.fetch(pda);
    return mapConfig(raw);
  } catch (err) {
    console.error("fetchConfig error:", err);
    return null;
  }
}

export async function fetchRound(
  program: Program,
  id: number,
): Promise<Round | null> {
  const pda = findRoundPda(id, program.programId);
  try {
    const raw = await (program.account as any).round.fetch(pda);
    return mapRound(raw);
  } catch (err) {
    console.error("fetchRound error:", err);
    return null;
  }
}

export async function fetchBuyerProfile(
  program: Program,
  wallet: PublicKey,
): Promise<BuyerProfile | null> {
  const pda = findBuyerProfilePda(wallet, program.programId);
  try {
    const raw = await (program.account as any).buyerProfile.fetch(pda);
    return mapBuyerProfile(raw);
  } catch (err) {
    console.error("fetchBuyerProfile error:", err);
    return null;
  }
}

export async function fetchPurchase(
  program: Program,
  wallet: PublicKey,
  purchaseNumber: bigint,
): Promise<Purchase | null> {
  const pda = findPurchasePda(wallet, purchaseNumber, program.programId);
  try {
    const raw = await (program.account as any).purchase.fetch(pda);
    return mapPurchase(raw);
  } catch (err) {
    console.error("fetchPurchase error:", err);
    return null;
  }
}

export async function fetchPurchasesForWallet(
  program: Program,
  wallet: PublicKey,
  purchaseCount: bigint,
): Promise<Purchase[]> {
  const count = Number(purchaseCount);
  if (count <= 0) return [];
  const purchases: Purchase[] = [];
  for (let i = 0; i < count; i++) {
    const p = await fetchPurchase(program, wallet, BigInt(i));
    if (p) purchases.push(p);
  }
  return purchases;
}

const RPC_BATCH_SIZE = 100;

export async function fetchAllRounds(program: Program): Promise<Round[]> {
  const allPdas = Array.from({ length: 256 }, (_, i) =>
    findRoundPda(i, program.programId),
  );
  const rounds: Round[] = [];
  const connection = program.provider.connection;

  for (let i = 0; i < allPdas.length; i += RPC_BATCH_SIZE) {
    const batch = allPdas.slice(i, i + RPC_BATCH_SIZE);
    const accounts = await connection.getMultipleAccountsInfo(batch);
    for (const acct of accounts) {
      if (acct?.data) {
        try {
          const decoded = program.coder.accounts.decode("round", acct.data);
          const mapped = mapRound(decoded);
          if (mapped) rounds.push(mapped);
        } catch {
          // Wrong discriminator or corrupted data — skip
        }
      }
    }
  }
  rounds.sort((a, b) => a.id - b.id);
  return rounds;
}
