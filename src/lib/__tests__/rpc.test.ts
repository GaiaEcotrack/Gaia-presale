import { describe, it, expect, afterEach } from 'vitest'
import {
  withRpcTimeout,
  RpcTimeoutError,
  setRpcTimeoutOverrideForTests,
} from '@/lib/server/rpc'

afterEach(() => setRpcTimeoutOverrideForTests(null))

describe('withRpcTimeout mechanism', () => {
  it('resolves a fast operation untouched', async () => {
    await expect(withRpcTimeout(async () => 'ok')).resolves.toBe('ok')
  })

  it('rejects hanging operations with RpcTimeoutError', async () => {
    setRpcTimeoutOverrideForTests(40)
    await expect(
      withRpcTimeout(() => new Promise<string>(() => undefined)),
    ).rejects.toBeInstanceOf(RpcTimeoutError)
  })
})
