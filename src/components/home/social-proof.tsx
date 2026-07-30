'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const TESTIMONIALS = [
  {
    quote: 'Colombia\'s solar generation surpassed coal for the first time in 2025. Gaia is riding this wave.',
    name: 'UPME Data',
    role: '2026',
  },
  {
    quote: 'One of the few projects that combines DeFi with real-world energy assets.',
    name: 'Industry Observer',
    role: '',
  },
  {
    quote: 'The legal architecture is what sets this apart. They\'ve thought this through.',
    name: 'Legal Analyst',
    role: '',
  },
]

export function SocialProof() {
  const { ref, isInView } = useInView(0.1)

  return (
    <section ref={ref} className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            What People Are Saying
          </h2>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow"
            >
              <Quote className="w-8 h-8 text-muted-foreground/30 mb-4" />
              <p className="text-lg text-muted-foreground italic">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="w-8 h-0.5 bg-border my-6" />
              <p className="font-semibold">{testimonial.name}</p>
              {testimonial.role && (
                <p className="text-sm text-muted-foreground mt-1">{testimonial.role}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
