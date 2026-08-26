'use client'

// Token Flow — "Web3 futuristic" redesign (Option A premium + 3D depth).
//
// Depth system:
//   LAYER 0 (far):    dot-grid + radial glow, slow parallax
//   LAYER 1:          glass cards with perspective entrance + pointer tilt
//   LAYER 2:          energized SVG circuit with traveling light pulses
//   LAYER 3 (near):   spherical GAIA core — sonar rings, orbitals, shimmer
//
// All colors come from theme variables. Continuous loops are disabled under
// prefers-reduced-motion, and only transform/opacity/filter are animated.

import { useCallback, useRef } from 'react'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import {
  Calendar,
  Sun,
  BarChart3,
  Shield,
  Lock,
  Flame,
  Users,
  Droplets,
  TrendingUp,
} from 'lucide-react'
import { TiltCard } from '@/components/shared/tilt-card'

/* ------------------------------------------------------------------ */
/* Content (unchanged)                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.12,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  }),
}

/** 3D flip-up entrance: cards rise out of the page plane. */
const flipUp = {
  hidden: { opacity: 0, y: 46, rotateX: -14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.75,
      delay: i * 0.12,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
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

/* ------------------------------------------------------------------ */
/* Energized SVG circuit connectors (desktop)                          */
/* ------------------------------------------------------------------ */

interface CircuitPath {
  id: string
  d: string
}

/** Three lanes converging toward the core (source) or diverging (output). */
const IN_PATHS: CircuitPath[] = [
  { id: 'in-a', d: 'M170,-8 C170,52 330,74 566,138' },
  { id: 'in-b', d: 'M600,-8 C600,58 600,72 600,138' },
  { id: 'in-c', d: 'M1030,-8 C1030,52 870,74 634,138' },
]
const OUT_PATHS: CircuitPath[] = [
  { id: 'out-a', d: 'M566,18 C330,82 170,104 170,164' },
  { id: 'out-b', d: 'M600,18 C600,84 600,98 600,164' },
  { id: 'out-c', d: 'M634,18 C870,82 1030,104 1030,164' },
]

function CircuitConnector({
  variant,
  reduceMotion,
}: {
  variant: 'source' | 'output'
  reduceMotion: boolean | null
}) {
  const paths = variant === 'source' ? IN_PATHS : OUT_PATHS
  const gradId = `${variant}-grad`
  // Stagger pulse timing so lanes don't fire in sync.
  const begins = ['0s', '0.9s', '1.8s']

  return (
    <div className="hidden lg:flex justify-center py-2" aria-hidden>
      <svg
        viewBox="0 0 1200 168"
        className="w-full max-w-7xl h-auto overflow-visible"
        fill="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
            <stop offset="55%" stopColor="hsl(var(--primary))" stopOpacity="0.55" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* Back layer — faint guide rails (depth) */}
        {paths.map((p) => (
          <path
            key={`${p.id}-rail`}
            d={p.d}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity="0.6"
          />
        ))}

        {/* Front layer — energized circuits */}
        {paths.map((p, i) => (
          <g key={p.id}>
            <path
              id={p.id}
              d={p.d}
              stroke={`url(#${gradId})`}
              strokeWidth="1.6"
              strokeDasharray="6 10"
              strokeLinecap="round"
            >
              {!reduceMotion && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="32"
                  to="0"
                  dur={`${1.6 + i * 0.35}s`}
                  repeatCount="indefinite"
                />
              )}
            </path>

            {/* Origin hex node */}
            <polygon
              points={hexPoints(pathStart(p.d))}
              className="fill-card"
              stroke="hsl(var(--primary))"
              strokeOpacity="0.5"
              strokeWidth="1.2"
            />

            {!reduceMotion && (
              <>
                {/* Traveling light pulse */}
                <circle r="3.2" fill="hsl(var(--primary))">
                  <animateMotion
                    dur={`${2.4 + i * 0.5}s`}
                    begin={begins[i]}
                    repeatCount="indefinite"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    calcMode="spline"
                    keySplines="0.4 0 0.6 1"
                  >
                    <mpath href={`#${p.id}`} />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.12;0.85;1"
                    dur={`${2.4 + i * 0.5}s`}
                    begin={begins[i]}
                    repeatCount="indefinite"
                  />
                </circle>
                {/* Glow echo trailing the pulse */}
                <circle r="7" fill="hsl(var(--primary))" opacity="0.18">
                  <animateMotion
                    dur={`${2.4 + i * 0.5}s`}
                    begin={begins[i]}
                    repeatCount="indefinite"
                  >
                    <mpath href={`#${p.id}`} />
                  </animateMotion>
                </circle>
              </>
            )}

            {/* Destination node (toward core / toward outputs) */}
            <polygon
              points={hexPoints(pathEnd(p.d))}
              className="fill-card"
              stroke="hsl(var(--primary))"
              strokeOpacity="0.7"
              strokeWidth="1.2"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}

/** Extracts the start point coordinates embedded in each path definition. */
function pathStart(d: string): [number, number] {
  const m = d.match(/M(-?[\d.]+),(-?[\d.]+)/)
  return m ? [Number(m[1]), Number(m[2])] : [0, 0]
}

/** Extracts the final on-curve point of our fixed cubic definitions. */
function pathEnd(d: string): [number, number] {
  const nums = d.match(/[CS]\s*(-?[\d.]+),(-?[\d.]+)/g)
  const last = nums?.[nums.length - 1]?.match(/(-?[\d.]+),(-?[\d.]+)$/)
  return last ? [Number(last[1]), Number(last[2])] : [600, 138]
}

/** Hexagon points centered at (x,y), r=6, pointy-top. */
function hexPoints([cx, cy]: [number, number]): string {
  const r = 6
  return Array.from({ length: 6 }, (_, k) => {
    const a = (Math.PI / 3) * k - Math.PI / 6
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')
}

/** Mobile: single vertical rail with a descending pulse. */
function MobileCircuit({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div className="flex lg:hidden justify-center py-4 relative h-16" aria-hidden>
      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-border" />
      {!reduceMotion && (
        <>
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-transparent via-primary to-transparent"
            animate={{ top: ['-10%', '90%'] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
          />
          <motion.span
            className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_2px] shadow-primary/50"
            animate={{ top: ['-6%', '96%'], opacity: [0, 1, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeIn' }}
          />
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function TokenFlowSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  const headerRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true, amount: 0.3 })
  const sourceRef = useRef(null)
  const sourceInView = useInView(sourceRef, { once: true, amount: 0.2 })
  const mechRef = useRef(null)
  const mechInView = useInView(mechRef, { once: true, amount: 0.2 })
  const outRef = useRef(null)
  const outInView = useInView(outRef, { once: true, amount: 0.2 })

  // Scroll parallax between depth layers.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })
  const bgGridY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])
  const glowY = useTransform(scrollYProgress, [0, 1], ['12%', '-12%'])
  const coreLift = useTransform(scrollYProgress, [0, 0.5, 1], [10, -14, 10])

  const perspectiveWrap = 'lg:[perspective:1100px]'
  const cardPlane = 'lg:[transform-style:preserve-3d]'

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-32 bg-muted/30 overflow-hidden"
    >
      {/* ── DEPTH LAYER 0 · dot-grid + core glow (parallax) ── */}
      <motion.div
        aria-hidden
        style={{
          y: bgGridY,
          backgroundImage:
            'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage:
            'radial-gradient(ellipse 65% 60% at 50% 45%, black 30%, transparent 78%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 65% 60% at 50% 45%, black 30%, transparent 78%)',
        }}
        className="absolute inset-0 opacity-70"
      />
      <motion.div
        aria-hidden
        style={{ y: glowY }}
        className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-primary/15 blur-[130px]"
      />

      <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${perspectiveWrap}`}>
        {/* ── HEADER ── */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6 backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              {!reduceMotion && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              )}
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
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
            <span className="flex-1 h-px bg-border/60 ml-2" aria-hidden />
          </motion.div>

          <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-5 ${cardPlane}`}>
            {SOURCE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                initial="hidden"
                animate={sourceInView ? 'visible' : 'hidden'}
                variants={flipUp}
                style={{ transformPerspective: 900 }}
              >
                <TiltCard>
                  <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-105 group-hover:bg-primary/10 transition-all duration-300">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {card.desc}
                  </p>
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
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>

        <CircuitConnector variant="source" reduceMotion={reduceMotion} />
        <MobileCircuit reduceMotion={reduceMotion} />

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
            initial={{ opacity: 0, y: 34 }}
            animate={mechInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8 lg:p-10 overflow-hidden"
          >
            {/* Energy sweep along the top edge */}
            <div className="absolute top-0 left-0 right-0 h-px overflow-hidden" aria-hidden>
              {!reduceMotion && (
                <motion.div
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                  animate={{ x: ['-120%', '340%'] }}
                  transition={{ duration: 3.6, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </div>

            <div className="grid lg:grid-cols-[1fr_auto_1fr] items-center gap-8 lg:gap-6 max-w-4xl mx-auto">
              {/* Left — Vesting */}
              <TiltCard className="!bg-muted/50 text-center !p-6">
                <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  <Lock className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm mb-1">4-Year Vesting</h4>
                <p className="text-xs text-muted-foreground mb-3">Founders &amp; Team</p>
                <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
                  Builds Trust
                </span>
              </TiltCard>

              {/* Center — GAIA Core (layered 3D sphere) */}
              <motion.div
                style={{ y: reduceMotion ? undefined : coreLift }}
                className="relative mx-auto my-2"
              >
                {/* Deep glow */}
                <div
                  aria-hidden
                  className="absolute -inset-10 rounded-full bg-primary/20 blur-3xl"
                />

                {/* Sonar rings */}
                {!reduceMotion &&
                  [0, 1].map((i) => (
                    <motion.div
                      key={i}
                      aria-hidden
                      className="absolute inset-0 rounded-full border border-primary/40"
                      animate={{ scale: [1, 1.75], opacity: [0.55, 0] }}
                      transition={{
                        duration: 2.6,
                        delay: i * 1.3,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  ))}

                {/* Counter-rotating dashed orbit */}
                <div
                  aria-hidden
                  className="absolute -inset-5 rounded-full border border-dashed border-border/70"
                  style={{
                    animation: 'emblemSpin 26s linear infinite reverse',
                  }}
                >
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                </div>

                {/* Main orbit */}
                <div
                  aria-hidden
                  className="absolute -inset-4 rounded-full border border-dashed border-primary/30"
                  style={{ animation: 'emblemSpin 18s linear infinite' }}
                >
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_2px] shadow-primary/50" />
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_2px] shadow-green-500/40" />
                  <span
                    className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/60"
                  />
                </div>

                {/* Sphere emblem */}
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border border-primary/25 flex flex-col items-center justify-center text-center shadow-[inset_0_-18px_36px_rgba(0,0,0,0.14),inset_0_14px_28px_rgba(255,255,255,0.08)] bg-gradient-to-br from-primary/20 via-primary/8 to-transparent backdrop-blur-sm">
                  {/* Top-left specular highlight (sphere illusion) */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 24%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 26%, transparent 55%)',
                    }}
                  />
                  {/* Shimmer sweep */}
                  {!reduceMotion && (
                    <motion.div
                      aria-hidden
                      className="absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-white/12"
                      animate={{ left: ['-60%', '130%'] }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        repeatDelay: 2.4,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                  <span className="relative font-bold text-2xl sm:text-3xl tracking-tight text-primary drop-shadow-[0_1px_6px] drop-shadow-primary/40">
                    GAIA
                  </span>
                  <span className="relative text-[10px] font-semibold tracking-[0.2em] uppercase text-primary/70 mt-0.5">
                    Token
                  </span>
                  <span className="relative text-[10px] text-muted-foreground mt-2 px-3">
                    Real Energy — Tangible Value
                  </span>
                </div>
              </motion.div>

              {/* Right — Governance */}
              <TiltCard className="!bg-muted/50 text-center !p-6">
                <div className="w-11 h-11 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-sm mb-1">RECs &amp; Carbon Credits</h4>
                <p className="text-xs text-muted-foreground mb-3">Foundation of Trust</p>
                <span className="inline-flex text-xs font-medium px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/10">
                  Builds Confidence
                </span>
              </TiltCard>
            </div>

            {/* Token Burn */}
            <div className="mt-8 pt-6 border-t border-border">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={mechInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-4 max-w-sm mx-auto bg-muted/50 border border-border rounded-xl p-4"
              >
                <motion.div
                  className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-orange-600 dark:text-orange-400"
                  {...(!reduceMotion && {
                    animate: { scale: [1, 1.07, 1] },
                    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
                  })}
                >
                  <Flame className="w-5 h-5" />
                </motion.div>
                <div>
                  <h4 className="font-semibold text-sm">Token Burn Strategy</h4>
                  <p className="text-xs text-muted-foreground">
                    50% of revenue buyback and burn, reducing supply
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <CircuitConnector variant="output" reduceMotion={reduceMotion} />
        <MobileCircuit reduceMotion={reduceMotion} />

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

          <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-5 ${cardPlane}`}>
            {OUTPUT_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                initial="hidden"
                animate={outInView ? 'visible' : 'hidden'}
                variants={flipUp}
                style={{ transformPerspective: 900 }}
              >
                <TiltCard glowColor="green">
                  <div className="w-11 h-11 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center justify-center mb-4 text-green-600 dark:text-green-400 group-hover:scale-105 group-hover:bg-green-500/10 transition-all duration-300">
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-base mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {card.desc}
                  </p>
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
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
