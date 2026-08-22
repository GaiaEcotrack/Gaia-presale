// Narrow structural wallet interface for program instructions.
//
// Instructions accept this minimal shape instead of WalletContextState so
// callers can pass the real adapter context (Phantom/Solflare/Backpack) or a
// test double. Any full WalletContextState satisfies it — backward compatible.
// Replaces the previous `(window as any).solana` casts which broke non-Phantom
// wallets.

import type {
  Connection,
  PublicKey,
  SendOptions,
  Transaction,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js'

export type SendTransactionFn = (
  transaction: Transaction | VersionedTransaction,
  connection: Connection,
  options?: SendOptions & { signerKeypairs?: never[] },
) => Promise<TransactionSignature>

export type SignTransactionFn = <T extends Transaction | VersionedTransaction>(
  transaction: T,
) => Promise<T>

export interface SignerWallet {
  publicKey: PublicKey | null
  sendTransaction?: SendTransactionFn
  signTransaction?: SignTransactionFn
}

/** Options shared by executeBuy / executeClaim. */
export interface ExecuteInstructionOptions {
  /**
   * true  (default) — preserves legacy behavior: resolves only after the
   *                  RPC confirms the transaction.
   * false           — resolves immediately after the wallet signs AND the
   *                  transaction is sent to the network (a real signature
   *                  exists). Confirmation/polling becomes the caller's job.
   */
  awaitConfirmation?: boolean
}
