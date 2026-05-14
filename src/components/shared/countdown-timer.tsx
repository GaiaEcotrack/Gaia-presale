'use client'

import { motion } from 'framer-motion'
import { useCountdown } from '@/hooks/use-countdown'
import { useEffect } from 'react'

interface CountdownTimerProps {
  targetDate: Date | string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onCountdownEnd?: () => void
}

export function CountdownTimer({ targetDate, size = 'md', className = '', onCountdownEnd }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, total } = useCountdown(targetDate)
  
  useEffect(() => {
    if (total <= 0 && onCountdownEnd) {
      onCountdownEnd()
    }
  }, [total, onCountdownEnd])

  const sizeClasses = {
    sm: {
      container: 'gap-2',
      box: 'p-2 min-w-[50px]',
      number: 'text-xl font-bold',
      label: 'text-[10px]',
    },
    md: {
      container: 'gap-3',
      box: 'p-3 min-w-[70px]',
      number: 'text-2xl sm:text-3xl font-bold',
      label: 'text-xs',
    },
    lg: {
      container: 'gap-4',
      box: 'p-4 sm:p-6 min-w-[90px]',
      number: 'text-3xl sm:text-4xl lg:text-5xl font-bold',
      label: 'text-xs sm:text-sm',
    },
  }

  const classes = sizeClasses[size]

  if (total <= 0) {
    return (
      <div className={`text-center ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg"
        >
          <div className="text-xl sm:text-2xl">🎉 Presale Successfully Ended!</div>
          <div className="text-sm opacity-90 mt-1">Thank you to all our investors</div>
        </motion.div>
      </div>
    )
  }

  const timeUnits = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hours' },
    { value: minutes, label: 'Minutes' },
    { value: seconds, label: 'Seconds' },
  ]

  return (
    <div className={`flex items-center justify-center ${classes.container} ${className}`}>
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className={`bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-lg ${classes.box}`}>
            <span className={`${classes.number} font-mono tabular-nums`}>
              {unit.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className={`text-muted-foreground mt-2 uppercase tracking-wider ${classes.label}`}>
            {unit.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}
