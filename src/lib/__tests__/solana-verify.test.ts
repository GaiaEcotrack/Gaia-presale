import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  isValidTxSignature,
  normalizeWalletAddress,
  baseUnitsToDecimal,
  verifyPurchaseTransaction,
  verifyClaimTransaction,
} from '@/lib/server/solana-verify'
import { setVerifyConnectionFactory } from '@/lib/server/rpc'
import {
  buildTransaction,
  makeConnectionStub,
  KEYS,
  VALID_SIGNATURE,
  GAIA_VAULT_PDA,
  TGE_SEC,
  CLIFF_SEC,
  DURATION_SEC,
} from './helpers/tx-fixture'

const restoreFactory = () => setVerifyConnectionFactory(null)

afterEach(() => restoreFactory())

/* ------------------------------------------------------------------ */
/* Pure helpers                                                        */
/* ------------------------------------------------------------------ */

describe('signature + wallet validation (cases 1-3)', () => {
  it('1. accepts a valid base58 signature format', () => {
    expect(isValidTxSignature(VALID_SIGNATURE)).toBe(true)
  })

  it('1b. rejects invalid signatures before any RPC', async () => {
    let rpcCalled = false
    setVerifyConnectionFactory(() => {
      rpcCalled = true
      throw new Error('RPC must not be called')
    })
    await expect(verifyPurchaseTransaction('invalid_sig')).resolves.toMatchObject({
      success: false,
      reason: 'INVALID_SIGNATURE',
    })
    await expect(verifyPurchaseTransaction('')).resolves.toMatchObject({
      success: false,
      reason: 'INVALID_SIGNATURE',
    })
    await expect(verifyClaimTransaction('12345')).resolves.toMatchObject({
      success: false,
      reason: 'INVALID_SIGNATURE',
    })
    expect(rpcCalled).toBe(false)
  })

  it('2. wallet normalization rejects off-curve / malformed keys', () => {
    expect(normalizeWalletAddress(KEYS.buyer.toBase58())).toBe(KEYS.buyer.toBase58())
    expect(normalizeWalletAddress('not-a-solana-pubkey!')).toBeNull()
  })

  it('4. malformed walletHint is rejected pre-RPC with WALLET_MISMATCH', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy')
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE, 'not-a-pubkey')
    expect(res).toMatchObject({ success: false, reason: 'WALLET_MISMATCH' })
  })
})

