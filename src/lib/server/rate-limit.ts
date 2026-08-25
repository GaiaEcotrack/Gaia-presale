// In-memory sliding window rate-limiter for RPC protection (10 req/min/IP)

const requestCounts = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 10

export function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = requestCounts.get(ip) ?? []

  const validTimestamps = timestamps.filter((t) => now - t < WINDOW_MS)
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestCounts.set(ip, validTimestamps)
    return true
  }

  validTimestamps.push(now)
  requestCounts.set(ip, validTimestamps)
  return false
}

/** Test-only: clears all tracked windows between tests. */
export function __resetRateLimiterForTests(): void {
  requestCounts.clear()
}
