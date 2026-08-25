// Deterministic transaction fixtures for server verification tests.
//
// These fixtures are BUILT with the real BorshAccountsCoder and the real IDL
// discriminators, so decoding exercises the production code path end-to-end.
// No Devnet access is required — the "chain" is a Map of encoded accounts and
// a getTransaction that returns the assembled VersionedTransactionResponse.

import { PublicKey, type VersionedTransactionResponse } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { BN, BorshAccountsCoder, type Idl } from '@coral-xyz/anchor'
import idl from '@/lib/anchor/idl.json'
import { PROGRAM_ID } from '@/lib/anchor/config'
import {
  findConfigPda,
  findRoundPda,
  findPurchasePda,
  findGaiaVaultPda,
} from '@/lib/anchor/pda'

const coder = new BorshAccountsCoder(idl as unknown as Idl)

export const BUY_DISCRIMINATOR = Buffer.from([102, 6, 61, 18, 1, 218, 235, 234])
export const CLAIM_DISCRIMINATOR = Buffer.from([62, 198, 214, 193, 213, 159, 108, 210])

// Account discriminators from idl.json (accounts section)
const CONFIG_DISC = Buffer.from([155, 12, 170, 224, 30, 250, 204, 130])
const ROUND_DISC = Buffer.from([87, 127, 165, 51, 73, 78, 116, 174])
const PURCHASE_DISC = Buffer.from([33, 203, 1, 252, 231, 228, 8, 67])

/* ------------------------------------------------------------------ */
/* Manual borsh writers — mirror the IDL field order EXACTLY.          */
/* (BorshAccountsCoder.encode chokes on unit enums; the DECODE side    */
/* still uses the real coder so fixtures are validated for real.)      */
/* ------------------------------------------------------------------ */

function u8(v: number): Buffer {
  return Buffer.from([v & 0xff])
}
function u64(v: bigint | number): Buffer {
  const b = Buffer.alloc(8)
  b.writeBigUInt64LE(BigInt(v))
  return b
}
function i64(v: bigint | number): Buffer {
  const b = Buffer.alloc(8)
  b.writeBigInt64LE(BigInt(v))
  return b
}
function pubkey(p: PublicKey): Buffer {
  return p.toBuffer()
}
function borshString(s: string): Buffer {
  const bytes = Buffer.from(s, 'utf8')
  const len = Buffer.alloc(4)
  len.writeUInt32LE(bytes.length)
  return Buffer.concat([len, bytes])
}

// Deterministic keys (seed-derived, stable across runs).
function seededKeypair(seed: number): Keypair {
  const s = new Uint8Array(32).fill(seed)
  return Keypair.fromSeed(s)
}

export const KEYS = {
  buyer: seededKeypair(1).publicKey,
  treasury: seededKeypair(2).publicKey,
  usdcMint: seededKeypair(3).publicKey,
  usdtMint: seededKeypair(4).publicKey,
  gaiaMint: seededKeypair(5).publicKey,
  buyerTokenAccount: seededKeypair(6).publicKey,
  treasuryTokenAccount: seededKeypair(7).publicKey,
  buyerGaiaAccount: seededKeypair(8).publicKey,
} as const

const programId = new PublicKey(PROGRAM_ID)
export const CONFIG_PDA = findConfigPda(programId)
export const ROUND_PDA = (id = 0) => findRoundPda(id, programId)
export const PURCHASE_PDA = findPurchasePda(KEYS.buyer, 0n, programId)
export const GAIA_VAULT_PDA = findGaiaVaultPda(programId)

export const TGE_SEC = 1_000
export const CLIFF_SEC = 15_552_000 // 6 months of 30d
export const DURATION_SEC = 10_368_000 // 4 months of 30d

export interface TokenBalanceEntryLike {
  accountIndex: number
  mint: string
  uiTokenAmount: { amount: string; decimals: number }
}

export interface SplInnerTransfer {
  programIndex: number
  accounts: number[]
  /** Builds a TransferChecked (disc 12) payload when mint provided. */
  amountBaseUnits: bigint
  decimals?: number
  mint?: string | null
  /** Force plain Transfer (disc 3) instead of TransferChecked. */
  plainTransfer?: boolean
}

