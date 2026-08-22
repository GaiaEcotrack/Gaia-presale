import { describe, it, expect } from 'vitest'
import {
  classifyClaimError,
  classifyPurchaseError,
  extractAnchorErrorInfo,
} from '@/lib/errors/purchase-errors'

describe('extractAnchorErrorInfo', () => {
  it('reads structured AnchorError first', () => {
    const info = extractAnchorErrorInfo({
      error: { errorCode: { code: 'presalePaused', number: 6001 } },
    })
    expect(info.name).toBe('presalePaused')
    expect(info.number).toBe(6001)
  })

  it('parses "Error Number:" from message/logs', () => {
    const info = extractAnchorErrorInfo({
      message: 'failed to send: Error Number: 6029.',
    })
    expect(info.number).toBe(6029)
  })

  it('parses hex custom program errors inside the program range', () => {
    expect(extractAnchorErrorInfo({ message: 'custom program error: 0x1771' }).number).toBe(6001)
    // Outside range (0x1234 = 4660) must be ignored.
    expect(extractAnchorErrorInfo({ message: 'custom program error: 0x1234' }).number).toBeUndefined()
  })

  it('parses "Error Code: <Name>" from program logs', () => {
    const info = extractAnchorErrorInfo({
      logs: ['Program log: AnchorError occurred. Error Code: roundEnded. Error Number: 6004.'],
    })
    expect(info.name).toBe('roundEnded')
  })

  it('returns empty for non-program errors', () => {
    expect(extractAnchorErrorInfo(new TypeError('Failed to fetch'))).toEqual({})
  })
})

describe('classifyPurchaseError', () => {
  it('IDL name → contract copy', () => {
    const e = classifyPurchaseError({
      error: { errorCode: { code: 'presalePaused', number: 6001 } },
    })
    expect(e.kind).toBe('contract')
    expect(e.technical).toBeTruthy()
  })

  it('insufficientFunds maps to the user-funds copy for purchases', () => {
    const e = classifyPurchaseError({ message: 'Error Number: 6010.' })
    expect(e.kind).toBe('insufficient-funds')
    expect(e.message).toContain("don't have enough USDC")
  })

  it('user rejection via wallet error name + message', () => {
    const err = Object.assign(new Error('User rejected the request.'), {
      name: 'WalletSignTransactionError',
    })
    expect(classifyPurchaseError(err).kind).toBe('user-rejected')
  })

  it('network failures map to network copy', () => {
    expect(classifyPurchaseError(new TypeError('Failed to fetch')).kind).toBe(
      'network',
    )
    expect(
      classifyPurchaseError(new Error('BlockhashNotFound')).kind,
    ).toBe('network')
  })

  it('slippage semantics map to slippage copy (future Meteora rail)', () => {
    const e = classifyPurchaseError(
      new Error('swap exceeded the allowed slippage tolerance'),
    )
    expect(e.kind).toBe('slippage')
    expect(e.message.toLowerCase()).toContain('price changed')
  })

  it('unknown program number still classifies as contract', () => {
    const e = classifyPurchaseError({ message: 'custom program error: 0x1800' })
    expect(e.kind).toBe('contract')
  })

  it('completely unknown error → unknown kind with technical preserved', () => {
    const e = classifyPurchaseError(new Error('mystery failure'))
    expect(e.kind).toBe('unknown')
    expect(e.technical).toContain('mystery failure')
  })
})

describe('classifyClaimError', () => {
  it('nothingToClaim → nothing-to-claim kind', () => {
    const e = classifyClaimError({
      logs: ['Program log: AnchorError. Error Code: nothingToClaim.'],
    })
    expect(e.kind).toBe('nothing-to-claim')
  })

  it('insufficientFunds in claim context stays contract (not user USDC)', () => {
    const e = classifyClaimError({ message: 'Error Number: 6010.' })
    expect(e.kind).toBe('contract')
  })

  it('RPC congestion → network copy', () => {
    const e = classifyClaimError(new Error('connection closed by peer'))
    expect(e.kind).toBe('network')
    expect(e.message).toContain('congested')
  })

  it('user rejection copy matches manual Cuadro 5', () => {
    const err = Object.assign(new Error('request rejected'), {
      name: 'WalletSendTransactionError',
    })
    const e = classifyClaimError(err)
    expect(e.kind).toBe('user-rejected')
    expect(e.message).toMatch(/cancel/i)
  })
})
