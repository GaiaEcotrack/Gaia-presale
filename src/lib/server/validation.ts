// Strict request validation for financial sync endpoints (GAP-7).
//
// - Zod schemas with `.strict()` semantics: unknown fields are rejected.
// - Payload hard limit of 10 KB enforced BOTH via Content-Length (early,
//   before reading the body) and via actual byte length after reading
//   (covers chunked / misdeclared lengths).

import { z } from 'zod'

export const MAX_PAYLOAD_BYTES = 10_240

const BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/

// Transaction signatures are ed25519 (64-byte) base58 strings: 87–88 chars.
const txSignatureSchema = z
  .string()
  .regex(BASE58_REGEX, 'txSignature must be base58')
  .refine((v) => v.length >= 87 && v.length <= 88, {
    message: 'txSignature must be 87-88 characters',
  })

// Wallet hint: optional Solana public key (32 bytes -> 32-44 base58 chars).
const walletHintSchema = z
  .string()
  .regex(BASE58_REGEX, 'wallet must be base58')
  .refine((v) => v.length >= 32 && v.length <= 44, {
    message: 'wallet must be a valid public key length',
  })

const instructionIndexSchema = z.number().int().min(0).max(64)

export const purchaseSyncSchema = z.strictObject({
  txSignature: txSignatureSchema,
  wallet: walletHintSchema.optional(),
  instructionIndex: instructionIndexSchema.optional(),
})

export const claimSyncSchema = z.strictObject({
  txSignature: txSignatureSchema,
  wallet: walletHintSchema.optional(),
  instructionIndex: instructionIndexSchema.optional(),
})

export type PurchaseSyncInput = z.infer<typeof purchaseSyncSchema>
export type ClaimSyncInput = z.infer<typeof claimSyncSchema>

export interface PayloadRejection {
  status: number
  error: string
}

/** Early rejection based on declared Content-Length, before body reads. */
export function checkDeclaredPayloadSize(request: Request): PayloadRejection | null {
  const lengthHeader = request.headers.get('content-length')
  if (lengthHeader !== null) {
    const declared = Number(lengthHeader)
    if (!Number.isFinite(declared) || declared < 0) {
      return { status: 400, error: 'Invalid Content-Length' }
    }
    if (declared > MAX_PAYLOAD_BYTES) {
      return { status: 413, error: 'Payload too large' }
    }
  }
  return null
}

/**
 * Reads and parses the JSON body under the hard byte limit. The limit is
 * applied on the ACTUAL byte count, so chunked or lying Content-Length
 * headers cannot smuggle oversized bodies.
 */
export async function readJsonBody(
  request: Request,
): Promise<{ ok: true; body: unknown } | { ok: false; rejection: PayloadRejection }> {
  const declared = checkDeclaredPayloadSize(request)
  if (declared) return { ok: false, rejection: declared }

  let text: string
  try {
    text = await request.text()
  } catch {
    return { ok: false, rejection: { status: 400, error: 'Unable to read body' } }
  }

  const byteLength = new TextEncoder().encode(text).length
  if (byteLength > MAX_PAYLOAD_BYTES) {
    return { ok: false, rejection: { status: 413, error: 'Payload too large' } }
  }

  try {
    return { ok: true, body: JSON.parse(text) as unknown }
  } catch {
    return { ok: false, rejection: { status: 400, error: 'Invalid JSON body' } }
  }
}

/** Flattens a ZodError into safe, client-presentable issues. */
export function formatZodIssues(error: z.ZodError): { path: string; message: string }[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}
