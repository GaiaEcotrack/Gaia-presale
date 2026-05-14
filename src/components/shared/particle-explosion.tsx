'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  color: string
  rotation: number
  duration: number
  delay: number
}

interface ParticleExplosionProps {
  isActive: boolean
  particleCount?: number
  colors?: string[]
  duration?: number
  onComplete?: () => void
  className?: string
}

export function ParticleExplosion({
  isActive,
  particleCount = 50,
  colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
  duration = 3,
  onComplete,
  className = '',
}: ParticleExplosionProps) {
  const [hasCompleted, setHasCompleted] = useState(false)

  const particles = useMemo(() => {
    if (!isActive || hasCompleted) return []
    
    const newParticles: Particle[] = []
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = 50 + Math.random() * 200
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance
      
      newParticles.push({
        id: i,
        x,
        y,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        duration: 0.5 + Math.random() * (duration - 0.5),
        delay: Math.random() * 0.3,
      })
    }
    return newParticles
  }, [isActive, hasCompleted, particleCount, colors, duration])

  useEffect(() => {
    if (isActive && !hasCompleted) {
      const timer = setTimeout(() => {
        setHasCompleted(true)
        onComplete?.()
      }, duration * 1000)
      return () => clearTimeout(timer)
    }
  }, [isActive, hasCompleted, duration, onComplete])

  if (!isActive || hasCompleted) {
    return null
  }

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: '50%',
            top: '50%',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            rotate: particle.rotation,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: [0.34, 1.56, 0.64, 1],
            opacity: {
              duration: particle.duration,
              times: [0, 0.8, 1],
            },
          }}
        />
      ))}
      
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.3, 0], scale: [0.5, 1.2, 1.5] }}
        transition={{ duration: duration * 0.5, ease: 'easeOut' }}
      />
      
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-white/30"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 2], opacity: [0, 0.5, 0] }}
        transition={{ duration: duration * 0.3, ease: 'easeOut' }}
      />
    </div>
  )
}