'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Ne pas scroller si un hash est présent (ancre dans la page)
    if (window.location.hash) return
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
