'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Music, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
  mainImageUrl: string | null
  /** URLs des images supplémentaires (déjà transformées via getImageUrl) */
  extraImages: { full: string; thumb: string }[]
  alt: string
}

export function ProductGallery({ mainImageUrl, extraImages, alt }: ProductGalleryProps) {
  // Toutes les images : principale + extras
  const allImages = [
    ...(mainImageUrl ? [{ full: mainImageUrl, thumb: mainImageUrl }] : []),
    ...extraImages,
  ]

  const [selected, setSelected] = useState(0)
  const prev = () => setSelected((s) => (s - 1 + allImages.length) % allImages.length)
  const next = () => setSelected((s) => (s + 1) % allImages.length)

  // Pas d'images du tout
  if (allImages.length === 0) {
    return (
      <div className="relative w-full aspect-[3/2] bg-white border border-gray-800 overflow-hidden flex items-center justify-center">
        <Music className="w-12 h-12 text-gray-700" strokeWidth={1} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Image principale */}
      <div className="relative w-full aspect-[3/2] bg-white border border-gray-800 overflow-hidden group">
        <Image
          src={allImages[selected].full}
          alt={alt}
          fill
          className="object-contain p-4"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {/* Flèches navigation — visibles seulement si plus d'une image */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-black/70"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 text-white flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-black/70"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Miniatures — seulement si plus d'une image */}
      {allImages.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-16 h-16 bg-white overflow-hidden border-2 transition-colors flex-shrink-0 ${
                i === selected ? 'border-vsonus-red' : 'border-gray-800 hover:border-gray-600'
              }`}
              aria-label={`Voir image ${i + 1}`}
            >
              <Image
                src={img.thumb}
                alt={`${alt} — photo ${i + 1}`}
                fill
                className="object-contain p-1"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
