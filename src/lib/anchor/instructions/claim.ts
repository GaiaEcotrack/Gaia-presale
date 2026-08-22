import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  type TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import {
  type ExecuteInstructionOptions,
  type SignerWallet,
} from "../wallet";
import { getProgramForWallet, getConnection } from "../program";
import {
  findConfigPda,
  findRoundPda,
  findBuyerProfilePda,
  findPurchasePda,
  findGaiaVaultPda,
  findStatisticsPda,
} from "../pda";
import { fetchConfig, fetchRound, fetchBuyerProfile, fetchPurchase } from "../fetch";
import { CLUSTER } from "../config";
import type { PublicKey } from "@solana/web3.js";

export interface ClaimInput {
  roundId: number;
  purchaseNumber: bigint;
}

export interface ClaimResult {
  signature: string;
  explorerUrl: string;
  blockhash: string;
  lastValidBlockHeight: number;
}

export async function executeClaim(
  wallet: SignerWallet,
  input: ClaimInput,
  options: ExecuteInstructionOptions = {},
): Promise<ClaimResult> {
  const { awaitConfirmation = true } = options;
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  if (!wallet.signTransaction) throw new Error("Wallet does not support signing");

  const buyer = wallet.publicKey;
  const program = getProgramForWallet(wallet);
  const connection = getConnection();
  const programId = program.programId;

  console.log(`[CLAIM] RPC: ${connection.rpcEndpoint}`);
  console.log(`[CLAIM] Program ID: ${programId.toBase58()}`);

  const configPda = findConfigPda(programId);
  const roundPda = findRoundPda(input.roundId, programId);
  const buyerProfilePda = findBuyerProfilePda(buyer, programId);
  const purchasePda = findPurchasePda(buyer, input.purchaseNumber, programId);
  const gaiaVaultPda = findGaiaVaultPda(programId);
  const statisticsPda = findStatisticsPda(programId);

  console.time("fetch-data");
  const [config, round, purchase, { blockhash, lastValidBlockHeight }] =
    await Promise.all([
      fetchConfig(program),
      fetchRound(program, input.roundId),
      fetchPurchase(program, buyer, input.purchaseNumber),
      connection.getLatestBlockhash("confirmed"),
    ]);
  console.timeEnd("fetch-data");

  if (!config) throw new Error("Protocol not initialized");
  if (config.paused) throw new Error("Protocol is paused");
  if (!round) throw new Error(`Round ${input.roundId} not found`);
  if (!purchase) throw new Error("Purchase not found");

  const buyerGaiaAccount = await getAssociatedTokenAddress(
    config.gaia_mint,
    buyer,
  );

  const preInstructions: TransactionInstruction[] = [];
  console.time("fetch-ata-info");
  const ataInfo = await connection.getAccountInfo(buyerGaiaAccount);
  console.timeEnd("fetch-ata-info");
  if (!ataInfo) {
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        buyer,
        buyerGaiaAccount,
        buyer,
        config.gaia_mint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }

  console.time("build-transaction");
  const claimIx = await program.methods
    .claim()
    .accounts({
      buyer,
      config: configPda,
      round: roundPda,
      buyerProfile: buyerProfilePda,
      purchase: purchasePda,
      gaiaVault: gaiaVaultPda,
      buyerGaiaAccount,
      statistics: statisticsPda,
      gaiaMint: config.gaia_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  const allInstructions = [...preInstructions, claimIx];
  const transaction = new Transaction({
    feePayer: buyer,
    blockhash,
    lastValidBlockHeight,
  }).add(...allInstructions);
  console.timeEnd("build-transaction");

  console.time("wallet-sign");
  const signed = await wallet.signTransaction(transaction);
  console.timeEnd("wallet-sign");

  console.time("send-transaction");
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: true,
    maxRetries: 3,
  });
  console.timeEnd("send-transaction");

  console.time("confirm-transaction");
  if (awaitConfirmation) {
    await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed",
    );
  }
  console.timeEnd("confirm-transaction");

  console.log(`[CLAIM] Signature: ${signature}`);

  return {
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`,
    blockhash,
    lastValidBlockHeight,
  };
}
