'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from '@/hooks/use-animations'

const STATS = [
  { value: 82, suffix: '%', text: 'Of energy in Colombia comes from renewable sources, but environmental attribute tokenization is incipient.' },
  { value: 60, suffix: ' GW', text: 'Of installed solar potential in Colombia according to UPME (2026).' },
  { value: 1.5, suffix: '%', text: 'Of self-generators can monetize surplus energy in the current market.', isDecimal: true },
]

function useCountUp(end: number, isDecimal?: boolean) {
  const { ref, isInView } = useInView(0.3)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let startTime: number | null = null
    const duration = 1800

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 4)
      const current = end * easeOut

      setCount(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isInView, end, isDecimal])

  return { count, ref }
}

function AnimatedStat({ value, suffix, isDecimal }: { value: number; suffix: string; isDecimal?: boolean }) {
  const { count, ref } = useCountUp(value, isDecimal)

  return (
    <div ref={ref}>
      <p className="text-3xl sm:text-4xl font-bold">
        {isDecimal ? count.toFixed(1) : count}{suffix}
      </p>
    </div>
  )
}

export function ProblemSection() {
  const { ref, isInView } = useInView(0.15)

  return (
    <section id="problem" ref={ref} className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
            The Challenge
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            The Energy Problem in Colombia
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Colombia has exceptional solar potential, but most self-generators
            cannot monetize their surplus energy. Regulatory barriers, lack of
            accessible markets, and absence of traceability limit mass adoption
            of renewable energy.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {STATS.map((stat, i) => (
            <motion.div
              key={`${stat.value}-${stat.suffix}`}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
              className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <AnimatedStat value={stat.value} suffix={stat.suffix} isDecimal={stat.isDecimal} />
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                {stat.text}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 max-w-3xl mx-auto text-center"
        >
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">Gaia Ecotrack</span> solves this by connecting
            renewable energy production with blockchain, creating a transparent
            and accessible market for all participants.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
