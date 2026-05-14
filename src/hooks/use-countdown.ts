'use client'

import { useState, useEffect, useCallback } from 'react'

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number
}

export function useCountdown(targetDate: Date | string): CountdownTime {
  const calculateTimeLeft = useCallback(() => {
    const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
    const now = new Date()
    const difference = target.getTime() - now.getTime()

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
      total: difference,
    }
  }, [targetDate])

  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [calculateTimeLeft])

  return timeLeft
}
