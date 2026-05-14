'use client'

import { motion } from 'framer-motion'
import { useCountdown } from '@/hooks/use-countdown'
import { useEffect } from 'react'
import { usePresaleConfigReadonly } from '@/hooks/use-presale-config'

interface CountdownToStartProps {
  targetDate?: Date | string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onCountdownStart?: () => void
  showStageInfo?: boolean
}

export function CountdownToStart({ 
  targetDate, 
  size = 'md', 
  className = '', 
  onCountdownStart,
  showStageInfo = true
}: CountdownToStartProps) {
  const { nextStage, nextStageStartDate } = usePresaleConfigReadonly()
  
  // Use provided targetDate or calculate next stage start date
  const calculatedTargetDate = targetDate || nextStageStartDate
  const { days, hours, minutes, seconds, total } = useCountdown(calculatedTargetDate || new Date())
  
  useEffect(() => {
    if (total <= 0 && onCountdownStart) {
      onCountdownStart()
    }
  }, [total, onCountdownStart])

  const sizeClasses = {
    sm: {
      container: 'gap-2',
      box: 'p-2 min-w-[50px]',
      number: 'text-xl font-bold',
      label: 'text-[10px]',
      title: 'text-sm',
    },
    md: {
      container: 'gap-3',
      box: 'p-3 min-w-[70px]',
      number: 'text-2xl sm:text-3xl font-bold',
      label: 'text-xs',
      title: 'text-lg',
    },
    lg: {
      container: 'gap-4',
      box: 'p-4 sm:p-6 min-w-[90px]',
      number: 'text-3xl sm:text-4xl lg:text-5xl font-bold',
      label: 'text-xs sm:text-sm',
      title: 'text-xl sm:text-2xl',
    },
    xl: {
      container: 'gap-6',
      box: 'p-6 sm:p-8 min-w-[120px]',
      number: 'text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold',
      label: 'text-sm sm:text-base',
      title: 'text-2xl sm:text-3xl',
    },
  }

  const classes = sizeClasses[size]

  if (!calculatedTargetDate) {
    return (
      <div className={`text-center ${className}`}>
        <div className="bg-muted px-6 py-3 rounded-xl font-semibold">
          No upcoming presale stages
        </div>
      </div>
    )
  }

  if (total <= 0) {
    return (
      <div className={`text-center ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-black text-white px-8 py-4 rounded-xl font-bold shadow-lg"
        >
          <div className="text-xl sm:text-2xl">🚀 Presale Starting Now!</div>
          <div className="text-sm opacity-90 mt-1">Get ready to participate</div>
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

  // Get next stage info
  const nextStageDate = calculatedTargetDate instanceof Date ? calculatedTargetDate : new Date(calculatedTargetDate)
  const stageName = showStageInfo ? (nextStage?.name || 'Next Presale Stage') : 'Next Presale Stage'

  return (
    <div className={`${className}`}>
      {showStageInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h3 className={`${classes.title} font-bold mb-2`}>
            Countdown to {stageName}
          </h3>
          <p className="text-muted-foreground text-sm">
            Starting {nextStageDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>
      )}
      
      <div className={`flex items-center justify-center ${classes.container}`}>
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <div className={`bg-black text-white rounded-xl shadow-lg ${classes.box}`}>
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
      
      {showStageInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <div className="inline-flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full px-4 py-2">
            <span className="text-sm font-medium">⏰ Get Ready!</span>
            <span className="text-xs">Set a reminder for the launch</span>
          </div>
        </motion.div>
      )}
    </div>
  )
}