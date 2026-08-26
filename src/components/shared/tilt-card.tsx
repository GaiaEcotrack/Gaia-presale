'use client'

// Shared 3D tilt card — pointer-tracking perspective tilt with theme-aware
// hover glow. Built-in `transform-style: preserve-3d` so consumers can layer
// internal elements at different translateZ depths for true parallax.
//
// Accessibility: disabled under prefers-reduced-motion and coarse pointers;
// only transform changes during interaction (no transition on transform).

import { useCallback, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'

export type TiltGlowColor = 'primary' | 'green' | 'orange'

const GLOW_CLASSES: Record<TiltGlowColor, string> = {
  primary:
    'hover:border-primary/40 hover:shadow-[0_18px_50px_-18px] hover:shadow-primary/30',
  green:
    'hover:border-green-500/40 hover:shadow-[0_18px_50px_-18px] hover:shadow-green-500/30',
  orange:
    'hover:border-orange-500/40 hover:shadow-[0_18px_50px_-18px] hover:shadow-orange-500/30',
}

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: TiltGlowColor
  /** Max tilt degrees per axis. */
  intensity?: number
}

export function TiltCard({
  children,
  className = '',
  glowColor = 'primary',
  intensity = 7,
}: TiltCardProps) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (reduce || !window.matchMedia('(pointer: fine)').matches) return
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      el.style.transform = `perspective(900px) rotateX(${(-py * intensity).toFixed(2)}deg) rotateY(${(px * (intensity + 2)).toFixed(2)}deg) translateY(-3px)`
    },
    [reduce, intensity],
  )

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = ''
  }, [])

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`group will-change-transform bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 [transform-style:preserve-3d] transition-[border-color,box-shadow] duration-300 ${GLOW_CLASSES[glowColor]} ${className}`}
    >
      {children}
    </div>
  )
}
