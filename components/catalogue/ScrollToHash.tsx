'use client'

import { useEffect } from 'react'

export function ScrollToHash() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash.slice(1)
    if (!hash) return
    // Small delay to let the page render
    const timer = setTimeout(() => {
      const el = document.getElementById(hash)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return null
}
