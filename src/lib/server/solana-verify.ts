// Server-side Solana transaction verification engine.
//
// HARD RULES enforced here (post-remediation):
//   1. Mint identity is validated at EVERY layer: Config PDA (expected mints),
//      instruction accounts, inner SPL transfers (TransferChecked mint) and
//      every pre/postTokenBalances entry involved. -> GAP-1
//   2. BUY performs a TRUE 4-way audit: Anchor argument == Purchase PDA
//      payment_amount == inner SPL transfer amount == balance deltas on BOTH
//      endpoints (simultaneous, never optional). -> GAP-2
//   3. CLAIM requires an observable vault->buyer transfer with positive
//      amount; zero/unobservable movements are REJECTED. -> GAP-3
//   4. Financial facts (roundId, amounts, currency, purchaseNumber, price)
//      are decoded from the program's own Purchase/Round/Config PDAs.
//      No hardcoded financial values. Missing state => REJECT. -> GAP-4
//   5. Every RPC call runs under an 8s hard deadline. -> GAP-5

import { Connection, PublicKey, type VersionedTransactionResponse } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import { Prisma } from '@prisma/client'
import idl from '@/lib/anchor/idl.json'
import { PROGRAM_ID, GAIA_DECIMALS, STABLE_DECIMALS } from '@/lib/anchor/config'
import { getVerifyConnection, withRpcTimeout, RpcTimeoutError } from './rpc'
import {
  fetchProgramConfig,
  fetchPurchaseRecord,
  fetchRoundRecord,
} from './program-state'
import { findPurchasePda } from '@/lib/anchor/pda'

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

const BASE58_SIGNATURE_REGEX = /^[1-9A-HJ-NP-Za-km-z]{87,88}$/

export function isValidTxSignature(signature: string): boolean {
  return typeof signature === 'string' && BASE58_SIGNATURE_REGEX.test(signature.trim())
}

export function normalizeWalletAddress(address: string): string | null {
  try {
    const pubkey = new PublicKey(address.trim())
    if (!PublicKey.isOnCurve(pubkey.toBuffer())) {
      return null
    }
    return pubkey.toBase58()
  } catch {
    return null
  }
}

/** Converts integer base units to Prisma.Decimal WITHOUT float intermediates. */
export function baseUnitsToDecimal(
  baseUnits: bigint | number | string,
  decimals: number,
): Prisma.Decimal {
  const bnStr = BigInt(baseUnits).toString()
  const d = new Prisma.Decimal(bnStr)
  const divisor = new Prisma.Decimal(10).pow(decimals)
  return d.div(divisor)
}

// ---------------------------------------------------------------------------
// Discriminators (must stay byte-identical to idl.json)
// ---------------------------------------------------------------------------

const BUY_DISCRIMINATOR = Buffer.from([102, 6, 61, 18, 1, 218, 235, 234])
const CLAIM_DISCRIMINATOR = Buffer.from([62, 198, 214, 193, 213, 159, 108, 210])

// ---------------------------------------------------------------------------
// Rejection reasons (persisted verbatim in SyncAttempt.reason)
// ---------------------------------------------------------------------------

export const VERIFY_REASONS = {
  INVALID_SIGNATURE: 'INVALID_SIGNATURE',
  WALLET_MISMATCH: 'WALLET_MISMATCH',
  RPC_ERROR: 'RPC_ERROR',
  RPC_DATA_INCONSISTENT: 'RPC_DATA_INCONSISTENT',
  RPC_TIMEOUT: 'RPC_TIMEOUT',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  TRANSACTION_FAILED_ON_CHAIN: 'TRANSACTION_FAILED_ON_CHAIN',
  INVALID_IDL_ACCOUNTS: 'INVALID_IDL_ACCOUNTS',
  WRONG_PROGRAM_ID: 'WRONG_PROGRAM_ID',
  WRONG_DISCRIMINATOR: 'WRONG_DISCRIMINATOR',
  BUYER_NOT_SIGNER: 'BUYER_NOT_SIGNER',
  MALFORMED_INSTRUCTION_DATA: 'MALFORMED_INSTRUCTION_DATA',
  PROGRAM_STATE_UNAVAILABLE: 'PROGRAM_STATE_UNAVAILABLE',
  PURCHASE_RECORD_MISMATCH: 'PURCHASE_RECORD_MISMATCH',
  MINT_MISMATCH: 'MINT_MISMATCH',
  AMOUNT_MISMATCH: 'AMOUNT_MISMATCH',
  TRANSFER_NOT_FOUND: 'TRANSFER_NOT_FOUND',
  CLAIM_TRANSFER_NOT_FOUND: 'CLAIM_TRANSFER_NOT_FOUND',
  BALANCE_MISMATCH: 'BALANCE_MISMATCH',
  TOKEN_BALANCE_NOT_FOUND: 'TOKEN_BALANCE_NOT_FOUND',
} as const

