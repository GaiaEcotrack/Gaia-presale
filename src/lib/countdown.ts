// Pure countdown calculation (extracted from use-countdown for testability).

export interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

const ZERO: CountdownTime = { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }

/**
 * Time remaining until the target. Past/equal targets yield all zeros —
 * callers treat `total <= 0` as "reached".
 */
export function calculateTimeLeft(
  targetDate: Date | string,
  now: Date = new Date(),
): CountdownTime {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  if (Number.isNaN(target.getTime())) return ZERO

  const difference = target.getTime() - now.getTime()
  if (difference <= 0) return ZERO

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
    total: difference,
  }
}
