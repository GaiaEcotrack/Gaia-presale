'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROADMAP_PHASES } from '@/lib/constants'
import { useInView } from '@/hooks/use-animations'

export function RoadmapPreview() {
  const { ref, isInView } = useInView(0.1)

  return (
    <section ref={ref} className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Roadmap</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our journey from concept to global DeFi ecosystem.
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden lg:block" />

          <div className="space-y-12 lg:space-y-0">
            {ROADMAP_PHASES.map((phase, index) => (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative lg:flex lg:items-center ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Content */}
                <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                  <div
                    className={`bg-card border border-border rounded-2xl p-6 ${
                      phase.current ? 'ring-2 ring-black dark:ring-white' : ''
                    } ${phase.completed ? 'opacity-75' : ''}`}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${index % 2 === 0 ? 'lg:justify-end' : ''}`}>
                      <span className="text-sm font-medium text-muted-foreground">{phase.phase}</span>
                      {phase.completed && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                      {phase.current && (
                        <span className="bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{phase.title}</h3>
                    <p className="text-sm text-muted-foreground">{phase.description}</p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      phase.completed
                        ? 'bg-green-500'
                        : phase.current
                        ? 'bg-black dark:bg-white'
                        : 'bg-muted border-2 border-border'
                    }`}
                  />
                </div>

                {/* Spacer */}
                <div className="lg:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/roadmap">
            <Button variant="outline" className="gap-2">
              View Full Roadmap
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