export interface BuyTxOptions {
  /** Per-test buyer so wallets/signatures stay unique across DB runs. */
  buyer?: PublicKey
  paymentMint?: PublicKey
  gaiaMintInIx?: PublicKey
  paymentAmountBaseUnits?: bigint
  tokenAmountBaseUnits?: bigint
  purchaseWallet?: PublicKey
  buyerSigner?: boolean
  includeInnerTransfer?: boolean
  innerTransferSource?: PublicKey
  innerTransferDestination?: PublicKey
  innerTransferAmountOverride?: bigint
  plainTransfer?: boolean
  preBuyerAmount?: bigint | null
  postBuyerAmount?: bigint
  preTreasuryAmount?: bigint | null
  postTreasuryAmount?: bigint
  postBuyerMint?: string
  postTreasuryMint?: string
  buyerTokenAccountOverride?: PublicKey
  treasuryTokenAccountOverride?: PublicKey
  txMetaErr?: unknown
  returnNullTx?: boolean
  instructionProgramId?: PublicKey
  instructionDiscriminator?: Buffer
}

interface ChainAccountData {
  config: Record<string, unknown>
  round: Record<string, unknown>
  purchase: Record<string, unknown>
}
void (0 as unknown as ChainAccountData | null)

function encodeConfig(o: {
  admin: PublicKey
  treasury: PublicKey
  gaiaMint: PublicKey
  usdcMint: PublicKey
  usdtMint: PublicKey
  tgeTimestamp: number
  currentRound: number
  totalTokensSold: bigint
  totalUsdcRaised: bigint
  totalUsdtRaised: bigint
  paused: boolean
  gaiaVault: PublicKey
  legalAuthority: PublicKey
  legalCleared: boolean
  complianceAuthority: PublicKey
  bump: number
  gaiaVaultBump: number
}): Buffer {
  return Buffer.concat([
    CONFIG_DISC,
    pubkey(o.admin),
    pubkey(o.treasury),
    pubkey(o.gaiaMint),
    pubkey(o.usdcMint),
    pubkey(o.usdtMint),
    i64(o.tgeTimestamp),
    u8(o.currentRound),
    u64(o.totalTokensSold),
    u64(o.totalUsdcRaised),
    u64(o.totalUsdtRaised),
    u8(o.paused ? 1 : 0),
    pubkey(o.gaiaVault),
    pubkey(o.legalAuthority),
    u8(o.legalCleared ? 1 : 0),
    pubkey(o.complianceAuthority),
    u8(o.bump),
    u8(o.gaiaVaultBump),
  ])
}

function encodeRound(o: {
  id: number
  name: string
  priceMicroUsd: bigint | number
  tokensAvailable: bigint | number
  tokensSold: bigint | number
  startTime: bigint | number
  endTime: bigint | number
  cliffSeconds: bigint | number
  vestingDurationSeconds: bigint | number
  minimumPurchase: bigint | number
  maximumPurchase: bigint | number
  maximumPerWallet: bigint | number
  whitelistEnabled: boolean
  roundTypeVariant: number // index per IDL enum order (0 Seed / 1 Public)
  statusVariant: number // index per IDL enum order (0 Upcoming / 1 Active …)
  bump: number
}): Buffer {
  return Buffer.concat([
    ROUND_DISC,
    u8(o.id),
    borshString(o.name),
    u64(o.priceMicroUsd),
    u64(o.tokensAvailable),
    u64(o.tokensSold),
    i64(o.startTime),
    i64(o.endTime),
    i64(o.cliffSeconds),
    i64(o.vestingDurationSeconds),
    u64(o.minimumPurchase),
    u64(o.maximumPurchase),
    u64(o.maximumPerWallet),
    u8(o.whitelistEnabled ? 1 : 0),
    u8(o.roundTypeVariant),
    u8(o.statusVariant),
    u8(o.bump),
  ])
}

function encodePurchase(o: {
  wallet: PublicKey
  roundId: number
  purchaseNumber: bigint
  paymentAmount: bigint
  paymentMint: PublicKey
  tokenAmount: bigint
  claimedAmount: bigint
  priceMicroUsd: bigint | number
  timestamp: number
  bump: number
}): Buffer {
  return Buffer.concat([
    PURCHASE_DISC,
    pubkey(o.wallet),
    u8(o.roundId),
    u64(o.purchaseNumber),
    u64(o.paymentAmount),
    pubkey(o.paymentMint),
    u64(o.tokenAmount),
    u64(o.claimedAmount),
    u64(o.priceMicroUsd),
    i64(o.timestamp),
    u8(o.bump),
  ])
}

