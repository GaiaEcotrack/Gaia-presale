import { describe, it, expect, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { VersionedTransactionResponse } from '@solana/web3.js'
import {
  verifyPurchaseTransaction,
  verifyClaimTransaction,
} from '@/lib/server/solana-verify'
import { setVerifyConnectionFactory, type VerifyRpcClient } from '@/lib/server/rpc'

/**
 * REGRESSION TEST — REAL Devnet purchase incident.
 *
 * Public RPC nodes intermittently served mutated instruction data for an
 * on-chain-finalized buy (wallet 3defyvN9..., sig 2XZpiDuV...), producing a
 * false TRANSFER_NOT_FOUND and an empty dashboard.
 *
 * Final hardening under test:
 *  - raw/compiled responses: Anchor discriminator enforced as before;
 *  - jsonParsed responses: outer .data is untrusted -> STRUCTURAL identity
 *    binding via canonical findPurchasePda(wallet, purchaseNumber) plus the
 *    full mint/signer/inner-transfer/delta audit.
 * Both paths must verify the SAME real-world facts.
 */

const REAL_SIG =
  '2XZpiDuVEUVYUsG26CMR6HzoaGNv7fGJbeug1n5P6yGhwETBJ23jsaMEp38VLcn3mVwNsnov8ns2LWxe3thvfMKh'
const BUYER = '3defyvN9tVH4MVPXaZK5Nh1nFcSmqxFHjmaTjf1krTMN'

const fixture = JSON.parse(
  readFileSync(join(__dirname, 'fixtures', 'devnet-buy-real.json'), 'utf8'),
) as {
  intactSample: { slot: number; blockTime: number | null; transaction: unknown; meta: unknown }
  chainAccounts: Record<string, { data: string }>
}

function asTx(s: unknown): VersionedTransactionResponse {
  return s as unknown as VersionedTransactionResponse
}

/** Converts a compiled/index-shaped tx into the jsonParsed wire shape. */
function toParsedShape(sample: unknown): VersionedTransactionResponse {
  const src = JSON.parse(JSON.stringify(sample)) as {
    slot: number
    blockTime: number | null
    transaction: { message: { header?: unknown; accountKeys?: string[]; compiledInstructions: { programIdIndex: number; accountKeyIndexes: number[]; data: string }[] } }
    meta: { innerInstructions: { index: number; instructions: { programIdIndex: number; accountKeyIndexes: number[]; data: string }[] }[] }
  }
  const keys = src.transaction.message.accountKeys ?? []
  const TOKEN = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

  const instructions = src.transaction.message.compiledInstructions.map((ix) => ({
    programId: keys[ix.programIdIndex],
    accounts: ix.accountKeyIndexes.map((i) => keys[i]),
    data: ix.data,
  }))

  const innerInstructions = (src.meta.innerInstructions ?? []).map((g) => ({
    index: g.index,
    instructions: g.instructions.map((ix) => {
      if (keys[ix.programIdIndex] !== TOKEN) {
        return { programId: keys[ix.programIdIndex], program: 'system', accounts: ix.accountKeyIndexes.map((i) => keys[i]), data: ix.data }
      }
      // decode transferChecked binary back into parsed form
      const d = Buffer.from(ix.data, 'base64')
      return {
        programId: TOKEN,
        program: 'spl-token',
        parsed: {
          type: 'transferChecked',
          info: {
            source: keys[ix.accountKeyIndexes[0]],
            mint: keys[ix.accountKeyIndexes[1]],
            destination: keys[ix.accountKeyIndexes[2]],
            authority: keys[ix.accountKeyIndexes[3]],
            tokenAmount: {
              amount: d.readBigUInt64LE(1).toString(),
              decimals: d[9],
              uiAmount: Number(d.readBigUInt64LE(1)) / 1e6,
              uiAmountString: String(Number(d.readBigUInt64LE(1)) / 1e6),
            },
          },
        },
        data: ix.data,
      }
    }),
  }))

  return {
    slot: src.slot,
    blockTime: src.blockTime,
    transaction: { message: { ...src.transaction.message, instructions } },
    meta: { ...src.meta, innerInstructions },
  } as unknown as VersionedTransactionResponse
}

function stub(sample: unknown): VerifyRpcClient {
  return {
    getTransactionJsonParsed: async () => sample,
    getTransaction: async () => sample,
    getAccountInfo: async (address: { toBase58(): string }) => {
      const entry = Object.entries(fixture.chainAccounts).find(([k]) => k === address.toBase58())
      return entry ? { data: Buffer.from(entry[1].data, 'base64') } : null
    },
  } as unknown as VerifyRpcClient
}

afterEach(() => setVerifyConnectionFactory(null))

describe('REAL devnet purchase regression — dual verification modes', () => {
  it('raw mode: intact compiled response verifies with PDA-derived facts', async () => {
    setVerifyConnectionFactory(() => stub(asTx(fixture.intactSample)))
    const res = await verifyPurchaseTransaction(REAL_SIG, BUYER)
    expect(res.success).toBe(true)
    expect(res.verifiedData?.amountUsdc.toString()).toBe('25')
    expect(res.verifiedData?.currency).toBe('USDC')
    expect(res.verifiedData?.purchaseNumber.toString()).toBe('3')
  })

  it('parsed mode: SAME transaction verifies identically (production path)', async () => {
    setVerifyConnectionFactory(() => stub(toParsedShape(fixture.intactSample)))
    const res = await verifyPurchaseTransaction(REAL_SIG, BUYER)
    expect(res.success).toBe(true)
    expect(res.verifiedData?.verifiedBuyer).toBe(BUYER)
    expect(res.verifiedData?.amountUsdc.toString()).toBe('25')
    expect(res.verifiedData?.amountGaia.toString()).toBe('166.666666')
    expect(res.verifiedData?.currency).toBe('USDC')
    expect(res.verifiedData?.purchaseNumber.toString()).toBe('3')
    const tge = res.verifiedData?.vestingParams.tgeTimestampSec
    expect(tge !== undefined && tge > 0n).toBe(true)
  })

  it('parsed mode: stripped inner transfer -> TRANSFER_NOT_FOUND', async () => {
    const shaped = toParsedShape(fixture.intactSample)
    ;(
      ((shaped.meta as { innerInstructions: { instructions: { parsed?: unknown }[] }[] }).innerInstructions)[0]
        .instructions[1]
    ).parsed = undefined

    setVerifyConnectionFactory(() => stub(shaped))
    const res = await verifyPurchaseTransaction(REAL_SIG, BUYER)
    expect(res).toMatchObject({ success: false, reason: 'TRANSFER_NOT_FOUND' })
  })

  it('claim verifier on a BUY transaction rejects safely', async () => {
    setVerifyConnectionFactory(() => stub(toParsedShape(fixture.intactSample)))
    const res = await verifyClaimTransaction(REAL_SIG, BUYER)
    expect(res.success).toBe(false)
    expect(res.reason).not.toBeUndefined()
  })
})
