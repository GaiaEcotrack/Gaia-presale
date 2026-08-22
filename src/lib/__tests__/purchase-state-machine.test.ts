import { describe, it, expect } from 'vitest'
import {
  INITIAL_PURCHASE_STATE,
  canStart,
  isInFlight,
  purchaseReducer,
  type PurchaseEvent,
} from '@/lib/purchase-state-machine'

function reduce(state = INITIAL_PURCHASE_STATE, events: PurchaseEvent[]) {
  return events.reduce(purchaseReducer, state)
}

describe('purchase state machine', () => {
  it('happy path: idle → signing → processing → confirmed', () => {
    const s = reduce(undefined, [
      { type: 'START', connected: true },
      { type: 'SENT', txId: 'sig1' },
      { type: 'CONFIRMED' },
    ])
    expect(s.status).toBe('confirmed')
    expect(s.txId).toBe('sig1')
  })

  it('processing → failed on error event', () => {
    const s = reduce(undefined, [
      { type: 'START', connected: true },
      { type: 'SENT', txId: 'sig1' },
      { type: 'FAILED', kind: 'network', message: 'boom' },
    ])
    expect(s.status).toBe('failed')
    expect(s.errorKind).toBe('network')
    expect(s.errorMessage).toBe('boom')
    expect(s.txId).toBe('sig1') // tx kept for explorer links
  })

  it('processing → pending after 60s timeout (never failed)', () => {
    const s = reduce(undefined, [
      { type: 'START', connected: true },
      { type: 'SENT', txId: 'sig1' },
      { type: 'PROCESSING_TIMEOUT' },
    ])
    expect(s.status).toBe('pending')
  })

  it('late confirmation after pending still resolves to confirmed', () => {
    const s = reduce(undefined, [
      { type: 'START', connected: true },
      { type: 'SENT', txId: 'sig1' },
      { type: 'PROCESSING_TIMEOUT' },
      { type: 'CONFIRMED' },
    ])
    expect(s.status).toBe('confirmed')
  })

  it('pending can transition to failed when RPC later reports meta.err', () => {
    const s = reduce(undefined, [
      { type: 'START', connected: true },
      { type: 'SENT', txId: 'sig1' },
      { type: 'PROCESSING_TIMEOUT' },
      { type: 'FAILED', kind: 'contract', message: 'on-chain failure' },
    ])
    expect(s.status).toBe('failed')
  })

  it('START without connection lands in wallet-disconnected', () => {
    const s = reduce(undefined, [{ type: 'START', connected: false }])
    expect(s.status).toBe('wallet-disconnected')
  })

  it('duplicate START while in flight is ignored (double-run guard)', () => {
    const inFlight = reduce(undefined, [{ type: 'START', connected: true }])
    const s = purchaseReducer(inFlight, { type: 'START', connected: true })
    expect(s.status).toBe('signing')
    expect(s.txId).toBeNull()
  })

  it('START after terminal state is rejected until RESET', () => {
    const done = reduce(undefined, [
      { type: 'START', connected: true },
      { type: 'SENT', txId: 's' },
      { type: 'CONFIRMED' },
    ])
    expect(canStart(done)).toBe(false)
    const restarted = purchaseReducer(done, { type: 'START', connected: true })
    expect(restarted.status).toBe('confirmed')

    const cleared = purchaseReducer(done, { type: 'RESET' })
    expect(cleared.status).toBe('idle')
    expect(cleared.txId).toBeNull()
    expect(canStart(cleared)).toBe(true)
  })

  it('SENT is rejected without a signature or outside signing/processing', () => {
    let s = reduce(undefined, [{ type: 'SENT', txId: 'x' }])
    expect(s.status).toBe('idle')

    s = reduce(undefined, [
      { type: 'START', connected: true },
      { type: 'SENT', txId: '' },
    ])
    expect(s.status).toBe('signing')
    expect(s.txId).toBeNull()
  })

  it('PROCESSING_TIMEOUT only applies while processing', () => {
    const signing = reduce(undefined, [{ type: 'START', connected: true }])
    expect(purchaseReducer(signing, { type: 'PROCESSING_TIMEOUT' }).status).toBe(
      'signing',
    )
  })

  it('isInFlight covers only signing/processing', () => {
    expect(isInFlight('signing')).toBe(true)
    expect(isInFlight('processing')).toBe(true)
    expect(isInFlight('pending')).toBe(false)
    expect(isInFlight('confirmed')).toBe(false)
  })
})
