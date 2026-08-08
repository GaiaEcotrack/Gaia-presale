'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, animate } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PROJECTS_DATA, type Project } from '@/data/projects'
import { useInView } from '@/hooks/use-animations'

const STATUS_CONFIG = {
  tokenizando: { label: 'Tokenizing', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  enConexion: { label: 'Connected', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  proximo: { label: 'Upcoming', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
};

function ProjectCard({ project }: { project: Project }) {
  const status = STATUS_CONFIG[project.estado];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 min-w-[350px] max-w-[400px] w-[350px] sm:w-[380px] lg:w-[400px] flex-shrink-0 select-none">
      <div className="aspect-video bg-muted flex items-center justify-center">
        {project.foto === '/projects/placeholder.jpg' ? (
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
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
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-primary">{project.tipo}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{project.anio}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-3">{project.ubicacion}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="bg-muted/50 rounded-lg px-3 py-2">
            <span className="text-muted-foreground text-xs block">Capacity</span>
            <span className="font-semibold">{project.capacidad}</span>
          </div>
          <div className="bg-muted/50 rounded-lg px-3 py-2">
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
  );
}

const CARD_GAP = 24
const AUTO_SCROLL_INTERVAL = 4000

export function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useRef(0)
  const animating = useRef(false)
  const autoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pausedRef = useRef(false)
  const [isPaused, setIsPaused] = useState(false)
  const [visibleCards, setVisibleCards] = useState(3)
  const [cardWidth, setCardWidth] = useState(400)

  const total = PROJECTS_DATA.length
  const { ref: headerRef, isInView: headerInView } = useInView(0.2)
  // Clone 3 cards at start and 3 at end for infinite loop
  const clonesBefore = PROJECTS_DATA.slice(-3)
  const clonesAfter = PROJECTS_DATA.slice(0, 3)
  const extended = [...clonesBefore, ...PROJECTS_DATA, ...clonesAfter]

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        if (w < 640) {
          setVisibleCards(1)
          setCardWidth(Math.min(350, w - 32))
        } else if (w < 1024) {
          setVisibleCards(2)
          setCardWidth(380)
        } else {
          setVisibleCards(3)
          setCardWidth(400)
        }
      }
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  const getStep = useCallback(() => cardWidth + CARD_GAP, [cardWidth])

  const getIndexOffset = useCallback((realIndex: number) => {
    // Offset to center the active card
    const containerWidth = containerRef.current?.offsetWidth ?? 0
    return 0
  }, [])

  const moveToReal = useCallback((realIndex: number, withAnimation = true) => {
    if (animating.current) return

    // realIndex is 0-based within PROJECTS_DATA
    // extended array starts with 3 clones, so actual position = realIndex + 3
    const extendedIndex = realIndex + 3
    const step = getStep()
    const targetX = -(extendedIndex * step)

    if (withAnimation) {
      animating.current = true
      const startX = x.current
      const diff = targetX - startX
      const duration = Math.min(Math.abs(diff) / 1000, 0.6)

      animate(startX, targetX, {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        mass: 0.8,
        onUpdate: (v) => {
          x.current = v
          if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${v}px)`
          }
        },
        onComplete: () => {
          animating.current = false
        },
      })
    } else {
      x.current = targetX
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${targetX}px)`
      }
    }

    setCurrentIndex(realIndex)
  }, [getStep])

  const goToNext = useCallback(() => {
    const next = currentIndex + 1
    if (next >= total) {
      // Jump to 0 via clone zone
      // First go to clone (which looks like index 0)
      const fakeNext = next // = total, which in extended = total + 3
      const step = getStep()
      const targetX = -(fakeNext + 3) * step

      animating.current = true
      animate(x.current, targetX, {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        mass: 0.8,
        onUpdate: (v) => {
          x.current = v
          if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${v}px)`
          }
        },
        onComplete: () => {
          // Now instant jump back to real index 0
          setCurrentIndex(0)
          const realTargetX = -(0 + 3) * step
          x.current = realTargetX
          if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${realTargetX}px)`
          }
          animating.current = false
        },
      })
    } else {
      moveToReal(next)
    }
  }, [currentIndex, total, getStep, moveToReal])

  const goToPrev = useCallback(() => {
    const prev = currentIndex - 1
    if (prev < 0) {
      // Jump to last via clone zone
      const step = getStep()
      const fakePrev = -1 // in extended = -1 + 3 = 2
      const targetX = -(fakePrev + 3) * step

      animating.current = true
      animate(x.current, targetX, {
        type: 'spring',
        stiffness: 200,
        damping: 25,
        mass: 0.8,
        onUpdate: (v) => {
          x.current = v
          if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${v}px)`
          }
        },
        onComplete: () => {
          // Instant jump to real last index
          const lastIndex = total - 1
          setCurrentIndex(lastIndex)
          const realTargetX = -(lastIndex + 3) * step
          x.current = realTargetX
          if (trackRef.current) {
            trackRef.current.style.transform = `translateX(${realTargetX}px)`
          }
          animating.current = false
        },
      })
    } else {
      moveToReal(prev)
    }
  }, [currentIndex, total, getStep, moveToReal])

  // Auto scroll
  useEffect(() => {
    const startAuto = () => {
      stopAuto()
      autoTimerRef.current = setInterval(() => {
        if (!pausedRef.current && !animating.current) {
          goToNext()
        }
      }, AUTO_SCROLL_INTERVAL)
    }

    const stopAuto = () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current)
        autoTimerRef.current = null
      }
    }

    startAuto()
    return stopAuto
  }, [goToNext])

  const handlePause = () => {
    pausedRef.current = true
    setIsPaused(true)
  }

  const handleResume = () => {
    pausedRef.current = false
    setIsPaused(false)
  }

  // Set initial position
  useEffect(() => {
    const step = getStep()
    const initialX = -(3) * step
    x.current = initialX
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${initialX}px)`
    }
  }, [getStep])

  return (
    <section id="projects" className="py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
            Real Projects
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Real Renewable Energy Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            12 real solar energy projects in Colombia, with over 200 kWp installed.
            Each project is verified by an IoT oracle that measures production in real time.
          </p>
        </motion.div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={handlePause}
          onMouseLeave={handleResume}
        >
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-5 z-20 w-11 h-11 rounded-full bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-all hidden sm:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-5 z-20 w-11 h-11 rounded-full bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-all hidden sm:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Cards Track */}
          <div
            ref={containerRef}
            className="overflow-hidden mx-0 sm:mx-4"
          >
            <div
              ref={trackRef}
              className="flex"
              style={{ gap: CARD_GAP, willChange: 'transform' }}
            >
              {extended.map((project, i) => (
                <ProjectCard key={`${project.id}-${i}`} project={project} />
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {PROJECTS_DATA.map((_, i) => (
              <button
                key={i}
                onClick={() => moveToReal(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'bg-primary w-8'
                    : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* Play/Pause indicator */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => {
                if (isPaused) {
                  handleResume()
                } else {
                  handlePause()
                }
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              {isPaused ? (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Auto-scroll paused
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                  Auto-scrolling
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex items-center justify-center gap-4 mt-4 sm:hidden">
          <button
            onClick={goToPrev}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {currentIndex + 1} / {total}
          </span>
          <button
            onClick={goToNext}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