describe('BUY verification (GAP-2 true 4-way)', () => {
  it('happy path returns PDA-derived facts and vesting params', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', { paymentMint: KEYS.usdtMint })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))

    const res = await verifyPurchaseTransaction(VALID_SIGNATURE, KEYS.buyer.toBase58())
    expect(res.success).toBe(true)
    expect(res.verifiedData).toMatchObject({
      verifiedBuyer: KEYS.buyer.toBase58(),
      currency: 'USDT',
      roundId: 0,
      instructionIndex: 0,
    })
    // Facts come from the Purchase PDA (250 USDC -> 25,000 GAIA @ $0.01)
    expect(res.verifiedData?.amountUsdc.toString()).toBe('250')
    expect(res.verifiedData?.amountGaia.toString()).toBe('25000')
    expect(res.verifiedData?.vestingParams).toEqual({
      tgeTimestampSec: BigInt(TGE_SEC),
      cliffSeconds: BigInt(CLIFF_SEC),
      vestingDurationSeconds: BigInt(DURATION_SEC),
    })
  })

  it('5. rejects when buyer is not a required signer', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', { buyerSigner: false })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'BUYER_NOT_SIGNER' })
  })

  it('6. our-program instruction with UNKNOWN discriminator -> treated as corrupted sample', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', {
      instructionDiscriminator: Buffer.from([9, 9, 9, 9, 9, 9, 9, 9]),
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'WRONG_DISCRIMINATOR' })
  })

  it('6b. CLAIM-discriminated tx routed to BUY verifier -> WRONG_DISCRIMINATOR', async () => {
    const { tx, chainAccounts } = await buildTransaction('claim')
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'WRONG_DISCRIMINATOR' })
  })

  it('9. transaction with NO instructions from our program -> WRONG_PROGRAM_ID', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy')
    const stripped = {
      ...tx,
      transaction: {
        ...tx.transaction,
        message: {
          ...(tx.transaction.message as unknown as Record<string, unknown>),
          compiledInstructions: [],
        },
      },
    } as unknown as typeof tx
    setVerifyConnectionFactory(() => makeConnectionStub(stripped, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    // No intact sample possible without our program -> hardened rejection.
    expect(res.success).toBe(false)
    expect(['WRONG_PROGRAM_ID', 'RPC_DATA_INCONSISTENT']).toContain(res.reason)
  })

  it('10. payment mint outside Config allowlist -> MINT_MISMATCH', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', { paymentMint: KEYS.gaiaMint })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'MINT_MISMATCH' })
  })

  it('11. gaia mint account swapped -> MINT_MISMATCH', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', { gaiaMintInIx: KEYS.usdcMint })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'MINT_MISMATCH' })
  })

  it('12/14. inner transfer from WRONG SOURCE -> TRANSFER_NOT_FOUND', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', {
      innerTransferSource: KEYS.buyerGaiaAccount,
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'TRANSFER_NOT_FOUND' })
  })

  it('15. inner transfer to WRONG DESTINATION -> TRANSFER_NOT_FOUND', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', {
      innerTransferDestination: KEYS.treasury,
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'TRANSFER_NOT_FOUND' })
  })

  it('13. missing inner transfer entirely -> TRANSFER_NOT_FOUND', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', { includeInnerTransfer: false })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'TRANSFER_NOT_FOUND' })
  })

  it('16. transfer amount != PDA payment_amount -> AMOUNT_MISMATCH', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', {
      innerTransferAmountOverride: 100n,
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'AMOUNT_MISMATCH' })
  })

  it('17. buyer delta wrong -> BALANCE_MISMATCH', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', {
      preBuyerAmount: 300_000_000n, // delta would be -300M, expected -250M
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'BALANCE_MISMATCH' })
  })

  it('17b. buyer balance entry missing post state -> TOKEN_BALANCE_NOT_FOUND', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy')
    ;(tx.meta as { postTokenBalances: unknown[] }).postTokenBalances =
      (tx.meta as { postTokenBalances: unknown[] }).postTokenBalances.filter(
        (_b, i) => i !== 0,
      )
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'TOKEN_BALANCE_NOT_FOUND' })
  })

  it('18. treasury delta wrong -> BALANCE_MISMATCH', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', {
      postTreasuryAmount: 999n,
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'BALANCE_MISMATCH' })
  })

  it('21. wrong mint on post balances -> MINT_MISMATCH (balance layer)', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', {
      postBuyerMint: KEYS.usdtMint.toBase58(),
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'MINT_MISMATCH' })
  })

  it('22. transaction not found -> TRANSACTION_NOT_FOUND', async () => {
    const { chainAccounts } = await buildTransaction('buy')
    setVerifyConnectionFactory(() => makeConnectionStub(null, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'TRANSACTION_NOT_FOUND' })
  })

  it('23. on-chain failed transaction rejected', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', { txMetaErr: { InstructionError: [] } })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'TRANSACTION_FAILED_ON_CHAIN' })
  })

  it('24. hanging RPC aborts after the deadline with RPC_TIMEOUT', async () => {
    const { setRpcTimeoutOverrideForTests } = await import('@/lib/server/rpc')
    setRpcTimeoutOverrideForTests(80)
    try {
      const { chainAccounts } = await buildTransaction('buy')
      const stub = makeConnectionStub(null, chainAccounts, {
        getTransaction: async () => {
          // Simulate transport abort surfaced by the RPC layer.
          const e = new Error('The operation was aborted')
          ;(e as { name: string }).name = 'AbortError'
          throw e
        },
      })
      setVerifyConnectionFactory(() => stub)

      await expect(verifyPurchaseTransaction(VALID_SIGNATURE)).resolves.toMatchObject({
        success: false,
        reason: 'RPC_TIMEOUT',
      })
    } finally {
      setRpcTimeoutOverrideForTests(null)
    }
  })

  it('purchase record owned by another wallet -> PURCHASE_RECORD_MISMATCH', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy', {
      purchaseWallet: KEYS.treasury,
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'PURCHASE_RECORD_MISMATCH' })
  })

  it('missing program state (no Config) -> PROGRAM_STATE_UNAVAILABLE', async () => {
    const { tx, chainAccounts } = await buildTransaction('buy')
    chainAccounts.clear() // simulate uninitialized protocol
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyPurchaseTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'PROGRAM_STATE_UNAVAILABLE' })
  })
})

