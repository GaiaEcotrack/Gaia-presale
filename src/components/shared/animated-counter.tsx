'use client'

import { motion } from 'framer-motion'
import { useAnimatedCounter, useInView } from '@/hooks/use-animations'

interface AnimatedCounterProps {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  separator?: boolean
  className?: string
}

export function AnimatedCounter({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = true,
  className = '',
}: AnimatedCounterProps) {
  const { count, ref } = useAnimatedCounter(end, duration)

  const formatNumber = (num: number) => {
    if (separator) {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    }
    return num.toFixed(decimals)
  }

  return (
    <span ref={ref} className={className}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  )
}

interface StatsCardProps {
  value: number
  label: string
  prefix?: string
  suffix?: string
  decimals?: number
  delay?: number
}

export function StatsCard({ value, label, prefix = '', suffix = '', decimals = 0, delay = 0 }: StatsCardProps) {
  const { ref, isInView } = useInView(0.3)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="text-center p-6"
    >
      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
        <AnimatedCounter end={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
      <p className="text-muted-foreground mt-2 text-sm sm:text-base">{label}</p>
    </motion.div>
  )
}
