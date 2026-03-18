'use client'

/* eslint-disable @next/next/no-img-element */

const BRANDS = [
  { name: 'L-Acoustics', src: '/images/brands/l-acoustics.svg' },
  { name: 'Yamaha', src: '/images/brands/yamaha.svg' },
  { name: 'Pioneer', src: '/images/brands/pioneer.svg' },
  { name: 'AlphaTheta', src: '/images/brands/alphatheta.svg' },
  { name: 'Shure', src: '/images/brands/shure.svg' },
  { name: 'QSC', src: '/images/brands/qsc.svg' },
  { name: 'Robe', src: '/images/brands/robe.svg' },
  { name: 'Chauvet', src: '/images/brands/chauvet.svg' },
  { name: 'Global Truss', src: '/images/brands/global-truss.svg' },
  { name: 'VMB', src: '/images/brands/vmb.svg' },
  { name: 'GIS', src: '/images/brands/gis.svg' },
  { name: 'Panasonic', src: '/images/brands/panasonic.svg' },
  { name: 'Kramer', src: '/images/brands/kramer.svg' },
  { name: 'Neutrik', src: '/images/brands/neutrik.svg' },
  { name: 'Wolfmix', src: '/images/brands/wolfmix.svg' },
  { name: 'Stageworx', src: '/images/brands/stageworx.svg' },
]

export function BrandCarousel() {
  // Duplicate the list for seamless infinite scroll
  const items = [...BRANDS, ...BRANDS]

  return (
    <div className="overflow-hidden relative group">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-vsonus-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-vsonus-black to-transparent z-10 pointer-events-none" />

      <div
        className="flex items-center gap-12 md:gap-16 animate-scroll group-hover:[animation-play-state:paused]"
        style={{ width: 'max-content' }}
      >
        {items.map((brand, i) => (
          <img
            key={`${brand.name}-${i}`}
            src={brand.src}
            alt={brand.name}
            className="h-8 md:h-10 w-auto flex-shrink-0 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
          />
        ))}
      </div>
    </div>
  )
}
