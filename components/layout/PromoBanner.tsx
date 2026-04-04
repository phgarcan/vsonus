'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

interface PromoBannerProps {
  active: boolean
  texte: string | null
  lien: string | null
  cta: string | null
}

export function PromoBanner({ active, texte, lien, cta }: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    // Vérifier si le bandeau a été fermé pendant cette session
    const wasDismissed = sessionStorage.getItem('promo_dismissed')
    if (!wasDismissed) setDismissed(false)
  }, [])

  if (!active || !texte || dismissed) return null

  const handleDismiss = () => {
    sessionStorage.setItem('promo_dismissed', '1')
    setDismissed(true)
  }

  return (
    <div className="bg-vsonus-red text-white py-2 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
        <p className="text-sm font-bold text-center">
          {texte}
        </p>
        {lien && cta && (
          <Link
            href={lien}
            className="text-sm font-bold underline underline-offset-2 hover:text-white/80 transition-colors whitespace-nowrap"
          >
            {cta}
          </Link>
        )}
        <button
          onClick={handleDismiss}
          className="ml-auto text-white/80 hover:text-white transition-colors flex-shrink-0"
          aria-label="Fermer le bandeau"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
