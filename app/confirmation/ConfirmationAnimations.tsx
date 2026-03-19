'use client'

import { useEffect, useState } from 'react'

interface Confetti {
  id: number
  left: number
  delay: number
  duration: number
  color: string
  rotation: number
  size: number
}

export function ConfirmationAnimations() {
  const [confettis, setConfettis] = useState<Confetti[]>([])

  useEffect(() => {
    const pieces: Confetti[] = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 400,
      duration: 1600 + Math.random() * 800,
      color: i % 2 === 0 ? '#EC1C24' : '#ffffff',
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 6,
    }))
    setConfettis(pieces)
  }, [])

  if (confettis.length === 0) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {confettis.map((c) => (
        <div
          key={c.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${c.left}%`,
            top: '-12px',
            width: c.size,
            height: c.size,
            backgroundColor: c.color,
            transform: `rotate(${c.rotation}deg)`,
            animationDelay: `${c.delay}ms`,
            animationDuration: `${c.duration}ms`,
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  )
}
