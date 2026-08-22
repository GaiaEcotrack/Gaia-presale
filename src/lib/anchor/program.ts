import { AnchorProvider, Program, type Idl } from "@coral-xyz/anchor";
import type { Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, RPC_URL } from "./config";
import type { SignerWallet } from "./wallet";
import idlRaw from "./idl.json";

const IDL = idlRaw as unknown as Idl;
const PROGRAM_PUBLIC_KEY = new PublicKey(PROGRAM_ID);

// Single shared connection — prevents duplicate RPC client instances across
// hooks/components (performance requirement: no redundant identical requests).
let cachedConnection: Connection | null = null;

export function getConnection(): Connection {
  if (!cachedConnection) {
    cachedConnection = new Connection(RPC_URL, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 60_000,
    });
  }
  return cachedConnection;
}

export function getReadProgram(): Program {
  const connection = getConnection();
  const dummyWallet = {
    publicKey: PublicKey.default,
    signTransaction: async () => {
      throw new Error("Read-only");
    },
    signAllTransactions: async () => {
      throw new Error("Read-only");
    },
  };
  const provider = new AnchorProvider(connection, dummyWallet as any, {
    commitment: "confirmed",
  });
  return new Program(IDL, provider);
}

export function getProgramForWallet(wallet: SignerWallet): Program {
  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet as unknown as Wallet, {
    commitment: "confirmed",
  });
  return new Program(IDL, provider);
}
