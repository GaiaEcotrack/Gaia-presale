import { PublicKey } from "@solana/web3.js";

export function findConfigPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId,
  )[0];
}

export function findStatisticsPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("statistics")],
    programId,
  )[0];
}

export function findGaiaVaultPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("gaia_vault")],
    programId,
  )[0];
}

export function findRoundPda(id: number, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("round"), Buffer.from([id])],
    programId,
  )[0];
}

export function findBuyerProfilePda(
  wallet: PublicKey,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("buyer_profile"), wallet.toBuffer()],
    programId,
  )[0];
}

export function findPurchasePda(
  wallet: PublicKey,
  purchaseNumber: bigint,
  programId: PublicKey,
): PublicKey {
  const buf = Buffer.alloc(8);
  buf.writeUInt32LE(Number(purchaseNumber & BigInt(0xffffffff)), 0);
  buf.writeUInt32LE(Number((purchaseNumber >> BigInt(32)) & BigInt(0xffffffff)), 4);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("purchase"), wallet.toBuffer(), buf],
    programId,
  )[0];
}
