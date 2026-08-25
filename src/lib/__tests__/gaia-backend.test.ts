import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  getClaimHistory,
  postClaimSync,
  postPurchaseRecord,
} from '@/lib/api/gaia-backend'

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

afterEach(() => {
  fetchMock.mockReset()
})

/**
 * Financial localStorage REMOVAL guarantee (GAP-6 / case 36):
 * if any code path under test touches window.localStorage the spy fails.
 */
function installStorageTripwire(): ReturnType<typeof vi.fn> {
  const setItemSpy = vi.fn((_k: string, _v: string) => {
    throw new Error('localStorage.setItem MUST NOT be used for financial data')
  })
  const storage = {
    setItem: setItemSpy,
    getItem: vi.fn(() => null),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { location: { origin: 'http://test.local' }, localStorage: storage },
  })
  return setItemSpy
}

describe('claim history — backend is the ONLY source', () => {
  it('parses backend claims keeping amounts as decimal STRINGS', async () => {
    installStorageTripwire()
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          claims: [
            { txSignature: 'sig1', amountGaia: '12500.000000000000000000', createdAt: '2026-08-01T00:00:00Z' },
            { txSignature: 'sig2', amountGaia: '3125.500000000000000000', createdAt: '2026-08-02T00:00:00Z' },
          ],
        },
      }),
    })

    const res = await getClaimHistory('wallet1')
    expect(res.source).toBe('backend')
    expect(res.authoritative).toBe(true)
    expect(res.records).toHaveLength(2)
    expect(typeof res.records[0].amountClaimed).toBe('string')
    expect(res.records[0].amountClaimed).toBe('12500.000000000000000000')
  })

  it('backend HTTP failure -> sync-pending with ZERO records', async () => {
    const spy = installStorageTripwire()
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 })

    const res = await getClaimHistory('wallet1')
    expect(res).toEqual({ records: [], source: 'sync-pending', authoritative: false })
    expect(spy).not.toHaveBeenCalled()
  })

  it('network failure -> sync-pending, never local fallback data', async () => {
    const spy = installStorageTripwire()
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))

    const res = await getClaimHistory('wallet1')
    expect(res.records).toEqual([])
    expect(res.source).toBe('sync-pending')
    expect(res.authoritative).toBe(false)
    expect(spy).not.toHaveBeenCalled()
  })

  it('36. no financial localStorage writes occur in ANY flow', async () => {
    const spy = installStorageTripwire()
    fetchMock.mockResolvedValue({ ok: false })

    await getClaimHistory('w')
    postClaimSync('w', VALID_SIG)
    postPurchaseRecord({ wallet: 'w', txId: VALID_SIG })

    // fire-and-forget promises flush
    await new Promise((r) => setTimeout(r, 0))
    expect(spy).not.toHaveBeenCalled()
  })
})

const VALID_SIG =
  '5k8F3uW9J12v4xY7z6aB8cD1eF2gH3jK4mN5mN6oP7qR8sT9uV1wX2yZ3aB4cD5eF6gH7jK8mN9mN1oP2qR34567'
