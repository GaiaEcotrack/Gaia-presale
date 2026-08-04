import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  SystemProgram,
  type TransactionInstruction,
  Transaction,
  type PublicKey,
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
  if (!wallet.signTransaction) throw new Error("Wallet does not support signing");

  const buyer: PublicKey = wallet.publicKey;
  const program = getProgramForWallet(wallet);
  const connection = getConnection();
  const programId = program.programId;

  const config = await fetchConfig(program);
  if (!config) throw new Error("Protocol not initialized");
  if (config.paused) throw new Error("Protocol is paused");

  const round = await fetchRound(program, input.roundId);
  if (!round) throw new Error(`Round ${input.roundId} not found`);

  const mintStr = input.paymentMint.toBase58();
  if (
    mintStr !== config.usdc_mint.toBase58() &&
    mintStr !== config.usdt_mint.toBase58()
  ) {
    throw new Error("Invalid payment mint (must be USDC or USDT)");
  }

  const buyerProfilePda = findBuyerProfilePda(buyer, programId);
  const statisticsPda = findStatisticsPda(programId);

  let purchaseCount = 0n;
  try {
    const profile = await fetchBuyerProfile(program, buyer);
    purchaseCount = profile?.purchase_count ?? 0n;
  } catch {
    // First purchase
  }

  const purchasePda = findPurchasePda(buyer, purchaseCount, programId);

  const buyerTokenAccount = await getAssociatedTokenAddress(
    input.paymentMint,
    buyer,
  );
  const treasuryTokenAccount = await getAssociatedTokenAddress(
    input.paymentMint,
    config.treasury,
  );

  const preInstructions: TransactionInstruction[] = [];

  const [buyerAtaInfo, treasuryAtaInfo] = await Promise.all([
    connection.getAccountInfo(buyerTokenAccount),
    connection.getAccountInfo(treasuryTokenAccount),
  ]);

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
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  const transaction = new Transaction({
    feePayer: buyer,
    blockhash,
    lastValidBlockHeight,
  }).add(...allInstructions);

  const signed = await wallet.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize());
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );

  return {
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`,
  };
}
