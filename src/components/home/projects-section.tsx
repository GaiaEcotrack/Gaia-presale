'use client'

// Projects carousel — "Solar Harvest" coverflow 3D (Option A premium).
//
// Scene: perspective container; each card transforms by its distance to the
// active slide (translateZ / rotateY / scale / opacity) producing a true
// orbital carousel. The ACTIVE card runs the Solar Harvest effect set:
//   🌞 rotating sun rays + warm corner glow over the photo
//   ⚡ energy motes rising from the panel edge
//   🔋 floating glass chip with capacity (translateZ parallax)
//   ✨ shimmer sweep across the image
//
// Depth layers: section dot-grid/glow (parallax) -> scene -> cards
// (preserve-3d with internal translateZ layers). All colors from theme vars.
// Continuous loops disabled under prefers-reduced-motion.

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Zap,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { PROJECTS_DATA, type Project } from '@/data/projects'
import { useInView } from '@/hooks/use-animations'
import { TiltCard } from '@/components/shared/tilt-card'

const STATUS_CONFIG = {
  tokenizando: { label: 'Tokenizing', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  enConexion: { label: 'Connected', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  proximo: { label: 'Upcoming', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
}

const GAP = 24
const AUTO_INTERVAL = 4000

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function ProjectCard({
  project,
  isActive,
}: {
  project: Project
  isActive: boolean
}) {
  const status = STATUS_CONFIG[project.estado]
  const reduce = useReducedMotion()

  const glowColor =
    project.estado === 'tokenizando'
      ? 'green'
      : project.estado === 'enConexion'
        ? 'orange'
        : 'primary'

  return (
    <TiltCard
      glowColor={glowColor}
      className={`!p-0 !bg-card !backdrop-blur-none select-none rounded-2xl ${
        isActive ? '' : '!border-border'
      }`}
    >
      {/* ── Photo zone (flat clip layer — floating siblings live above it) ── */}
      <div className="relative rounded-t-2xl overflow-hidden aspect-video bg-muted">
        {project.foto === '/projects/placeholder.jpg' ? (
          <div className="flex flex-col items-center justify-center gap-1 text-muted-foreground w-full h-full">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            <span className="text-xs">Project photo</span>
          </div>
        ) : (
          <img
            src={project.foto}
            alt={`${project.ubicacion} - ${project.tipo}`}
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
          />
        )}

        {/* Bottom gradient for depth/legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
        />

        {/* ── SOLAR HARVEST effects (active card only) ── */}
        {isActive && !reduce && (
          <>
            {/* Warm sun glow, top corner */}
            <div
              aria-hidden
              className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,214,130,0.30) 0%, rgba(255,214,130,0.10) 45%, transparent 68%)',
              }}
            />
            {/* Rotating rays (conic sweep) */}
            <motion.div
              aria-hidden
              className="absolute -top-14 -right-14 w-48 h-48"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, rgba(255,224,150,0.14) 14deg, transparent 34deg, transparent 90deg, rgba(255,224,150,0.10) 110deg, transparent 132deg)',
                borderRadius: '9999px',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
            />
            {/* Rising energy motes */}
            {[0, 1, 2, 3].map((k) => (
              <motion.span
                key={k}
                aria-hidden
                className="absolute bottom-1 w-1 h-1 rounded-full bg-green-400 shadow-[0_0_8px_2px] shadow-green-400/60"
                style={{ left: `${18 + k * 20}%` }}
                initial={{ y: 0, opacity: 0 }}
                animate={{
                  y: [-4, -78],
                  opacity: [0, 0.9, 0],
                  scale: [0.7, 1.1, 0.5],
                }}
                transition={{
                  duration: 3,
                  delay: k * 0.8,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
            {/* Shimmer sweep across the photo */}
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-1/3 skew-x-[-16deg] bg-white/10"
              initial={{ left: '-45%' }}
              animate={{ left: ['-45%', '135%'] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                repeatDelay: 3.2,
                ease: 'easeInOut',
              }}
            />
          </>
        )}
      </div>

      {/* ── Floating live chip (pops out of the photo plane) ── */}
      <div
        className="relative [transform-style:preserve-3d]"
        aria-hidden={false}
      >
        <motion.div
          className="absolute -top-5 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/85 backdrop-blur border border-border text-xs font-semibold shadow-md"
          style={{ transform: 'translateZ(34px)' }}
        >
          <Zap
            className={`w-3 h-3 ${
              isActive && !reduce ? 'text-amber-500' : 'text-muted-foreground'
            }`}
          />
          <span>{project.capacidad}</span>
          {isActive && !reduce && (
            <span className="relative flex h-1.5 w-1.5 ml-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-70" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
          )}
        </motion.div>

        {/* ── Content (preserve-3d so inner chips get parallax on tilt) ── */}
        <div className="p-5 sm:p-6 rounded-b-2xl [transform-style:preserve-3d]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-primary">{project.tipo}</span>
            <div className="flex items-center gap-2" style={{ transform: 'translateZ(24px)' }}>
              <span className="text-xs text-muted-foreground">{project.anio}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-3">{project.ubicacion}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div
              className="bg-muted/50 rounded-lg px-3 py-2"
              style={{ transform: 'translateZ(18px)' }}
            >
              <span className="text-muted-foreground text-xs block">Capacity</span>
              <span className="font-semibold">{project.capacidad}</span>
            </div>
            <div
              className="bg-muted/50 rounded-lg px-3 py-2"
              style={{ transform: 'translateZ(18px)' }}
            >
              <span className="text-muted-foreground text-xs block">Annual energy</span>
              <span className="font-semibold">{project.energiaAnual}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-2">
            <span className="font-medium">Modules:</span> {project.tecnologia}
          </div>
          <div className="text-sm text-muted-foreground mb-3">
            <span className="font-medium">Inverter:</span> {project.inversor}
          </div>
          <p className="text-sm text-muted-foreground border-t border-border pt-3">
            {project.descripcion}
          </p>
        </div>
      </div>
    </TiltCard>
  )
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reduceMotion = useReducedMotion()
  const { ref: headerRef, isInView: headerInView } = useInView(0.2)

  const total = PROJECTS_DATA.length

  const measure = useCallback(() => {
    const track = trackRef.current
    if (!track || !track.children[0]) return 0
    return (track.children[0] as HTMLElement).offsetWidth + GAP
  }, [])

  const getTranslateX = useCallback((index: number) => {
    const step = measure()
    if (!step) return 0
    const container = containerRef.current
    const containerWidth = container ? container.offsetWidth : 0
    const centerOffset = (containerWidth - step + GAP) / 2
    return -(index * step) + centerOffset
  }, [measure])

  const goTo = useCallback((index: number, withTransition = true) => {
    const track = trackRef.current
    if (!track) return

    const clamped = Math.max(0, Math.min(index, total - 1))
    const x = getTranslateX(clamped)

    if (withTransition) {
      track.style.transition = 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)'
    } else {
      track.style.transition = 'none'
    }
    track.style.transform = `translateX(${x}px)`
    setCurrentIndex(clamped)
  }, [total, getTranslateX])

  const goToNext = useCallback(() => {
    goTo(currentIndex >= total - 1 ? 0 : currentIndex + 1)
  }, [currentIndex, total, goTo])

  const goToPrev = useCallback(() => {
    goTo(currentIndex <= 0 ? total - 1 : currentIndex - 1)
  }, [currentIndex, total, goTo])

  // Measure + set initial position
  useEffect(() => {
    const init = () => {
      goTo(0, false)
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(init))
    return () => cancelAnimationFrame(raf)
  }, [measure, goTo])

  // Recalculate on resize
  useEffect(() => {
    const onResize = () => goTo(currentIndex, false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [currentIndex, goTo])

  // Auto scroll
  useEffect(() => {
    if (autoRef.current) clearInterval(autoRef.current)
    if (!pausedRef.current) {
      autoRef.current = setInterval(goToNext, AUTO_INTERVAL)
    }
    return () => {
      if (autoRef.current) clearInterval(autoRef.current)
    }
  }, [goToNext, isPaused])

  const togglePause = () => {
    pausedRef.current = !pausedRef.current
    setIsPaused(pausedRef.current)
  }

  /** Coverflow depth transform per card distance. */
  const depthStyle = (i: number): React.CSSProperties => {
    const dist = i - currentIndex
    const abs = Math.min(Math.abs(dist), 3)
    const dir = Math.sign(dist)

    const transition =
      'transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease, filter 0.55s ease'

    if (abs === 0) {
      return {
        transform: 'translateZ(0px)',
        opacity: 1,
        filter: 'none',
        zIndex: 10,
        pointerEvents: 'auto',
        transition,
      }
    }

    return {
      transform: `translateZ(${(-170 * abs).toFixed(0)}px) rotateY(${(
        dir * -15 * Math.min(abs, 2)
      ).toFixed(1)}deg) scale(${(1 - 0.11 * abs).toFixed(3)})`,
      opacity: abs === 1 ? 0.45 : 0.16,
      filter: abs > 1 ? 'blur(2px)' : 'saturate(0.85)',
      zIndex: 10 - abs,
      pointerEvents: 'none',
      transition,
    }
  }

  return (
    <section id="projects" className="relative py-20 lg:py-32 overflow-hidden">
      {/* ── Ambient depth layer ── */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage:
            'radial-gradient(ellipse 62% 58% at 50% 46%, black 28%, transparent 76%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 62% 58% at 50% 46%, black 28%, transparent 76%)',
        }}
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-green-500/10 blur-[130px]"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Header ── */}
        <div ref={headerRef} className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55 }}
            className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6 backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              {!reduceMotion && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              )}
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
            </span>
            Real Projects
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-3xl sm:text-4xl font-bold mb-4"
          >
            Real Renewable Energy Projects
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            11 real solar energy projects in Colombia. Each project is verified by an IoT oracle that measures production in real time.
          </motion.p>
        </div>

        {/* ── Carousel scene ── */}
        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Real projects carousel"
          className="relative lg:[perspective:1200px]"
          onMouseEnter={() => {
            pausedRef.current = true
          }}
          onMouseLeave={() => {
            if (!isPaused) pausedRef.current = false
          }}
        >
          {/* Arrows */}
          <button
            onClick={goToPrev}
            aria-label="Previous project"
            className="absolute left-0 top-[35%] -translate-y-1/2 -translate-x-1 sm:-translate-x-4 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center hover:border-primary/40 hover:shadow-[0_0_24px_-6px] hover:shadow-primary/40 transition-all"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={goToNext}
            aria-label="Next project"
            className="absolute right-0 top-[35%] -translate-y-1/2 translate-x-1 sm:translate-x-4 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center hover:border-primary/40 hover:shadow-[0_0_24px_-6px] hover:shadow-primary/40 transition-all"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Track — preserve-3d so per-card Z composes into the scene */}
          <div ref={containerRef} className="overflow-hidden py-2">
            <div
              ref={trackRef}
              className="flex items-stretch lg:[transform-style:preserve-3d]"
              style={{ gap: `${GAP}px` }}
            >
              {PROJECTS_DATA.map((project, i) => (
                <div
                  key={project.id}
                  className="flex-shrink-0 w-[85vw] sm:w-[48%] lg:w-[31.5%] lg:[transform-style:preserve-3d]"
                  style={depthStyle(i)}
                >
                  <ProjectCard project={project} isActive={i === currentIndex} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="flex flex-col items-center gap-3 mt-6 sm:mt-8">
            {/* Autoplay energy bar */}
            <div className="w-full max-w-xs h-[3px] rounded-full bg-border/70 overflow-hidden" aria-hidden>
              {isPaused || reduceMotion ? (
                <div className="h-full w-full bg-primary/25" />
              ) : (
                <motion.div
                  key={currentIndex}
                  className="h-full origin-left bg-gradient-to-r from-primary to-green-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: AUTO_INTERVAL / 1000, ease: 'linear' }}
                />
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              {/* Segmented dots */}
              <div className="hidden sm:flex items-center gap-2">
                {PROJECTS_DATA.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to project ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex
                        ? 'bg-primary w-6 sm:w-8 shadow-[0_0_10px_-2px] shadow-primary/60'
                        : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>

              {/* Mobile counter */}
              <span className="sm:hidden text-sm text-muted-foreground tabular-nums">
                {currentIndex + 1} / {total}
              </span>

              <button
                onClick={togglePause}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
                aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span className="hidden sm:inline">{isPaused ? 'Paused' : 'Auto'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
