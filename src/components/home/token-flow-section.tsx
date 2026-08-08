'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Calendar, Sun, BarChart3, Shield, Lock, Flame, Users, Droplets, TrendingUp } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
}

const SOURCE_CARDS = [
  {
    icon: Calendar,
    title: 'Annual Subscription',
    desc: 'Recurring revenue from energy service contracts creates predictable cash flow.',
    tags: ['Continuity', 'Predictability'],
  },
  {
    icon: Sun,
    title: 'Energy Generation',
    desc: 'Each verified kilowatt-hour is tokenized as GAIA-E. Production equals minting.',
    tags: ['kW = Tokens', 'IoT Verified'],
  },
  {
    icon: BarChart3,
    title: 'Photovoltaic Growth',
    desc: "Colombia's solar capacity is projected to grow 10x in the next decade.",
    tags: ['Diversification', 'Stability'],
  },
]

const MECHANISM = [
  {
    icon: Lock,
    title: '4-Year Vesting',
    subtitle: 'Founders & Team',
    desc: 'Gradual token release aligned with long-term project milestones.',
    accent: true,
  },
  {
    icon: Shield,
    title: 'RECs & Carbon Credits',
    subtitle: 'Foundation of Trust',
    desc: 'Environmental attribute certificates validate real energy impact.',
    accent: true,
  },
]

const OUTPUT_CARDS = [
  {
    icon: Users,
    title: 'Retail Investors',
    desc: 'Direct access to real yield backed by energy production, not speculation.',
    tags: [],
  },
  {
    icon: Droplets,
    title: 'Liquid Staking',
    desc: 'Stake GAIA to earn rewards while maintaining liquidity.',
    tags: ['Redeemable', 'Network Strength'],
  },
  {
    icon: TrendingUp,
    title: 'Pays Dividends',
    desc: 'Revenue from energy sales funds regular token buybacks and distributions.',
    tags: ['Consistent', 'Real Yield'],
  },
]

function FlowConnector({ variant }: { variant: 'source' | 'output' }) {
  const color = variant === 'source' ? '#002850' : '#16a34a'

  return (
    <div className="hidden lg:flex justify-center py-8">
      <div className="relative h-20 w-48">
        {/* Three vertical lines */}
        {[0, 1, 2].map((i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px" style={{ left: `${25 + i * 25}%` }}>
            <div className="absolute inset-0 bg-border" />
            <motion.div
              initial={{ height: '0%', opacity: 0 }}
              animate={{ height: '40%', opacity: [0, 0.8, 0.3] }}
              transition={{
                height: { duration: 1.2, delay: i * 0.2, repeat: Infinity, repeatDelay: 1.2 },
                opacity: { duration: 2.4, delay: i * 0.4, repeat: Infinity },
              }}
              className="absolute top-0 left-0 w-full"
              style={{ background: `linear-gradient(to bottom, ${color}, transparent)` }}
            />
          </div>
        ))}
        {/* Center animated arrow */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <motion.path
              d="M10 4v9m0 0l-3.5-3.5M10 13l3.5-3.5"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.3, repeat: Infinity, repeatDelay: 1.2 }}
            />
          </motion.svg>
        </div>
      </div>
    </div>
  )
}

function MobileConnector({ variant }: { variant: 'source' | 'output' }) {
  const color = variant === 'source' ? 'text-primary' : 'text-green-600 dark:text-green-400'
  return (
    <div className="flex lg:hidden justify-center py-4">
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        className={color}
      >
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        >
          <polyline points="6,9 12,15 18,9" />
        </motion.svg>
      </motion.div>
    </div>
  )
}

export function TokenFlowSection() {
  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 })
  const sourceRef = useRef(null)
  const sourceInView = useInView(sourceRef, { once: true, amount: 0.2 })
  const mechRef = useRef(null)
  const mechInView = useInView(mechRef, { once: true, amount: 0.2 })
  const outRef = useRef(null)
  const outInView = useInView(outRef, { once: true, amount: 0.2 })

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── HEADER ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
            Tokenomics Flow
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            How value flows through the GAIA token
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every subscription, kilowatt and solar panel feeds a token backed
            by real, verifiable energy — not speculation.
          </p>
        </motion.div>

        {/* ── SOURCE OF VALUE ── */}
        <div ref={sourceRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={sourceInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="w-8 h-px bg-primary/40" />
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Source of Value
            </span>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SOURCE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                initial="hidden"
                animate={sourceInView ? 'visible' : 'hidden'}
                variants={fadeUp}
                className="group bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-4 text-primary">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{card.desc}</p>
                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        <FlowConnector variant="source" />
        <MobileConnector variant="source" />

        {/* ── MECHANISM BAND ── */}
        <div ref={mechRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={mechInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Governance Mechanisms
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={mechInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 sm:p-8 lg:p-10"
          >
            <div className="grid lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-6 max-w-4xl mx-auto">

              {/* Left — Vesting */}
              <div className="bg-muted/50 border border-border rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-md">
                <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm mb-1">4-Year Vesting</h4>
                <p className="text-xs text-muted-foreground mb-3">Founders & Team</p>
                <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
                  Builds Trust
                </span>
              </div>

              {/* Center — GAIA Emblem */}
              <div className="relative mx-auto">
                {/* Orbit ring */}
                <div
                  className="absolute -inset-4 rounded-full border border-dashed border-border/60"
                  style={{ animation: 'emblemSpin 20s linear infinite' }}
                >
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/60" />
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-green-600/60 dark:bg-green-400/60"
                  />
                  <span
                    className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground/40"
                  />
                </div>
                {/* Emblem */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex flex-col items-center justify-center text-center shadow-sm">
                  <span className="font-bold text-2xl sm:text-3xl tracking-tight text-primary">GAIA</span>
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary/60 mt-0.5">Token</span>
                  <span className="text-[10px] text-muted-foreground mt-2 px-2">Real Energy — Tangible Value</span>
                </div>
              </div>

              {/* Right — Governance */}
              <div className="bg-muted/50 border border-border rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-md">
                <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm mb-1">RECs & Carbon Credits</h4>
                <p className="text-xs text-muted-foreground mb-3">Foundation of Trust</p>
                <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
                  Builds Confidence
                </span>
              </div>
            </div>

            {/* Token Burn */}
            <div className="mt-8 pt-6 border-t border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mechInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-4 max-w-sm mx-auto bg-muted/50 border border-border rounded-xl p-4"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Token Burn Strategy</h4>
                  <p className="text-xs text-muted-foreground">50% of revenue buyback and burn, reducing supply</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <FlowConnector variant="output" />
        <MobileConnector variant="output" />

        {/* ── OUTPUT: VALUE DISTRIBUTION ── */}
        <div ref={outRef}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={outInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              Value Distribution — Benefits for Investors
            </span>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {OUTPUT_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                initial="hidden"
                animate={outInView ? 'visible' : 'hidden'}
                variants={fadeUp}
                className="group bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div className="w-11 h-11 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-base mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                {card.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/5 text-green-600 dark:text-green-400 border border-green-500/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
