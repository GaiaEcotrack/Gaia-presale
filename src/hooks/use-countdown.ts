'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  calculateTimeLeft,
  type CountdownTime,
} from '@/lib/countdown'

export function useCountdown(targetDate: Date | string): CountdownTime {
  const calculate = useCallback(
    () => calculateTimeLeft(targetDate),
    [targetDate],
  )

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculate)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculate())
    }, 1000)

    return () => clearInterval(timer)
  }, [calculate])

  return timeLeft
}
