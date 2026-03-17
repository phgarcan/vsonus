'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, MapPin, Calendar } from 'lucide-react'
import type { Realisation } from '@/lib/directus'

interface Props {
  realisation: Realisation & { coverUrl: string | null; imageUrls: string[] }
  onClose: () => void
}

const CAT_LABELS: Record<string, string> = {
  sonorisation: 'Sonorisation',
  eclairage: 'Éclairage',
  scene: 'Scène',
  dj: 'DJ',
  concert: 'Concert',
  mapping: 'Mapping',
  festival: 'Festival',
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('fr-CH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function RealisationLightbox({ realisation, onClose }: Props) {
  const allImages = [
    ...(realisation.coverUrl ? [realisation.coverUrl] : []),
    ...realisation.imageUrls,
  ]
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => setCurrent((c) => (c - 1 + allImages.length) % allImages.length), [allImages.length])
  const next = useCallback(() => setCurrent((c) => (c + 1) % allImages.length), [allImages.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, prev, next])

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3">
            {realisation.categorie && (
              <span className="text-xs font-bold uppercase tracking-widest text-vsonus-red">
                {CAT_LABELS[realisation.categorie] ?? realisation.categorie}
              </span>
            )}
            {allImages.length > 1 && (
              <span className="text-xs text-gray-600">
                {current + 1} / {allImages.length}
              </span>
            )}
          </div>
          <h2 className="text-white font-black uppercase tracking-widest text-lg mt-0.5">
            {realisation.titre}
          </h2>
          <div className="flex flex-wrap gap-4 mt-1">
            {realisation.lieu && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" strokeWidth={1.5} />
                {realisation.lieu}
              </span>
            )}
            {realisation.date_evenement && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                {formatDate(realisation.date_evenement)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-vsonus-red transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image principale */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-16">
        {allImages[current] && (
          <div className="relative w-full h-full">
            <Image
              src={allImages[current]}
              alt={`${realisation.titre} — photo ${current + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        )}

        {/* Nav arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-700 bg-black/60 flex items-center justify-center text-gray-400 hover:text-white hover:border-vsonus-red transition-colors"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 border border-gray-700 bg-black/60 flex items-center justify-center text-gray-400 hover:text-white hover:border-vsonus-red transition-colors"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Description + thumbnails */}
      <div className="flex-shrink-0 border-t border-gray-800 px-6 py-4 max-h-40 overflow-y-auto">
        {realisation.description && (
          <p className="text-gray-400 text-sm leading-relaxed mb-3">{realisation.description}</p>
        )}
        {allImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative flex-shrink-0 w-16 h-16 overflow-hidden border-2 transition-colors ${
                  i === current ? 'border-vsonus-red' : 'border-gray-800 hover:border-gray-500'
                }`}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
