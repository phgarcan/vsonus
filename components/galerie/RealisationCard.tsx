'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { Realisation } from '@/lib/directus'
import { RealisationLightbox } from './RealisationLightbox'

interface Props {
  realisation: Realisation
  coverUrl: string | null
  imageUrls: string[]
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

function formatYear(dateStr?: string): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).getFullYear().toString()
  } catch {
    return ''
  }
}

export function RealisationCard({ realisation, coverUrl, imageUrls }: Props) {
  const [open, setOpen] = useState(false)
  const hasImages = coverUrl || imageUrls.length > 0
  const extraCount = imageUrls.length

  return (
    <>
      <article
        className="group relative overflow-hidden border border-gray-800 hover:border-vsonus-red transition-colors duration-300 cursor-pointer bg-vsonus-dark"
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setOpen(true) }}
        aria-label={`Voir ${realisation.titre}`}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] bg-vsonus-black overflow-hidden">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={realisation.titre}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-800 text-5xl">♪</div>
          )}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
            <span className="text-white text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Voir les photos
            </span>
          </div>
          {/* Category badge */}
          {realisation.categorie && (
            <span className="absolute top-3 left-3 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
              {CAT_LABELS[realisation.categorie] ?? realisation.categorie}
            </span>
          )}
          {/* Extra images count */}
          {extraCount > 0 && (
            <span className="absolute bottom-3 right-3 bg-black/70 text-gray-300 text-xs font-bold px-2 py-1">
              +{extraCount} photos
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-white font-black uppercase tracking-widest text-sm leading-tight group-hover:text-vsonus-red transition-colors duration-200">
            {realisation.titre}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {realisation.lieu && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3 flex-shrink-0" strokeWidth={1.5} />
                {realisation.lieu}
              </span>
            )}
            {realisation.date_evenement && (
              <span className="text-xs text-gray-600">
                {formatYear(realisation.date_evenement)}
              </span>
            )}
          </div>
          {realisation.description && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
              {realisation.description}
            </p>
          )}
        </div>
      </article>

      {open && (
        <RealisationLightbox
          realisation={{ ...realisation, coverUrl, imageUrls }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