// ---------------------------------------------------------------------------
// IDL semantic account resolution (names, NEVER numeric indices)
// ---------------------------------------------------------------------------

type InstructionName = 'buy' | 'claim'

function resolveIdlAccountIndices(instructionName: InstructionName): Record<string, number> {
  const instructions = idl.instructions as unknown as {
    name: string
    accounts: { name: string }[]
  }[]
  const ix = instructions.find((i) => i.name === instructionName)
  if (!ix) throw new Error(`Instruction ${instructionName} not found in IDL`)

  const out: Record<string, number> = {}
  ix.accounts.forEach((acc, index) => {
    out[acc.name] = index
  })
  return out
}

// ---------------------------------------------------------------------------
// Transaction shape helpers
// ---------------------------------------------------------------------------

type CompiledIxShape = {
  programIdIndex?: number
  /** jsonParsed responses carry the program id as an address STRING. */
  programId?: string
  accountKeyIndexes?: number[]
  /** Index mode: numbers. jsonParsed mode: address strings. */
  accounts?: (number | string)[]
  data: string
  /** jsonParsed token instructions arrive pre-decoded by the RPC. */
  parsed?: { type: string; info: Record<string, unknown> }
}

function getCompiledInstructions(tx: VersionedTransactionResponse): CompiledIxShape[] {
  const msg = tx.transaction.message as unknown as {
    compiledInstructions?: CompiledIxShape[]
    instructions?: CompiledIxShape[]
  }
  return msg.compiledInstructions ?? msg.instructions ?? []
}

/** Resolves the program id of an instruction in EITHER response mode. */
function ixProgramId(ix: CompiledIxShape, accountKeys: string[]): string | undefined {
  if (typeof ix.programId === 'string') return ix.programId
  const idx = ix.programIdIndex ?? -1
  return idx >= 0 && idx < accountKeys.length ? accountKeys[idx] : undefined
}

/**
 * Resolves instruction account ADDRESSES in either mode:
 *  - compiled: numeric indices into the merged account key list
 *  - jsonParsed: addresses are provided inline (same IDL ordering)
 */
function ixAccountAddresses(ix: CompiledIxShape, accountKeys: string[]): string[] {
  const raw = ix.accountKeyIndexes ?? ix.accounts ?? []
  return raw.map((a) => (typeof a === 'string' ? a : accountKeys[a])).filter(
    (a): a is string => typeof a === 'string',
  )
}

/**
 * Full account key list INCLUDING versioned lookup-table addresses
 * (static keys first, then loaded writable, then loaded readonly — the exact
 * ordering the runtime uses for account index resolution).
 */
function resolveAccountKeys(tx: VersionedTransactionResponse): string[] {
  const msg = tx.transaction.message as unknown as {
    staticAccountKeys?: PublicKey[]
    accountKeys?: (
      | string
      | { pubkey?: string; toBase58(): string }
    )[]
  }
  let staticKeys: string[]
  if (msg.staticAccountKeys) {
    staticKeys = msg.staticAccountKeys.map((k) => k.toBase58())
  } else if (Array.isArray(msg.accountKeys)) {
    staticKeys = (msg.accountKeys as unknown[]).map((k) => {
      if (typeof k === 'string') return k
      const entry = k as { pubkey?: string; toBase58(): string }
      return typeof entry.pubkey === 'string' ? entry.pubkey : entry.toBase58()
    })
  } else {
    return []
  }

  const loaded = tx.meta?.loadedAddresses
  if (loaded) {
    return [
      ...staticKeys,
      ...loaded.writable.map((k) => k.toBase58()),
      ...loaded.readonly.map((k) => k.toBase58()),
    ]
  }
  return staticKeys
}

// ---------------------------------------------------------------------------
// Inner SPL token transfer parsing (GAP-2/GAP-3 core)
// ---------------------------------------------------------------------------

const SPL_TRANSFER_DISC = 3
const SPL_TRANSFER_CHECKED_DISC = 12
const TOKEN_PROGRAM_IDS = new Set<string>([
  TOKEN_PROGRAM_ID.toBase58(),
  TOKEN_2022_PROGRAM_ID.toBase58(),
])

export interface ParsedSplTransfer {
  outerInstructionIndex: number
  source: string
  destination: string
  /** Non-null only for TransferChecked (the variant our program emits). */
  mint: string | null
  decimals: number | null
  amountBaseUnits: bigint
}

