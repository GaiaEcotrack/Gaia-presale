'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { PROJECTS_DATA, type Project } from '@/data/projects'
import { useInView } from '@/hooks/use-animations'

const STATUS_CONFIG = {
  tokenizando: { label: 'Tokenizing', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  enConexion: { label: 'Connected', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  proximo: { label: 'Upcoming', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
}

const GAP = 24
const AUTO_INTERVAL = 4000

function ProjectCard({ project }: { project: Project }) {
  const status = STATUS_CONFIG[project.estado]
  return (
    <div className="flex-shrink-0 w-[85vw] sm:w-[48%] lg:w-[31.5%] bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 select-none">
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
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-primary">{project.tipo}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{project.anio}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${status.color}`}>{status.label}</span>
          </div>
        </div>
        <h3 className="text-base sm:text-lg font-semibold mb-3">{project.ubicacion}</h3>
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
  )
}

export function ProjectsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null)
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
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
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
      const step = measure()
      if (step > 0) setCardWidth(step - GAP)
      goTo(0, false)
    }
    // small delay to ensure DOM is ready
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
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [goToNext, isPaused])

  const togglePause = () => {
    pausedRef.current = !pausedRef.current
    setIsPaused(pausedRef.current)
  }

  return (
    <section id="projects" className="py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide uppercase mb-6">
            Real Projects
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Real Renewable Energy Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            11 real solar energy projects in Colombia. Each project is verified by an IoT oracle that measures production in real time.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative" onMouseEnter={() => { pausedRef.current = true }} onMouseLeave={() => { if (!isPaused) pausedRef.current = false }}>
          {/* Arrows — visible on all screens */}
          <button
            onClick={goToPrev}
            className="absolute left-0 top-[35%] -translate-y-1/2 -translate-x-1 sm:-translate-x-4 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-all"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-[35%] -translate-y-1/2 translate-x-1 sm:translate-x-4 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center hover:bg-muted transition-all"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Track */}
          <div ref={containerRef} className="overflow-hidden">
            <div ref={trackRef} className="flex" style={{ gap: `${GAP}px` }}>
              {PROJECTS_DATA.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
            {/* Dots — hidden on very small screens, shown on sm+ */}
            <div className="hidden sm:flex items-center gap-2">
              {PROJECTS_DATA.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'bg-primary w-6 sm:w-8'
                      : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            {/* Mobile: counter */}
            <span className="sm:hidden text-sm text-muted-foreground tabular-nums">
              {currentIndex + 1} / {total}
            </span>

            {/* Pause/Play */}
            <button
              onClick={togglePause}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors ml-2"
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span className="hidden sm:inline">{isPaused ? 'Paused' : 'Auto'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