export function buildChainAccounts(opts: BuyTxOptions = {}): Map<string, Buffer> & { purchasePda: PublicKey } {
  const chain = new Map<string, Buffer>() as Map<string, Buffer> & { purchasePda: PublicKey }
  const buyer = opts.buyer ?? KEYS.buyer
  const purchasePda = findPurchasePda(buyer, 0n, programId)

  chain.set(
    CONFIG_PDA.toBase58(),
    encodeConfig({
      admin: KEYS.treasury,
      treasury: KEYS.treasury,
      gaiaMint: KEYS.gaiaMint,
      usdcMint: KEYS.usdcMint,
      usdtMint: KEYS.usdtMint,
      tgeTimestamp: TGE_SEC,
      currentRound: 0,
      totalTokensSold: 0n,
      totalUsdcRaised: 0n,
      totalUsdtRaised: 0n,
      paused: false,
      gaiaVault: GAIA_VAULT_PDA,
      legalAuthority: KEYS.treasury,
      legalCleared: true,
      complianceAuthority: KEYS.treasury,
      bump: 255,
      gaiaVaultBump: 254,
    }),
  )

  chain.set(
    ROUND_PDA(0).toBase58(),
    encodeRound({
      id: 0,
      name: 'Test Round',
      priceMicroUsd: 10_000,
      tokensAvailable: 1_000_000_000_000n,
      tokensSold: 0n,
      startTime: 0n,
      endTime: 9_999_999_999n,
      cliffSeconds: CLIFF_SEC,
      vestingDurationSeconds: DURATION_SEC,
      minimumPurchase: 0n,
      maximumPurchase: 0n,
      maximumPerWallet: 0n,
      whitelistEnabled: false,
      roundTypeVariant: 1,
      statusVariant: 1,
      bump: 253,
    }),
  )

  const paymentAmount = opts.paymentAmountBaseUnits ?? 250_000_000n
  const tokenAmount = opts.tokenAmountBaseUnits ?? 25_000_000_000n
  chain.set(
    purchasePda.toBase58(),
    encodePurchase({
      wallet: opts.purchaseWallet ?? buyer,
      roundId: 0,
      purchaseNumber: 0n,
      paymentAmount,
      paymentMint: opts.paymentMint ?? KEYS.usdcMint,
      tokenAmount,
      claimedAmount: 0n,
      priceMicroUsd: 10_000,
      timestamp: TGE_SEC + 60,
      bump: 252,
    }),
  )

  chain.purchasePda = purchasePda
  return chain
}

/** Encodes an SPL token transfer instruction data buffer. */
export function splTransferData(
  amountBaseUnits: bigint,
  kind: 'checked' | 'plain',
  decimals = 6,
): Buffer {
  if (kind === 'plain') {
    const buf = Buffer.alloc(9)
    buf[0] = 3
    buf.writeBigUInt64LE(amountBaseUnits, 1)
    return buf
  }
  const buf = Buffer.alloc(10)
  buf[0] = 12
  buf.writeBigUInt64LE(amountBaseUnits, 1)
  buf[9] = decimals
  return buf
}

/**
 * Assembles a synthetic versioned transaction response for BUY or CLAIM.
 */