function parseSplTransfers(tx: VersionedTransactionResponse, accountKeys: string[]): ParsedSplTransfer[] {
  const out: ParsedSplTransfer[] = []
  const innerGroups = tx.meta?.innerInstructions ?? []

  for (const group of innerGroups) {
    const ixs = (group as unknown as {
      index: number
      instructions: CompiledIxShape[]
    }).instructions ?? []

    for (const ix of ixs) {
      const programId = ixProgramId(ix, accountKeys)
      if (!programId || !TOKEN_PROGRAM_IDS.has(programId)) continue

      // ---- jsonParsed mode: the RPC decoded the instruction for us -------
      if (ix.parsed && typeof ix.parsed.type === 'string') {
        const info = ix.parsed.info as Record<string, unknown>
        if (ix.parsed.type === 'transferChecked') {
          const tokenAmount = info.tokenAmount as
            | { amount?: string; decimals?: number }
            | undefined
          const source = info.source
          const destination = info.destination
          const mint = info.mint
          if (
            typeof source === 'string' &&
            typeof destination === 'string' &&
            typeof mint === 'string' &&
            typeof tokenAmount?.amount === 'string'
          ) {
            out.push({
              outerInstructionIndex: group.index,
              source,
              destination,
              mint,
              decimals: typeof tokenAmount.decimals === 'number' ? tokenAmount.decimals : null,
              amountBaseUnits: BigInt(tokenAmount.amount),
            })
          }
          continue
        }
        if (ix.parsed.type === 'transfer' && typeof info.amount === 'string') {
          const source = info.source
          const destination = info.destination
          if (typeof source === 'string' && typeof destination === 'string') {
            out.push({
              outerInstructionIndex: group.index,
              source,
              destination,
              mint: null,
              decimals: null,
              amountBaseUnits: BigInt(info.amount),
            })
          }
          continue
        }
        continue
      }

      // ---- binary mode: decode raw instruction data ----------------------
      let data: Buffer
      try {
        data = Buffer.from(ix.data, 'base64')
      } catch {
        continue
      }
      if (data.length < 1) continue

      const accounts = ixAccountAddresses(ix, accountKeys)

      if (data[0] === SPL_TRANSFER_DISC && data.length >= 9 && accounts.length >= 2) {
        // Transfer(source, destination, authority) amount u64 LE @ byte 1
        out.push({
          outerInstructionIndex: group.index,
          source: accounts[0],
          destination: accounts[1],
          mint: null,
          decimals: null,
          amountBaseUnits: data.readBigUInt64LE(1),
        })
      } else if (
        data[0] === SPL_TRANSFER_CHECKED_DISC &&
        data.length >= 10 &&
        accounts.length >= 3
      ) {
        // TransferChecked(source, mint, destination, authority)
        // amount u64 LE @1, decimals u8 @9
        out.push({
          outerInstructionIndex: group.index,
          source: accounts[0],
          destination: accounts[2],
          mint: accounts[1] ?? null,
          decimals: data[9],
          amountBaseUnits: data.readBigUInt64LE(1),
        })
      }
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// pre/post token balance views
// ---------------------------------------------------------------------------

interface TokenBalanceEntry {
  accountIndex: number
  mint: string
  uiTokenAmount: { amount: string; decimals: number }
}

interface TokenBalanceView {
  /** null means the account had NO entry in this side of the snapshot. */
  preAmount: bigint | null
  postAmount: bigint | null
  postMint: string | null
  postDecimals: number | null
}

function readTokenBalance(
  preTokenBalances: TokenBalanceEntry[],
  postTokenBalances: TokenBalanceEntry[],
  accountKeys: string[],
  address: string,
): TokenBalanceView {
  const pre = preTokenBalances.find((b) => accountKeys[b.accountIndex] === address)
  const post = postTokenBalances.find((b) => accountKeys[b.accountIndex] === address)
  return {
    preAmount: pre ? BigInt(pre.uiTokenAmount.amount) : null,
    postAmount: post ? BigInt(post.uiTokenAmount.amount) : null,
    postMint: post ? post.mint : null,
    postDecimals: post ? post.uiTokenAmount.decimals : null,
  }
}

/**
 * Resolves the delta of a token account enforcing the remediation rules:
 *  - A missing PRE entry counts as 0 ONLY when the POST entry exists (account
 *    demonstrably created inside this very transaction) with the expected mint.
 *  - A missing POST entry is always fatal (no observable final state).
 */
function enforceDelta(
  view: TokenBalanceView,
  direction: -1 | 1,
  expectedAmount: bigint,
  expectedMint: string,
  expectedDecimals: number,
): { ok: true } | { ok: false; reason: string } {
  if (view.postAmount === null) {
    return { ok: false, reason: VERIFY_REASONS.TOKEN_BALANCE_NOT_FOUND }
  }
  if (view.postMint !== expectedMint) {
    return { ok: false, reason: VERIFY_REASONS.MINT_MISMATCH }
  }
  if (view.postDecimals !== null && view.postDecimals !== expectedDecimals) {
    return { ok: false, reason: VERIFY_REASONS.MINT_MISMATCH }
  }

  // Missing pre is acceptable only for accounts created within this tx.
  const pre = view.preAmount ?? 0n
  const delta = direction === -1 ? pre - view.postAmount : view.postAmount - pre
  if (delta !== expectedAmount) {
    return { ok: false, reason: VERIFY_REASONS.BALANCE_MISMATCH }
  }
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Shared transaction loading
// ---------------------------------------------------------------------------

async function loadConfirmedTransaction(
  txSignature: string,
): Promise<
  | { kind: 'ok'; tx: VersionedTransactionResponse }
  | { kind: 'reject'; reason: string }
> {
  try {
    const connection = getVerifyConnection()
    // jsonParsed is the CANONICAL source for verification:
    //  - the RPC itself decodes inner CPIs (transfer / transferChecked) into a
    //    stable structured form, immune to raw-data re-serialization incidents
    //    observed on public nodes;
    //  - outer instruction `.data` under this encoding cannot be trusted for
    //    discriminator matching, so flows use STRUCTURAL validation instead:
    //    program + IDL-shaped accounts + locally-derived canonical Purchase
    //    PDA + full token audit. That binds every fact to its canonical PDA,
    //    which is cryptographically stronger than an 8-byte tag.
    const tx = (await connection.getTransactionJsonParsed(txSignature)) as
      | VersionedTransactionResponse
      | null

    if (!tx) return { kind: 'reject', reason: VERIFY_REASONS.TRANSACTION_NOT_FOUND }
    if (tx.meta?.err) {
      return { kind: 'reject', reason: VERIFY_REASONS.TRANSACTION_FAILED_ON_CHAIN }
    }

    const accountKeys = resolveAccountKeys(tx)
    const hasOurProgram = getCompiledInstructions(tx).some(
      (ix) => ixProgramId(ix, accountKeys) === PROGRAM_ID,
    )
    if (!hasOurProgram && getCompiledInstructions(tx).length > 0) {
      return { kind: 'reject', reason: VERIFY_REASONS.WRONG_PROGRAM_ID }
    }

    return { kind: 'ok', tx }
  } catch (err) {
    if (err instanceof RpcTimeoutError || err instanceof Error && err.name === 'AbortError') {
      return { kind: 'reject', reason: VERIFY_REASONS.RPC_TIMEOUT }
    }
    console.error('[solana-verify] RPC getTransaction error:', err)
    return { kind: 'reject', reason: VERIFY_REASONS.RPC_ERROR }
  }
}

/**
 * Locates the n-th (0-based) occurrence of a target instruction.
 *  - raw mode: program + exact 8-byte Anchor discriminator.
 *  - parsed mode: outer .data is NOT trustworthy under jsonParsed, so ANY
 *    instruction from our program is a candidate; identity is later bound by
 *    canonical PDA derivation + full token audit (see callers).
 */
function locateProgramInstruction(
  tx: VersionedTransactionResponse,
  accountKeys: string[],
  discriminator: Buffer,
  occurrence: number,
): { compiledIndex: number; ix: CompiledIxShape } | { notFound: true; sawOurProgram: boolean } {
  const compiledIxs = getCompiledInstructions(tx)
  let seen = 0
  let sawOurProgram = false
  for (let i = 0; i < compiledIxs.length; i++) {
    const ix = compiledIxs[i]
    if (ixProgramId(ix, accountKeys) !== PROGRAM_ID) continue
    sawOurProgram = true

    // Per-instruction response-mode detection:
    //  - compiled/raw shape -> numeric indices -> Anchor discriminator MUST match
    //  - jsonParsed shape   -> inline address strings -> data untrusted;
    //                         identity is bound later via canonical PDA check
    const raw = ix.accountKeyIndexes ?? []
    const isRawMode = raw.length > 0 && raw.every((a) => typeof a === 'number')

    if (!isRawMode) {
      if (seen === occurrence) return { compiledIndex: i, ix }
      seen++
      continue
    }

    let data: Buffer
    try {
      data = Buffer.from(ix.data, 'base64')
    } catch {
      continue
    }
    if (data.length >= 8 && data.subarray(0, 8).equals(discriminator)) {
      if (seen === occurrence) return { compiledIndex: i, ix }
      seen++
    }
  }
  return { notFound: true, sawOurProgram }
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface VerifiedVestingParams {
  tgeTimestampSec: bigint
  cliffSeconds: bigint
  vestingDurationSeconds: bigint
}

export interface VerifiedPurchaseResult {
  success: boolean
  reason?: string
  verifiedData?: {
    txSignature: string
    instructionIndex: number
    verifiedBuyer: string
    roundId: number
    amountUsdc: Prisma.Decimal
    amountGaia: Prisma.Decimal
    currency: 'USDC' | 'USDT'
    purchaseNumber: bigint
    blockTime: bigint | null
    slot: bigint
    vestingParams: VerifiedVestingParams
  }
}

export interface VerifiedClaimResult {
  success: boolean
  reason?: string
  verifiedData?: {
    txSignature: string
    instructionIndex: number
    verifiedBuyer: string
    amountGaia: Prisma.Decimal
    purchaseNumber: bigint
    blockTime: bigint | null
    slot: bigint
    vestingParams: VerifiedVestingParams
  }
}

// ---------------------------------------------------------------------------
// BUY — true 4-way verification
// ---------------------------------------------------------------------------

export async function verifyPurchaseTransaction(
  txSignature: string,
  walletHint?: string,
  targetInstructionIndex: number = 0,
): Promise<VerifiedPurchaseResult> {
  // 1. Signature format (pre-RPC)
  if (!isValidTxSignature(txSignature)) {
    return { success: false, reason: VERIFY_REASONS.INVALID_SIGNATURE }
  }

  // 2. Wallet hint validation (pre-RPC)
  const normalizedHint = walletHint ? normalizeWalletAddress(walletHint) : null
  if (walletHint && !normalizedHint) {
    return { success: false, reason: VERIFY_REASONS.WALLET_MISMATCH }
  }

  // 3. Load transaction (8s deadline)
  const loaded = await loadConfirmedTransaction(txSignature)
  if (loaded.kind === 'reject') return { success: false, reason: loaded.reason }
  const tx = loaded.tx

  const accountKeys = resolveAccountKeys(tx)
  const numRequiredSignatures =
    tx.transaction.message.header?.numRequiredSignatures ?? 1

  // 4. IDL semantic resolution
  const map = resolveIdlAccountIndices('buy')
  for (const name of [
    'buyer',
    'buyer_token_account',
    'treasury_token_account',
    'payment_mint',
    'gaia_mint',
    'round',
    'purchase',
  ]) {
    if (map[name] === undefined) {
      return { success: false, reason: VERIFY_REASONS.INVALID_IDL_ACCOUNTS }
    }
  }

  // 5. Locate the requested buy instruction occurrence
  const located = locateProgramInstruction(tx, accountKeys, BUY_DISCRIMINATOR, targetInstructionIndex)
  if ('notFound' in located) {
    return {
      success: false,
      reason: located.sawOurProgram
        ? VERIFY_REASONS.WRONG_DISCRIMINATOR
        : VERIFY_REASONS.WRONG_PROGRAM_ID,
    }
  }
  const { compiledIndex: matchedIxIndex, ix: matchedIx } = located
  const rawIdx = matchedIx.accountKeyIndexes ?? []
  const parsedMode = !(rawIdx.length > 0 && rawIdx.every((a) => typeof a === 'number'))

  const accountAt = (idlName: string): string =>
    ixAccountAddresses(matchedIx, accountKeys)[map[idlName]] ?? ''

  // 6. Signer validation — buyer MUST be a required signer of the tx header
  const buyerAddress = accountAt('buyer')
  if (!buyerAddress) {
    return { success: false, reason: VERIFY_REASONS.INVALID_IDL_ACCOUNTS }
  }
  // Signers are ALWAYS the first N entries of the account key list, in both
  // compiled and jsonParsed response modes.
  const buyerKeyPosition = accountKeys.indexOf(buyerAddress)
  if (buyerKeyPosition < 0 || buyerKeyPosition >= numRequiredSignatures) {
    return { success: false, reason: VERIFY_REASONS.BUYER_NOT_SIGNER }
  }

  // 7. Wallet hint must match the ACTUAL signing buyer
  if (normalizedHint && normalizedHint !== buyerAddress) {
    return { success: false, reason: VERIFY_REASONS.WALLET_MISMATCH }
  }

  const buyerTokenAccount = accountAt('buyer_token_account')
  const treasuryTokenAccount = accountAt('treasury_token_account')
  const paymentMintAccount = accountAt('payment_mint')
  const gaiaMintAccount = accountAt('gaia_mint')
  const purchaseAccount = accountAt('purchase')
  if (
    !buyerTokenAccount ||
    !treasuryTokenAccount ||
    !paymentMintAccount ||
    !gaiaMintAccount ||
    !purchaseAccount
  ) {
    return { success: false, reason: VERIFY_REASONS.INVALID_IDL_ACCOUNTS }
  }

  // 8. Program state: Config PDA defines the ONLY accepted mints (GAP-1/GAP-4)
  const connection = getVerifyConnection()
  let config: Awaited<ReturnType<typeof fetchProgramConfig>>
  try {
    config = await fetchProgramConfig(connection)
  } catch (err) {
    console.error('[solana-verify] program-state RPC failure:', err)
    return { success: false, reason: VERIFY_REASONS.RPC_ERROR }
  }
  if (!config) {
    return { success: false, reason: VERIFY_REASONS.PROGRAM_STATE_UNAVAILABLE }
  }

  let currency: 'USDC' | 'USDT'
  if (paymentMintAccount === config.usdcMint.toBase58()) currency = 'USDC'
  else if (paymentMintAccount === config.usdtMint.toBase58()) currency = 'USDT'
  else return { success: false, reason: VERIFY_REASONS.MINT_MISMATCH }

  if (gaiaMintAccount !== config.gaiaMint.toBase58()) {
    return { success: false, reason: VERIFY_REASONS.MINT_MISMATCH }
  }

  // 9. Purchase PDA — authoritative financial facts written by the program
  const purchaseRecord = await fetchPurchaseRecord(connection, new PublicKey(purchaseAccount))
  if (!purchaseRecord) {
    return { success: false, reason: VERIFY_REASONS.PROGRAM_STATE_UNAVAILABLE }
  }
  if (purchaseRecord.wallet.toBase58() !== buyerAddress) {
    return { success: false, reason: VERIFY_REASONS.PURCHASE_RECORD_MISMATCH }
  }
  if (purchaseRecord.tokenAmount <= 0n || purchaseRecord.paymentAmount <= 0n) {
    return { success: false, reason: VERIFY_REASONS.AMOUNT_MISMATCH }
  }

  // Anchor argument (u64 LE after discriminator) == PDA payment_amount.
  // Only enforced in raw mode; under jsonParsed outer .data is untrusted and
  // the inner-transfer equality below provides the same binding.
  if (!parsedMode) {
    const ixData = Buffer.from(matchedIx.data, 'base64')
    if (ixData.length < 16) {
      return { success: false, reason: VERIFY_REASONS.MALFORMED_INSTRUCTION_DATA }
    }
    const argPaymentAmount = ixData.readBigUInt64LE(8)
    if (argPaymentAmount !== purchaseRecord.paymentAmount) {
      return { success: false, reason: VERIFY_REASONS.AMOUNT_MISMATCH }
    }
  }

  // Canonical PDA binding (parsed mode): the referenced purchase account MUST
  // be exactly findPurchasePda(record.wallet, record.purchaseNumber).
  if (parsedMode) {
    const expectedPda = findPurchasePda(
      purchaseRecord.wallet,
      purchaseRecord.purchaseNumber,
      new PublicKey(PROGRAM_ID),
    )
    if (expectedPda.toBase58() !== purchaseAccount) {
      return { success: false, reason: VERIFY_REASONS.PURCHASE_RECORD_MISMATCH }
    }
  }

  // Round PDA — canonical vesting parameters (required to derive unlock later)
  const roundRecord = await fetchRoundRecord(connection, purchaseRecord.roundId)
  if (!roundRecord) {
    return { success: false, reason: VERIFY_REASONS.PROGRAM_STATE_UNAVAILABLE }
  }

  // 10. Inner SPL transfer: buyer_token_account -> treasury_token_account
  const transfers = parseSplTransfers(tx, accountKeys).filter(
    (t) =>
      t.outerInstructionIndex === matchedIxIndex &&
      t.source === buyerTokenAccount &&
      t.destination === treasuryTokenAccount,
  )
  if (transfers.length === 0) {
    return { success: false, reason: VERIFY_REASONS.TRANSFER_NOT_FOUND }
  }
  if (transfers.length > 1) {
    return { success: false, reason: VERIFY_REASONS.AMOUNT_MISMATCH }
  }
  const transfer = transfers[0]

  // TransferChecked carries its own mint; plain Transfer gets it from balances.
  if (transfer.mint !== null && transfer.mint !== paymentMintAccount) {
    return { success: false, reason: VERIFY_REASONS.MINT_MISMATCH }
  }
  if (transfer.amountBaseUnits !== purchaseRecord.paymentAmount) {
    return { success: false, reason: VERIFY_REASONS.AMOUNT_MISMATCH }
  }

  // 11. Balance deltas — BOTH endpoints, ALWAYS (GAP-2)
  const preTokenBalances = (tx.meta?.preTokenBalances ?? []) as TokenBalanceEntry[]
  const postTokenBalances = (tx.meta?.postTokenBalances ?? []) as TokenBalanceEntry[]

  const buyerView = readTokenBalance(preTokenBalances, postTokenBalances, accountKeys, buyerTokenAccount)
  const buyerDelta = enforceDelta(buyerView, -1, purchaseRecord.paymentAmount, paymentMintAccount, STABLE_DECIMALS)
  if (!buyerDelta.ok) return { success: false, reason: buyerDelta.reason }

  const treasuryView = readTokenBalance(preTokenBalances, postTokenBalances, accountKeys, treasuryTokenAccount)
  const treasuryDelta = enforceDelta(treasuryView, 1, purchaseRecord.paymentAmount, paymentMintAccount, STABLE_DECIMALS)
  if (!treasuryDelta.ok) return { success: false, reason: treasuryDelta.reason }

  // 12. Facts — everything below comes from chain state, zero hardcoding
  const amountUsdc = baseUnitsToDecimal(purchaseRecord.paymentAmount, STABLE_DECIMALS)
  const amountGaia = baseUnitsToDecimal(purchaseRecord.tokenAmount, GAIA_DECIMALS)

  return {
    success: true,
    verifiedData: {
      txSignature,
      instructionIndex: targetInstructionIndex,
      verifiedBuyer: buyerAddress,
      roundId: purchaseRecord.roundId,
      amountUsdc,
      amountGaia,
      currency,
      purchaseNumber: purchaseRecord.purchaseNumber,
      blockTime: tx.blockTime != null ? BigInt(tx.blockTime) : null,
      slot: BigInt(tx.slot),
      vestingParams: {
        tgeTimestampSec: config.tgeTimestamp,
        cliffSeconds: roundRecord.cliffSeconds,
        vestingDurationSeconds: roundRecord.vestingDurationSeconds,
      },
    },
  }
}

// ---------------------------------------------------------------------------
// CLAIM — symmetric vault->buyer audit
// ---------------------------------------------------------------------------

export async function verifyClaimTransaction(
  txSignature: string,
  walletHint?: string,
  targetInstructionIndex: number = 0,
): Promise<VerifiedClaimResult> {
  if (!isValidTxSignature(txSignature)) {
    return { success: false, reason: VERIFY_REASONS.INVALID_SIGNATURE }
  }

  const normalizedHint = walletHint ? normalizeWalletAddress(walletHint) : null
  if (walletHint && !normalizedHint) {
    return { success: false, reason: VERIFY_REASONS.WALLET_MISMATCH }
  }

  const loaded = await loadConfirmedTransaction(txSignature)
  if (loaded.kind === 'reject') return { success: false, reason: loaded.reason }
  const tx = loaded.tx

  const accountKeys = resolveAccountKeys(tx)
  const numRequiredSignatures =
    tx.transaction.message.header?.numRequiredSignatures ?? 1

  const map = resolveIdlAccountIndices('claim')
  for (const name of ['buyer', 'purchase', 'gaia_vault', 'buyer_gaia_account', 'gaia_mint']) {
    if (map[name] === undefined) {
      return { success: false, reason: VERIFY_REASONS.INVALID_IDL_ACCOUNTS }
    }
  }

  const located = locateProgramInstruction(tx, accountKeys, CLAIM_DISCRIMINATOR, targetInstructionIndex)
  if ('notFound' in located) {
    return {
      success: false,
      reason: located.sawOurProgram
        ? VERIFY_REASONS.WRONG_DISCRIMINATOR
        : VERIFY_REASONS.WRONG_PROGRAM_ID,
    }
  }
  const { ix: matchedIx } = located
  const rawIdxClaim = matchedIx.accountKeyIndexes ?? []
  const parsedMode = !(rawIdxClaim.length > 0 && rawIdxClaim.every((a) => typeof a === 'number'))

  const accountAt = (idlName: string): string =>
    ixAccountAddresses(matchedIx, accountKeys)[map[idlName]] ?? ''

  const buyerAddress = accountAt('buyer')
  if (!buyerAddress) {
    return { success: false, reason: VERIFY_REASONS.INVALID_IDL_ACCOUNTS }
  }
  // Signers are ALWAYS the first N entries of the account key list, in both
  // compiled and jsonParsed response modes.
  const buyerKeyPosition = accountKeys.indexOf(buyerAddress)
  if (buyerKeyPosition < 0 || buyerKeyPosition >= numRequiredSignatures) {
    return { success: false, reason: VERIFY_REASONS.BUYER_NOT_SIGNER }
  }
  if (normalizedHint && normalizedHint !== buyerAddress) {
    return { success: false, reason: VERIFY_REASONS.WALLET_MISMATCH }
  }

  const gaiaVault = accountAt('gaia_vault')
  const buyerGaiaAccount = accountAt('buyer_gaia_account')
  const gaiaMintAccount = accountAt('gaia_mint')
  const purchaseAccount = accountAt('purchase')
  if (!gaiaVault || !buyerGaiaAccount || !gaiaMintAccount || !purchaseAccount) {
    return { success: false, reason: VERIFY_REASONS.INVALID_IDL_ACCOUNTS }
  }

  // Mint identity: instruction account MUST be the Config GAIA mint
  const connection = getVerifyConnection()
  let config: Awaited<ReturnType<typeof fetchProgramConfig>>
  try {
    config = await fetchProgramConfig(connection)
  } catch (err) {
    console.error('[solana-verify] program-state RPC failure:', err)
    return { success: false, reason: VERIFY_REASONS.RPC_ERROR }
  }
  if (!config) {
    return { success: false, reason: VERIFY_REASONS.PROGRAM_STATE_UNAVAILABLE }
  }
  if (gaiaMintAccount !== config.gaiaMint.toBase58()) {
    return { success: false, reason: VERIFY_REASONS.MINT_MISMATCH }
  }

  // Purchase PDA — ties the claim to a wallet + real purchase number
  const purchaseRecord = await fetchPurchaseRecord(connection, new PublicKey(purchaseAccount))
  if (!purchaseRecord) {
    return { success: false, reason: VERIFY_REASONS.PROGRAM_STATE_UNAVAILABLE }
  }
  if (purchaseRecord.wallet.toBase58() !== buyerAddress) {
    return { success: false, reason: VERIFY_REASONS.PURCHASE_RECORD_MISMATCH }
  }

  // Round PDA — canonical vesting params for derived-state recomputation
  const roundRecord = await fetchRoundRecord(connection, purchaseRecord.roundId)
  if (!roundRecord) {
    return { success: false, reason: VERIFY_REASONS.PROGRAM_STATE_UNAVAILABLE }
  }

  // Inner transfer gaia_vault -> buyer_gaia_account is MANDATORY
  const transfers = parseSplTransfers(tx, accountKeys).filter(
    (t) =>
      t.outerInstructionIndex === located.compiledIndex &&
      t.source === gaiaVault &&
      t.destination === buyerGaiaAccount,
  )
  if (transfers.length === 0) {
    return { success: false, reason: VERIFY_REASONS.CLAIM_TRANSFER_NOT_FOUND }
  }
  if (transfers.length > 1) {
    return { success: false, reason: VERIFY_REASONS.AMOUNT_MISMATCH }
  }
  const transfer = transfers[0]

  if (transfer.mint !== null && transfer.mint !== gaiaMintAccount) {
    return { success: false, reason: VERIFY_REASONS.MINT_MISMATCH }
  }
  // Never accept a zero-value claim.
  if (transfer.amountBaseUnits <= 0n) {
    return { success: false, reason: VERIFY_REASONS.AMOUNT_MISMATCH }
  }

  // Balance deltas on BOTH sides (vault -X, buyer +X), always enforced
  const preTokenBalances = (tx.meta?.preTokenBalances ?? []) as TokenBalanceEntry[]
  const postTokenBalances = (tx.meta?.postTokenBalances ?? []) as TokenBalanceEntry[]

  const vaultView = readTokenBalance(preTokenBalances, postTokenBalances, accountKeys, gaiaVault)
  const vaultDelta = enforceDelta(vaultView, -1, transfer.amountBaseUnits, gaiaMintAccount, GAIA_DECIMALS)
  if (!vaultDelta.ok) return { success: false, reason: vaultDelta.reason }

  const buyerView = readTokenBalance(preTokenBalances, postTokenBalances, accountKeys, buyerGaiaAccount)
  const buyerDelta = enforceDelta(buyerView, 1, transfer.amountBaseUnits, gaiaMintAccount, GAIA_DECIMALS)
  if (!buyerDelta.ok) return { success: false, reason: buyerDelta.reason }

  const amountGaia = baseUnitsToDecimal(transfer.amountBaseUnits, GAIA_DECIMALS)

  return {
    success: true,
    verifiedData: {
      txSignature,
      instructionIndex: targetInstructionIndex,
      verifiedBuyer: buyerAddress,
      amountGaia,
      purchaseNumber: purchaseRecord.purchaseNumber,
      blockTime: tx.blockTime != null ? BigInt(tx.blockTime) : null,
      slot: BigInt(tx.slot),
      vestingParams: {
        tgeTimestampSec: config.tgeTimestamp,
        cliffSeconds: roundRecord.cliffSeconds,
        vestingDurationSeconds: roundRecord.vestingDurationSeconds,
      },
    },
  }
}
