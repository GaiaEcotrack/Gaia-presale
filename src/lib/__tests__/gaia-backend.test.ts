import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  getClaimHistory,
  recordLocalClaim,
  getLocalPurchaseTxs,
  recordLocalPurchase,
} from '@/lib/api/gaia-backend'

/* Minimal localStorage stub — lets us test corrupt/unavailable storage. */
type Store = Record<string, string>

function installWindow(store: Store | null) {
  const prev = (globalThis as { window?: unknown }).window
  if (store === null) {
    delete (globalThis as { window?: unknown }).window
  } else {
    ;(globalThis as { window?: unknown }).window = {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v
        },
        removeItem: (k: string) => {
          delete store[k]
        },
      },
    }
  }
  return () => {
    if (prev === undefined) delete (globalThis as { window?: unknown }).window
    else (globalThis as { window?: unknown }).window = prev
  }
}

const WALLET = 'GxYabcGxYabcGxYabcGxYabcGxYabcGxYabcp9Q'

describe('claim history source priority (correction #1)', () => {
  let restore: () => void

  beforeEach(() => {
    // No NEXT_PUBLIC_GAIA_API_URL in test env → backend path inactive.
    restore = installWindow({})
  })

  afterEach(() => {
    restore()
  })

  it('without backend → local-provisional and NEVER authoritative', async () => {
    const res = await getClaimHistory(WALLET)
    expect(res.source).toBe('local-provisional')
    expect(res.authoritative).toBe(false)
    expect(res.records).toEqual([])
  })

  it('corrupt localStorage is tolerated as empty', async () => {
    restore()
    restore = installWindow({
      [`gaia-claim-history:${WALLET.toLowerCase()}`]: '{not json',
    })
    const res = await getClaimHistory(WALLET)
    expect(res.records).toEqual([])
    expect(res.source).toBe('local-provisional')
  })

  it('localStorage unavailable entirely → empty provisional', async () => {
    restore()
    restore = installWindow(null)
    const res = await getClaimHistory(WALLET)
    expect(res.records).toEqual([])
    expect(res.authoritative).toBe(false)
  })

  it('records REAL claims, dedupes by txId and sorts newest first', async () => {
    recordLocalClaim(WALLET, {
      wallet: WALLET,
      claimTxId: 'tx1',
      amountClaimed: 100,
      timestamp: '2027-02-13T10:15:00Z',
    })
    recordLocalClaim(WALLET, {
      wallet: WALLET,
      claimTxId: 'tx2',
      amountClaimed: 200,
      timestamp: '2027-03-13T10:15:00Z',
    })
    recordLocalClaim(WALLET, {
      wallet: WALLET,
      claimTxId: 'tx1',
      amountClaimed: 100,
      timestamp: '2027-02-13T10:15:00Z',
    })

    const res = await getClaimHistory(WALLET)
    expect(res.records).toHaveLength(2)
    expect(res.records[0].claimTxId).toBe('tx2')
    expect(res.records[1].claimTxId).toBe('tx1')
  })
})

describe('provisional purchase TX map', () => {
  let restore: () => void

  beforeEach(() => {
    restore = installWindow({})
  })

  afterEach(() => {
    restore()
  })

  it('stores and reads by purchaseNumber; invalid entries filtered', () => {
    recordLocalPurchase(WALLET, {
      purchaseNumber: 0,
      txId: 'buysig1',
      timestamp: '2026-08-13T14:32:00Z',
    })
    const map = getLocalPurchaseTxs(WALLET)
    expect(map['0']?.txId).toBe('buysig1')
  })

  it('unavailable storage yields empty map instead of throwing', () => {
    restore()
    restore = installWindow(null)
    expect(getLocalPurchaseTxs(WALLET)).toEqual({})
  })
})
