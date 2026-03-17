'use client'

import { useInView } from '@/hooks/useInView'

interface AnimateOnScrollProps {
  children: React.ReactNode
  className?: string
  /** Délai avant l'animation en ms (pour les effets en cascade) */
  delay?: number
}

export function AnimateOnScroll({ children, className = '', delay = 0 }: AnimateOnScrollProps) {
  const { ref, inView } = useInView()

  return (
    <div
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  )
}
