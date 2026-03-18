'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mounted, setMounted] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrent(index)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 150)
  }, [])

  const prev = useCallback(() => {
    goTo((current - 1 + allImages.length) % allImages.length)
  }, [current, allImages.length, goTo])

  const next = useCallback(() => {
    goTo((current + 1) % allImages.length)
  }, [current, allImages.length, goTo])

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

  useEffect(() => {
    if (thumbsRef.current) {
      const active = thumbsRef.current.children[current] as HTMLElement | undefined
      active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [current])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(diff) > 60) {
      if (diff < 0) next()
      else prev()
    }
    touchStartX.current = null
  }

  if (!mounted) return null

  const lightbox = (
    <div
      className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[10000] w-12 h-12 border border-gray-700 bg-black/80 flex items-center justify-center text-gray-400 hover:text-white hover:border-vsonus-red transition-colors"
        aria-label="Fermer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main image area */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-4 md:px-20"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {allImages[current] && (
          <img
            src={allImages[current]}
            alt={`${realisation.titre} — photo ${current + 1}`}
            className="max-w-[90vw] max-h-[75vh] w-auto h-auto object-contain mx-auto transition-opacity duration-200 ease-in-out"
            style={{ opacity: isTransitioning ? 0 : 1 }}
          />
        )}

        {/* Navigation arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-12 h-16 md:w-14 md:h-20 border border-gray-700 bg-black/70 flex items-center justify-center text-gray-400 hover:text-white hover:border-vsonus-red hover:bg-black/90 transition-all"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-12 h-16 md:w-14 md:h-20 border border-gray-700 bg-black/70 flex items-center justify-center text-gray-400 hover:text-white hover:border-vsonus-red hover:bg-black/90 transition-all"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          </>
        )}
      </div>

      {/* Bottom panel: info + thumbnails */}
      <div className="flex-shrink-0 border-t border-gray-800 px-4 md:px-6 py-3 bg-black/80">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-3">
              {realisation.categorie && (
                <span className="text-xs font-bold uppercase tracking-widest text-vsonus-red">
                  {CAT_LABELS[realisation.categorie] ?? realisation.categorie}
                </span>
              )}
              {allImages.length > 1 && (
                <span className="text-xs text-gray-500">
                  {current + 1} / {allImages.length}
                </span>
              )}
            </div>
            <h2 className="text-white font-black uppercase tracking-widest text-sm md:text-lg mt-0.5">
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
        </div>

        {realisation.description && (
          <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-2 line-clamp-2">
            {realisation.description}
          </p>
        )}

        {allImages.length > 1 && (
          <div ref={thumbsRef} className="flex gap-2 overflow-x-auto pb-1">
            {allImages.map((url, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
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

  return createPortal(lightbox, document.body)
}
