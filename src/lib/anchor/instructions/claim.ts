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
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { getProgramForWallet, getConnection } from "../program";
import {
  findConfigPda,
  findRoundPda,
  findBuyerProfilePda,
  findPurchasePda,
  findGaiaVaultPda,
} from "../pda";
import { fetchConfig, fetchRound, fetchBuyerProfile, fetchPurchase } from "../fetch";
import { CLUSTER } from "../config";
import type { PublicKey } from "@solana/web3.js";

export interface ClaimInput {
  roundId: number;
  purchaseNumber: bigint;
}

export async function executeClaim(
  wallet: WalletContextState,
  input: ClaimInput,
): Promise<{ signature: string; explorerUrl: string }> {
  if (!wallet.publicKey) throw new Error("Wallet not connected");
  if (!wallet.signTransaction) throw new Error("Wallet does not support signing");

  const buyer = wallet.publicKey;
  const program = getProgramForWallet(wallet);
  const connection = getConnection();
  const programId = program.programId;

  const config = await fetchConfig(program);
  if (!config) throw new Error("Protocol not initialized");
  if (config.paused) throw new Error("Protocol is paused");

  const round = await fetchRound(program, input.roundId);
  if (!round) throw new Error(`Round ${input.roundId} not found`);

  const purchase = await fetchPurchase(program, buyer, input.purchaseNumber);
  if (!purchase) throw new Error("Purchase not found");

  const buyerProfile = await fetchBuyerProfile(program, buyer);

  const configPda = findConfigPda(programId);
  const roundPda = findRoundPda(input.roundId, programId);
  const buyerProfilePda = findBuyerProfilePda(buyer, programId);
  const purchasePda = findPurchasePda(buyer, input.purchaseNumber, programId);
  const gaiaVaultPda = findGaiaVaultPda(programId);

  const buyerGaiaAccount = await getAssociatedTokenAddress(
    config.gaia_mint,
    buyer,
  );

  const preInstructions: TransactionInstruction[] = [];
  const ataInfo = await connection.getAccountInfo(buyerGaiaAccount);
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
      gaiaMint: config.gaia_mint,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();

  const allInstructions = [...preInstructions, claimIx];
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