describe('CLAIM verification (GAP-3)', () => {
  it('happy path: vault->buyer transfer with both deltas yields amount + purchaseNumber', async () => {
    const { tx, chainAccounts } = await buildTransaction('claim')
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))

    const res = await verifyClaimTransaction(VALID_SIGNATURE, KEYS.buyer.toBase58())
    expect(res.success).toBe(true)
    expect(res.verifiedData).toMatchObject({
      verifiedBuyer: KEYS.buyer.toBase58(),
      purchaseNumber: 0n,
    })
    // Fixture claims 250_000_000 GAIA base units = 250 GAIA
    expect(res.verifiedData?.amountGaia.toString()).toBe('250')
  })

  it('20. zero-amount claim transfer -> AMOUNT_MISMATCH (never success)', async () => {
    const { tx, chainAccounts } = await buildTransaction('claim', {
      innerTransferAmountOverride: 0n,
      postBuyerAmount: 0n,
      postTreasuryAmount: 500_000_000n,
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyClaimTransaction(VALID_SIGNATURE)
    expect(res.success).toBe(false)
    expect(['AMOUNT_MISMATCH']).toContain(res.reason)
  })

  it('13c. claim without observable vault movement -> CLAIM_TRANSFER_NOT_FOUND', async () => {
    const { tx, chainAccounts } = await buildTransaction('claim', {
      includeInnerTransfer: false,
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyClaimTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'CLAIM_TRANSFER_NOT_FOUND' })
  })

  it('19. vault delta wrong -> BALANCE_MISMATCH', async () => {
    const { tx, chainAccounts } = await buildTransaction('claim', {
      postTreasuryAmount: 123n, // vault post manipulated
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyClaimTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'BALANCE_MISMATCH' })
  })

  it('11c. claim against wrong GAIA mint account -> MINT_MISMATCH', async () => {
    const { tx, chainAccounts } = await buildTransaction('claim', {
      gaiaMintInIx: KEYS.usdcMint,
    })
    setVerifyConnectionFactory(() => makeConnectionStub(tx, chainAccounts))
    const res = await verifyClaimTransaction(VALID_SIGNATURE)
    expect(res).toMatchObject({ success: false, reason: 'MINT_MISMATCH' })
  })
})

describe('decimal precision (case: financial precision)', () => {
  it('baseUnitsToDecimal keeps exact precision incl. 18 decimals', () => {
    expect(baseUnitsToDecimal(100_000_000n, 6).toString()).toBe('100')
    expect(baseUnitsToDecimal(1n, 6).toString()).toBe('0.000001')
    expect(baseUnitsToDecimal(1_000_000_000_000_000_000n, 18).toString()).toBe('1')
    expect(baseUnitsToDecimal('9007199254740993', 6).toString()).toBe(
      '9007199254740993'.slice(0, -6) + '.' + '9007199254740993'.slice(-6),
    )
  })
})
