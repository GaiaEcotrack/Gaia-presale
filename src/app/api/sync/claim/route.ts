import { NextResponse } from 'next/server'
import { syncClaimTx } from '@/lib/server/db-sync'
import { isRateLimited } from '@/lib/server/rate-limit'
import {

  claimSyncSchema,
  readJsonBody,
  formatZodIssues,
} from '@/lib/server/validation'

/** BigInt-safe JSON for Prisma rows (blockTime/slot/purchaseNumber). */
function jsonSafe<T>(row: T): unknown {
  return JSON.parse(JSON.stringify(row, (_k, v) => (typeof v === 'bigint' ? v.toString() : v)))
}

const STATUS_MAP: Record<string, number> = {
  INVALID_SIGNATURE: 400,
  WALLET_MISMATCH: 400,
  TRANSACTION_NOT_FOUND: 404,
  TRANSACTION_FAILED_ON_CHAIN: 400,
  WRONG_PROGRAM_ID: 400,
  WRONG_DISCRIMINATOR: 400,
  BUYER_NOT_SIGNER: 400,
  MALFORMED_INSTRUCTION_DATA: 400,
  PURCHASE_RECORD_MISMATCH: 400,
  MINT_MISMATCH: 400,
  AMOUNT_MISMATCH: 400,
  TRANSFER_NOT_FOUND: 400,
  CLAIM_TRANSFER_NOT_FOUND: 400,
  BALANCE_MISMATCH: 400,
  TOKEN_BALANCE_NOT_FOUND: 400,
  RPC_TIMEOUT: 504,
  RPC_ERROR: 502,
  RPC_DATA_INCONSISTENT: 503,
  PROGRAM_STATE_UNAVAILABLE: 503,
  DATABASE_ERROR: 500,
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 })
    }

    const parsedBody = await readJsonBody(request)
    if (!parsedBody.ok) {
      return NextResponse.json(
        { error: parsedBody.rejection.error },
        { status: parsedBody.rejection.status },
      )
    }

    const schemaResult = claimSyncSchema.safeParse(parsedBody.body)
    if (!schemaResult.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: formatZodIssues(schemaResult.error) },
        { status: 400 },
      )
    }

    const result = await syncClaimTx({
      txSignature: schemaResult.data.txSignature,
      walletHint: schemaResult.data.wallet,
      instructionIndex: schemaResult.data.instructionIndex ?? 0,
      ipAddress: ip,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.reason ?? 'Sync failed' },
        { status: STATUS_MAP[result.reason ?? ''] ?? 500 },
      )
    }

    return NextResponse.json({
      success: true,
      isStale: result.isStale,
      claim: jsonSafe(result.claim),
    })
  } catch (err) {
    console.error('[API] /api/sync/claim error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
