import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  SystemProgram,
  type TransactionInstruction,
  type PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { getProgramForWallet, getConnection } from "../program";
import {
  findConfigPda,
  findRoundPda,
  findBuyerProfilePda,
  findPurchasePda,
  findStatisticsPda,
} from "../pda";
import { fetchConfig, fetchRound, fetchBuyerProfile } from "../fetch";
import { CLUSTER } from "../config";

export interface BuyInput {
  roundId: number;
  paymentMint: PublicKey;
  paymentAmount: bigint;
}

export async function executeBuy(
  wallet: WalletContextState,
  input: BuyInput,
): Promise<{ signature: string; explorerUrl: string }> {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  if (!wallet.sendTransaction) throw new Error("Wallet does not support sendTransaction");

  const buyer: PublicKey = wallet.publicKey;
  const program = getProgramForWallet(wallet);
  const connection = getConnection();
  const programId = program.programId;

  console.log(`[BUY] RPC: ${connection.rpcEndpoint}`);
  console.log(`[BUY] Program ID: ${programId.toBase58()}`);

  const buyerProfilePda = findBuyerProfilePda(buyer, programId);

  console.time("fetch-data");
  const [config, round, buyerProfile, { blockhash, lastValidBlockHeight }] =
    await Promise.all([
      fetchConfig(program),
      fetchRound(program, input.roundId),
      fetchBuyerProfile(program, buyer).catch(() => null),
      connection.getLatestBlockhash("confirmed"),
    ]);
  console.timeEnd("fetch-data");

  if (!config) throw new Error("Protocol not initialized");
  if (config.paused) throw new Error("Protocol is paused");
  if (!round) throw new Error(`Round ${input.roundId} not found`);

  const mintStr = input.paymentMint.toBase58();
  if (
    mintStr !== config.usdc_mint.toBase58() &&
    mintStr !== config.usdt_mint.toBase58()
  ) {
    throw new Error("Invalid payment mint (must be USDC or USDT)");
  }

  const purchaseCount = buyerProfile?.purchase_count ?? 0n;

  const purchasePda = findPurchasePda(buyer, purchaseCount, programId);
  const statisticsPda = findStatisticsPda(programId);

  const buyerTokenAccount = await getAssociatedTokenAddress(
    input.paymentMint,
    buyer,
  );
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    input.paymentMint,
    config.treasury,
  );

  const preInstructions: TransactionInstruction[] = [];

  console.time("fetch-ata-info");
  const [buyerAtaInfo, treasuryAtaInfo] = await Promise.all([
    connection.getAccountInfo(buyerTokenAccount),
    connection.getAccountInfo(treasuryTokenAccount),
  ]);
  console.timeEnd("fetch-ata-info");

  if (!buyerAtaInfo) {
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        buyer,
        buyerTokenAccount,
        buyer,
        input.paymentMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }

  if (!treasuryAtaInfo) {
    preInstructions.push(
      createAssociatedTokenAccountInstruction(
        buyer,
        treasuryTokenAccount,
        config.treasury,
        input.paymentMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }

  console.time("build-transaction");
  const buyIx = await program.methods
    .buy({ paymentAmount: new BN(input.paymentAmount.toString()) })
    .accounts({
      buyer,
      config: findConfigPda(programId),
      round: findRoundPda(input.roundId, programId),
      buyerProfile: buyerProfilePda,
      purchase: purchasePda,
      buyerTokenAccount,
      treasuryTokenAccount,
      paymentMint: input.paymentMint,
      gaiaMint: config.gaia_mint,
      statistics: statisticsPda,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  const allInstructions = [...preInstructions, buyIx];
  const messageV0 = new TransactionMessage({
    payerKey: buyer,
    recentBlockhash: blockhash,
    instructions: allInstructions,
  }).compileToV0Message();
  const transaction = new VersionedTransaction(messageV0);
  console.timeEnd("build-transaction");

  console.log(`[BUY] Instructions: ${allInstructions.length}`);
  console.log(`[BUY] Compiled accounts: ${messageV0.staticAccountKeys.length}`);
  console.log(`[BUY] Transaction size: ${transaction.serialize().length} bytes`);

  console.time("wallet-send");
  let signature: string;
  try {
    signature = await wallet.sendTransaction(transaction, connection);
  } catch (err) {
    console.error("[BUY] sendTransaction error:", err);
    throw err;
  }
  console.timeEnd("wallet-send");

  console.time("confirm-transaction");
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  console.timeEnd("confirm-transaction");

  console.log(`[BUY] Signature: ${signature}`);

  return {
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`,
  };
}
