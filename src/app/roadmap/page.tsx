'use client'

import { motion } from 'framer-motion'
import { ROADMAP_PHASES } from '@/lib/constants'
import { useInView } from '@/hooks/use-animations'
import { Check, Circle } from 'lucide-react'

export default function RoadmapPage() {
  const { ref, isInView } = useInView(0.1)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
          >
            Roadmap
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Our journey from concept to a global DeFi ecosystem. Track our progress and upcoming milestones.
          </motion.p>
        </div>
      </section>

      {/* Timeline */}
      <section ref={ref} className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-0.5 bg-border lg:-translate-x-1/2" />

            <div className="space-y-12">
              {ROADMAP_PHASES.map((phase, index) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className={`relative flex items-start gap-8 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-4 lg:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full flex items-center justify-center z-10 bg-background border-2 border-border">
                    {phase.completed ? (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : phase.current ? (
                      <div className="w-5 h-5 rounded-full bg-black dark:bg-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`ml-12 lg:ml-0 lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                    <div
                      className={`bg-card border border-border rounded-2xl p-6 ${
                        phase.current ? 'ring-2 ring-black dark:ring-white' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-muted-foreground">{phase.phase}</span>
                        {phase.completed && (
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                            Completed
                          </span>
                        )}
                        {phase.current && (
                          <span className="bg-black dark:bg-white text-white dark:text-black text-xs px-2 py-1 rounded-full font-medium">
                            In Progress
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{phase.title}</h3>
                      <p className="text-muted-foreground mb-4">{phase.description}</p>
                      <ul className="space-y-2">
                        {phase.milestones.map((milestone, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <div className={`w-1.5 h-1.5 rounded-full ${phase.completed || (phase.current && i < 2) ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                            {milestone}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden lg:block lg:w-1/2" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Future Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <p className="text-muted-foreground">
              This roadmap is subject to change based on market conditions and community feedback.
              <br />
              We're committed to delivering value to our community at every stage.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
