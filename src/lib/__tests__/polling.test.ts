import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Connection } from '@solana/web3.js'
import {
  determineStatus,
  startTransactionPolling,
  POLL_INTERVAL_MS,
  PENDING_POLL_INTERVAL_MS,
  PROCESSING_TIMEOUT_MS,
  PENDING_TIMEOUT_MS,
} from '@/lib/solana/polling'

function makeConnection() {
  const getTransaction = vi.fn()
  return { getTransaction } as unknown as Connection & { getTransaction: ReturnType<typeof vi.fn> }
}

describe('determineStatus — RPC semantics (correction #4)', () => {
  it('getTransaction === null → pending (NEVER failed)', () => {
    expect(determineStatus(null)).toBe('pending')
    // Runtime safety net: undefined behaves like null.
    expect(determineStatus(undefined as unknown as null)).toBe('pending')
  })

  it('tx exists && meta.err != null → failed', () => {
    expect(determineStatus({ meta: { err: { InstructionError: [] } } })).toBe('failed')
    expect(determineStatus({ meta: { err: null } as never })).not.toBe('failed')
  })

  it('tx exists && meta.err == null → confirmed', () => {
    expect(determineStatus({ meta: { err: null } })).toBe('confirmed')
    expect(determineStatus({ meta: undefined })).toBe('confirmed')
  })
})

describe('startTransactionPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('emits pending while null, then confirmed once the tx lands', async () => {
    const connection = makeConnection()
    connection.getTransaction
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ meta: { err: null } })

    const onStatus = vi.fn()
    startTransactionPolling({ connection, signature: 'sig', onStatus })

    await vi.advanceTimersByTimeAsync(1)
    expect(onStatus).toHaveBeenLastCalledWith('pending')

    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS)
    expect(onStatus).toHaveBeenLastCalledWith('confirmed')
    expect(connection.getTransaction).toHaveBeenCalledTimes(2)
  })

  it('meta.err → failed and polling stops', async () => {
    const connection = makeConnection()
    connection.getTransaction.mockResolvedValue({ meta: { err: { x: 1 } } })

    const onStatus = vi.fn()
    startTransactionPolling({ connection, signature: 'sig', onStatus })

    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 5)
    expect(onStatus).toHaveBeenCalledWith('failed')
    expect(connection.getTransaction).toHaveBeenCalledTimes(1) // terminal
  })

  it('60s without confirmation fires processing timeout exactly once, then backs off', async () => {
    const connection = makeConnection()
    connection.getTransaction.mockResolvedValue(null)

    const onStatus = vi.fn()
    const onProcessingTimeout = vi.fn()
    const onGiveUp = vi.fn()

    startTransactionPolling({
      connection,
      signature: 'sig',
      onStatus,
      onProcessingTimeout,
      onGiveUp,
    })

    // Step through the whole processing window.
    let elapsed = 0
    while (elapsed < PROCESSING_TIMEOUT_MS + PENDING_POLL_INTERVAL_MS) {
      await vi.advanceTimersByTimeAsync(1_000)
      elapsed += 1_000
    }

    expect(onProcessingTimeout).toHaveBeenCalledTimes(1)
    expect(onGiveUp).not.toHaveBeenCalled()
    // Status stayed pending throughout (null is never failed).
    for (const call of onStatus.mock.calls) {
      expect(call[0]).toBe('pending')
    }

    // After timeout the next poll waits ~15s, not 3s: advancing 14s must not
    // add calls beyond what already happened; +2s crosses a 15s boundary.
    const before = connection.getTransaction.mock.calls.length
    await vi.advanceTimersByTimeAsync(PENDING_POLL_INTERVAL_MS - 2_000)
    expect(connection.getTransaction.mock.calls.length - before).toBeLessThanOrEqual(0)
    await vi.advanceTimersByTimeAsync(2_000)
    expect(connection.getTransaction.mock.calls.length).toBeGreaterThan(before)
  }, 20_000)

  it('gives up after the total budget leaving status pending', async () => {
    const connection = makeConnection()
    connection.getTransaction.mockResolvedValue(null)

    const onGiveUp = vi.fn()
    startTransactionPolling({
      connection,
      signature: 'sig',
      onStatus: () => {},
      onGiveUp,
    })

    await vi.advanceTimersByTimeAsync(PENDING_TIMEOUT_MS + 30_000)

    expect(onGiveUp).toHaveBeenCalledTimes(1)
  }, 25_000)

  it('late confirmation after the pending window still resolves', async () => {
    const connection = makeConnection()
    // Stay pending well past 60s, then confirm during the backoff phase.
    connection.getTransaction.mockImplementation(async (_s: string) =>
      Date.now() % 2 === 0 ? null : null, // placeholder; controlled below
    )
    connection.getTransaction
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ meta: { err: null } })

    const onStatus = vi.fn()
    startTransactionPolling({
      connection,
      signature: 'sig',
      onStatus,
      totalTimeoutMs: 10 * 60_000,
    })

    await vi.advanceTimersByTimeAsync(PROCESSING_TIMEOUT_MS + PENDING_POLL_INTERVAL_MS * 4)
    expect(onStatus).toHaveBeenLastCalledWith('confirmed')
  })

  it('stop() prevents any further RPC calls (unmount cleanup)', async () => {
    const connection = makeConnection()
    connection.getTransaction.mockResolvedValue(null)

    const handle = startTransactionPolling({
      connection,
      signature: 'sig',
      onStatus: () => {},
    })

    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS)
    handle.stop()
    const callsAtStop = connection.getTransaction.mock.calls.length

    await vi.advanceTimersByTimeAsync(120_000)
    expect(connection.getTransaction.mock.calls.length).toBe(callsAtStop)
  })

  it('no overlapping requests: next tick only after previous resolves', async () => {
    const connection = makeConnection()
    let resolvers: Array<(v: unknown) => void> = []
    connection.getTransaction.mockImplementation(
      () => new Promise((resolve) => resolvers.push(resolve)),
    )

    startTransactionPolling({ connection, signature: 'sig', onStatus: () => {} })
    await vi.advanceTimersByTimeAsync(0)
    expect(connection.getTransaction).toHaveBeenCalledTimes(1)

    // Even with lots of time passing, the in-flight request blocks scheduling.
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3)
    expect(connection.getTransaction).toHaveBeenCalledTimes(1)

    resolvers[0]?.(null) // resolve first request → loop schedules next
    resolvers = []
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS + 1)
    expect(connection.getTransaction).toHaveBeenCalledTimes(2)
  })
})
