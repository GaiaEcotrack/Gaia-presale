import { AnchorProvider, Program, type Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, RPC_URL } from "./config";
import idlRaw from "./idl.json";

const IDL = idlRaw as unknown as Idl;
const PROGRAM_PUBLIC_KEY = new PublicKey(PROGRAM_ID);

export function getConnection(): Connection {
  return new Connection(RPC_URL, {
    commitment: "confirmed",
    confirmTransactionInitialTimeout: 60_000,
  });
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getProgramForWallet(wallet: any): Program {
  const connection = getConnection();
  const provider = new AnchorProvider(connection, wallet as any, {
    commitment: "confirmed",
  });
  return new Program(IDL, provider);
}
