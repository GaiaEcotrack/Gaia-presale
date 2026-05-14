'use client'

import { motion } from 'framer-motion'
import { FAQ_DATA } from '@/lib/constants'
import { useInView } from '@/hooks/use-animations'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { MessageCircle, Mail, Twitter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FAQPage() {
  const { ref, isInView } = useInView(0.1)

  // Group FAQs by category
  const categories = {
    security: 'Security & Safety',
    tokens: 'Tokens & Distribution',
    technical: 'Technical Questions',
    policy: 'Policies',
    investment: 'Investment',
    bonus: 'Bonuses & Referrals',
  }

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
            Frequently Asked Questions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Find answers to common questions about the Gaia Ecotrack presale.
          </motion.p>
        </div>
      </section>

      {/* FAQ Content */}
      <section ref={ref} className="py-16 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {FAQ_DATA.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <AccordionItem
                    value={`item-${faq.id}`}
                    className="bg-card border border-border rounded-xl px-6"
                  >
                    <AccordionTrigger className="text-left font-medium hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>

          {/* Still Have Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find the answer you're looking for? Reach out to our team.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <MessageCircle className="w-4 h-4" />
                Telegram Support
              </Button>
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Mail className="w-4 h-4" />
                Email Support
              </Button>
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <Twitter className="w-4 h-4" />
                Twitter
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
