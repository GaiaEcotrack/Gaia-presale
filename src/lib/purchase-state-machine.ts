// Pure purchase state machine (manual §2.1 / §3.4).
//
//   idle ──START(connected)──► signing ──SENT(txId)──► processing
//     │                           │                        │
//     └─START(!connected)         └─FAILED                 ├─CONFIRMED → confirmed
//              ▼                  └─PENDING_TIMEOUT        ├─FAILED     → failed
//        wallet-disconnected            ▼                └─PENDING_TIMEOUT → pending
//                                     pending (keeps txId; polling continues)
//
// Terminal states (confirmed | failed | pending-after-give-up) exit via RESET.
// All transitions are pure and unit-testable.

import type { PurchaseErrorKind, PurchaseStatus } from '@/types/investment'

export interface PurchaseMachineState {
  status: PurchaseStatus
  txId: string | null
  errorKind: PurchaseErrorKind | null
  errorMessage: string | null
}

export type PurchaseEvent =
  | { type: 'START'; connected: boolean }
  | { type: 'SIGNING' }
  | { type: 'SENT'; txId: string }
  | { type: 'CONFIRMED' }
  | { type: 'FAILED'; kind: PurchaseErrorKind; message: string }
  | { type: 'PROCESSING_TIMEOUT' }
  | { type: 'RESET' }

export const INITIAL_PURCHASE_STATE: PurchaseMachineState = {
  status: 'idle',
  txId: null,
  errorKind: null,
  errorMessage: null,
}

const ACTIVE_STATUSES: ReadonlySet<PurchaseStatus> = new Set([
  'idle',
  'wallet-disconnected',
  'signing',
  'processing',
])

/** Whether a new run can be started from the given state (double-run guard). */
export function canStart(state: PurchaseMachineState): boolean {
  return state.status === 'idle' || state.status === 'wallet-disconnected'
}

/** Whether the current status is an in-flight one (blocks UI re-submission). */
export function isInFlight(status: PurchaseStatus): boolean {
  return status === 'signing' || status === 'processing'
}

export function purchaseReducer(
  state: PurchaseMachineState,
  event: PurchaseEvent,
): PurchaseMachineState {
  switch (event.type) {
    case 'START': {
      if (!ACTIVE_STATUSES.has(state.status)) return state // ignore stray START
      if (!event.connected) return { ...state, status: 'wallet-disconnected' }
      return { ...INITIAL_PURCHASE_STATE, status: 'signing' }
    }

    case 'SIGNING':
      return state.status === 'idle' ? { ...state, status: 'signing' } : state

    case 'SENT': {
      // Only accepted from signing/processing — guarantees a real signature
      // captured immediately after send (correction #9/#10 semantics).
      if (state.status !== 'signing' && state.status !== 'processing') return state
      if (!event.txId) return state
      return { ...state, status: 'processing', txId: event.txId }
    }

    case 'CONFIRMED': {
      if (state.status !== 'processing' && state.status !== 'pending') return state
      return { ...state, status: 'confirmed' }
    }

    case 'FAILED': {
      if (
        state.status !== 'signing' &&
        state.status !== 'processing' &&
        state.status !== 'pending'
      ) {
        return state
      }
      return {
        ...state,
        status: 'failed',
        errorKind: event.kind ?? null,
        errorMessage: event.message ?? null,
      }
    }

    case 'PROCESSING_TIMEOUT': {
      if (state.status !== 'processing') return state
      return { ...state, status: 'pending' }
    }

    case 'RESET':
      return { ...INITIAL_PURCHASE_STATE }
  }
}