export async function buildTransaction(
  variant: 'buy' | 'claim',
  opts: BuyTxOptions = {},
): Promise<{
  tx: VersionedTransactionResponse
  chainAccounts: Map<string, Buffer>
  signature: string
}> {
  const chainAccounts = buildChainAccounts(opts)
  const purchasePda: PublicKey = chainAccounts.purchasePda
  const effectiveBuyer: PublicKey = opts.buyer ?? KEYS.buyer

  const buyerTa = opts.buyerTokenAccountOverride ?? KEYS.buyerTokenAccount
  const treasuryTa = opts.treasuryTokenAccountOverride ?? KEYS.treasuryTokenAccount

  // Static account key layout — MUST follow the IDL positional order.
  const BUYER_PROFILE_DUMMY = seededKeypair(21).publicKey
  const STATISTICS_DUMMY = seededKeypair(22).publicKey
  const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  const SYSTEM_PROGRAM = new PublicKey('11111111111111111111111111111111')

  // IDL order (buy): buyer, config, round, buyer_profile, purchase,
  //                   buyer_token_account, treasury_token_account,
  //                   payment_mint, gaia_mint, statistics,
  //                   token_program, system_program
  const buyKeys: PublicKey[] = [
    effectiveBuyer, // 0 buyer (signer)
    CONFIG_PDA, // 1
    ROUND_PDA(0), // 2
    BUYER_PROFILE_DUMMY, // 3 buyer_profile
    purchasePda, // 4 purchase
    buyerTa, // 5
    treasuryTa, // 6
    opts.paymentMint ?? KEYS.usdcMint, // 7 payment_mint
    opts.gaiaMintInIx ?? KEYS.gaiaMint, // 8 gaia_mint
    STATISTICS_DUMMY, // 9 statistics
    TOKEN_PROGRAM, // 10 token_program
    SYSTEM_PROGRAM, // 11 system_program
  ]

  // IDL order (claim): buyer, config, round, buyer_profile, purchase,
  //                     gaia_vault, buyer_gaia_account, statistics,
  //                     gaia_mint, token_program
  const claimKeys: PublicKey[] = [
    effectiveBuyer, // 0 buyer (signer)
    CONFIG_PDA, // 1
    ROUND_PDA(0), // 2
    BUYER_PROFILE_DUMMY, // 3
    purchasePda, // 4
    GAIA_VAULT_PDA, // 5 gaia_vault
    KEYS.buyerGaiaAccount, // 6 buyer_gaia_account
    STATISTICS_DUMMY, // 7 statistics
    opts.gaiaMintInIx ?? KEYS.gaiaMint, // 8 gaia_mint
    TOKEN_PROGRAM, // 9 token_program
  ]

  const keys: PublicKey[] = [...(variant === 'buy' ? buyKeys : claimKeys), programId]

  const disc = opts.instructionDiscriminator ?? (variant === 'buy' ? BUY_DISCRIMINATOR : CLAIM_DISCRIMINATOR)
  const paymentAmount = opts.paymentAmountBaseUnits ?? 250_000_000n
  const mainIxData = Buffer.concat([disc, (() => {
    const b = Buffer.alloc(8)
    b.writeBigUInt64LE(paymentAmount)
    return b
  })()])

  const mainIx = {
    programIdIndex: keys.length - 1, // program is the LAST key in both layouts
    accountKeyIndexes:
      variant === 'buy'
        ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] // through statistics; programs implied
        : [0, 1, 2, 3, 4, 5, 6, 7, 8],
    data: mainIxData.toString('base64'),
  }

  // Inner SPL transfer inside the buy/claim instruction
  const includeTransfer = opts.includeInnerTransfer ?? true
  const transferAmount = opts.innerTransferAmountOverride ?? paymentAmount
  const transferKind = opts.plainTransfer ? 'plain' : 'checked'

  const fullKeys = [...keys]
  const tokenProgIdx = fullKeys.findIndex(
    (k) => k.toBase58() === new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBase58(),
  )

  let innerInstructions: { index: number; instructions: unknown[] }[] = []
  if (includeTransfer) {
    const srcIdx =
      variant === 'buy'
        ? fullKeys.findIndex((k) => k.toBase58() === (opts.innerTransferSource ?? buyerTa).toBase58())
        : fullKeys.findIndex((k) => k.toBase58() === (opts.innerTransferSource ?? GAIA_VAULT_PDA).toBase58())
    const dstIdx =
      variant === 'buy'
        ? fullKeys.findIndex((k) => k.toBase58() === (opts.innerTransferDestination ?? treasuryTa).toBase58())
        : fullKeys.findIndex((k) => k.toBase58() === (opts.innerTransferDestination ?? KEYS.buyerGaiaAccount).toBase58())

    const transferMint =
      variant === 'buy'
        ? (opts.paymentMint ?? KEYS.usdcMint).toBase58()
        : (opts.gaiaMintInIx ?? KEYS.gaiaMint).toBase58()
    const accounts =
      transferKind === 'checked'
        ? [srcIdx, fullKeys.findIndex((k) => k.toBase58() === transferMint), dstIdx, 0]
        : [srcIdx, dstIdx, 0]

    innerInstructions = [
      {
        index: 0,
        instructions: [
          {
            programIdIndex: tokenProgIdx,
            accountKeyIndexes: accounts,
            data: splTransferData(
              transferAmount,
              transferKind === 'checked' ? 'checked' : 'plain',
              6,
            ).toString('base64'),
          },
        ],
      },
    ]
  }

  // Token balances: indices into fullKeys
  const idxOf = (pk: PublicKey): number =>
    fullKeys.findIndex((k) => k.toBase58() === pk.toBase58())
  const mintForBalances = variant === 'buy' ? (opts.paymentMint ?? KEYS.usdcMint).toBase58() : KEYS.gaiaMint.toBase58()
  const buyerSideAcct = variant === 'buy' ? buyerTa : KEYS.buyerGaiaAccount
  const counterpartyAcct = variant === 'buy' ? treasuryTa : GAIA_VAULT_PDA

  const preTokenBalances: TokenBalanceEntryLike[] = []
  const postTokenBalances: TokenBalanceEntryLike[] = []

  if (variant === 'buy') {
    const defaultPreBuyer = 250_000_000n
    const defaultPostBuyer = 0n
    const defaultPreTreasury = 1_000_000_000n
    const defaultPostTreasury = 1_000_000_000n + paymentAmount
    const preB = opts.preBuyerAmount === null ? null : (opts.preBuyerAmount ?? defaultPreBuyer)
    const postB = opts.postBuyerAmount ?? defaultPostBuyer
    const preT = opts.preTreasuryAmount === null ? null : (opts.preTreasuryAmount ?? defaultPreTreasury)
    const postT = opts.postTreasuryAmount ?? defaultPostTreasury

    if (preB !== null) {
      preTokenBalances.push({
        accountIndex: idxOf(buyerSideAcct),
        mint: mintForBalances,
        uiTokenAmount: { amount: preB.toString(), decimals: 6 },
      })
    }
    postTokenBalances.push({
      accountIndex: idxOf(buyerSideAcct),
      mint: opts.postBuyerMint ?? mintForBalances,
      uiTokenAmount: { amount: postB.toString(), decimals: 6 },
    })
    if (preT !== null) {
      preTokenBalances.push({
        accountIndex: idxOf(counterpartyAcct),
        mint: mintForBalances,
        uiTokenAmount: { amount: preT.toString(), decimals: 6 },
      })
    }
    postTokenBalances.push({
      accountIndex: idxOf(counterpartyAcct),
      mint: opts.postTreasuryMint ?? mintForBalances,
      uiTokenAmount: { amount: postT.toString(), decimals: 6 },
    })
  } else {
    const defaultPreVault = 500_000_000n
    const defaultPostVault = defaultPreVault - transferAmount
    const defaultPreBuyer = opts.preBuyerAmount ?? 0n
    const defaultPostBuyer = defaultPreBuyer + transferAmount

    const preVault = opts.preTreasuryAmount === null ? null : (opts.preTreasuryAmount ?? defaultPreVault)
    const postVault = opts.postTreasuryAmount ?? defaultPostVault

    if (preVault !== null) {
      preTokenBalances.push({
        accountIndex: idxOf(GAIA_VAULT_PDA),
        mint: mintForBalances,
        uiTokenAmount: { amount: preVault.toString(), decimals: 6 },
      })
    }
    postTokenBalances.push({
      accountIndex: idxOf(GAIA_VAULT_PDA),
      mint: opts.postTreasuryMint ?? mintForBalances,
      uiTokenAmount: { amount: postVault.toString(), decimals: 6 },
    })

    if (defaultPreBuyer > 0n || true) {
      // buyer side always gets a post entry; pre entry only when non-zero or forced
      if (opts.preBuyerAmount !== null && opts.preBuyerAmount !== undefined && opts.preBuyerAmount > 0n) {
        preTokenBalances.push({
          accountIndex: idxOf(KEYS.buyerGaiaAccount),
          mint: mintForBalances,
          uiTokenAmount: { amount: defaultPreBuyer.toString(), decimals: 6 },
        })
      }
      postTokenBalances.push({
        accountIndex: idxOf(KEYS.buyerGaiaAccount),
        mint: opts.postBuyerMint ?? mintForBalances,
        uiTokenAmount: { amount: defaultPostBuyer.toString(), decimals: 6 },
      })
    }
  }

  const tx = {
    slot: 123456,
    blockTime: 1_700_000_000,
    meta: {
      err: opts.txMetaErr ?? null,
      fee: 5000,
      preTokenBalances,
      postTokenBalances,
      innerInstructions,
      loadedAddresses: undefined,
    },
    transaction: {
      message: {
        header: { numRequiredSignatures: opts.buyerSigner === false ? 0 : 1 },
        staticAccountKeys: fullKeys,
        compiledInstructions: [mainIx],
      },
    },
  } as unknown as VersionedTransactionResponse

  return {
    tx,
    chainAccounts,
    signature: VALID_SIGNATURE,
  }
}

/** A syntactically valid 88-char base58 signature used across fixtures. */
export const VALID_SIGNATURE =
  '5k8F3uW9J12v4xY7z6aB8cD1eF2gH3jK4mN5mN6oP7qR8sT9uV1wX2yZ3aB4cD5eF6gH7jK8mN9mN1oP2qR34567'

export function makeConnectionStub(
  txOrNull: VersionedTransactionResponse | null,
  chainAccounts: Map<string, Buffer>,
  overrides: { getTransaction?: () => Promise<unknown> } = {},
): import('@/lib/server/rpc').VerifyRpcClient {
  const hangOrTx = overrides.getTransaction ?? (async () => txOrNull)
  const stub = {
    getTransactionJsonParsed: hangOrTx,
    getTransaction: hangOrTx,
    getAccountInfo: async (address: PublicKey) => {
      const data = chainAccounts.get(address.toBase58())
      return data ? { data } : null
    },
  }
  return stub as unknown as import('@/lib/server/rpc').VerifyRpcClient
}
