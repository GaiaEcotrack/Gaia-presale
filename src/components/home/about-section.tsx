'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Target, Zap, Shield, Globe, TrendingUp, Leaf, Sun, Wind, Droplets } from 'lucide-react'
import { useInView } from '@/hooks/use-animations'

const FEATURES = [
  {
    icon: Leaf,
    title: 'Energy Tokenization',
    description: 'Convert every kilowatt-hour of renewable energy into tradeable GAIA tokens.',
  },
  {
    icon: Globe,
    title: 'P2P Marketplace',
    description: 'Buy and sell tokenized energy directly with other users in a decentralized marketplace.',
  },
  {
    icon: Shield,
    title: 'Verified Generation',
    description: 'All energy production is verified through smart contracts and IoT device integration.',
  },
  {
    icon: TrendingUp,
    title: 'Carbon Credits',
    description: 'Convert GAIA tokens into certified carbon credits for additional value.',
  },
]

const BENEFITS = [
  'Transparent energy tracking',
  'Instant token rewards',
  'Low transaction fees',
  'Multi-source support',
  'Real-time verification',
  'Global accessibility',
]

export function AboutSection() {
  const { ref, isInView } = useInView(0.1)

  return (
    <section ref={ref} className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Problem & Solution */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium">The Challenge</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Energy Producers Lack Access
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Millions of renewable energy producers worldwide generate clean power but have no way 
              to monetize their environmental contribution beyond selling electricity. The carbon credit 
              market remains inaccessible to small producers.
            </p>
            <ul className="space-y-3">
              {['Limited access to carbon markets', 'No transparency in energy tracking', 
                'Small producers excluded from benefits', 'Complex verification processes'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-full px-4 py-2 mb-6">
              <Leaf className="w-4 h-4" />
              <span className="text-sm font-medium">Our Solution</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Democratizing Green Energy
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Gaia Ecotrack bridges the gap between renewable energy production and digital assets. 
              We empower anyone with solar panels, wind turbines, or other clean sources to tokenize 
              their energy and participate in the global green economy.
            </p>
            <ul className="space-y-3">
              {BENEFITS.slice(0, 4).map((item) => (
                <li key={item} className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built on Vara Network for efficiency, transparency, and sustainability.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Energy Sources */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-xl font-semibold mb-6">Supported Energy Sources</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Sun className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Solar</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Wind className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Wind</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Droplets className="w-5 h-5 text-cyan-500" />
              <span className="font-medium">Hydro</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Leaf className="w-5 h-5 text-green-500" />
              <span className="font-medium">Biomass</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
