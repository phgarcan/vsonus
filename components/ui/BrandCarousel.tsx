'use client'

/* eslint-disable @next/next/no-img-element */

export interface BrandItem {
  name: string
  src: string
  url?: string | null
}

const FALLBACK_BRANDS: BrandItem[] = [
  { name: 'L-Acoustics', src: '/images/brands/l-acoustics.svg', url: 'https://www.l-acoustics.com' },
  { name: 'Yamaha', src: '/images/brands/yamaha.png', url: 'https://www.yamaha.com' },
  { name: 'Pioneer', src: '/images/brands/pioneer.png', url: 'https://www.pioneerdj.com' },
  { name: 'AlphaTheta', src: '/images/brands/alphatheta.png', url: 'https://www.alphatheta.com' },
  { name: 'Shure', src: '/images/brands/shure.png', url: 'https://www.shure.com' },
  { name: 'QSC', src: '/images/brands/qsc.png', url: 'https://www.qsc.com' },
  { name: 'Robe', src: '/images/brands/robe.png', url: 'https://www.rfrobe.com' },
  { name: 'Chauvet', src: '/images/brands/chauvet.png', url: 'https://www.chauvetprofessional.com' },
  { name: 'Global Truss', src: '/images/brands/global-truss.png', url: 'https://www.globaltruss.com' },
  { name: 'VMB', src: '/images/brands/vmb.png', url: 'https://www.vmb.com' },
  { name: 'GIS', src: '/images/brands/gis.png', url: 'https://www.gis-ag.ch' },
  { name: 'Panasonic', src: '/images/brands/panasonic.png', url: 'https://www.panasonic.com' },
  { name: 'Kramer', src: '/images/brands/kramer.png', url: 'https://www.kramerav.com' },
  { name: 'Neutrik', src: '/images/brands/neutrik.svg', url: 'https://www.neutrik.com' },
  { name: 'Wolfmix', src: '/images/brands/wolfmix.png', url: 'https://www.wolfmix.com' },
  { name: 'Stageworx', src: '/images/brands/stageworx.png', url: 'https://www.stageworx.com' },
]

interface BrandCarouselProps {
  variant?: 'dark' | 'black'
  brands?: BrandItem[]
}

export function BrandCarousel({ variant = 'black', brands }: BrandCarouselProps) {
  const source = brands && brands.length > 0 ? brands : FALLBACK_BRANDS
  const items = [...source, ...source]
  const from = variant === 'dark' ? 'from-[#231F20]' : 'from-black'

  return (
    <div className="overflow-hidden relative group">
      {/* Fade edges */}
      <div className={`absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r ${from} to-transparent z-10 pointer-events-none`} />
      <div className={`absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l ${from} to-transparent z-10 pointer-events-none`} />

      <div className="flex items-center gap-14 md:gap-20 brand-scroll group-hover:[animation-play-state:paused]">
        {items.map((brand, i) => {
          const img = (
            <img
              src={brand.src}
              alt={brand.name}
              className="h-10 md:h-12 w-auto max-w-[140px] md:max-w-[180px] object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'none' }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(0) invert(1)' }}
            />
          )

          return brand.url ? (
            <a
              key={`${brand.name}-${i}`}
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 opacity-40 hover:opacity-100 transition-all duration-300"
              title={brand.name}
            >
              {img}
            </a>
          ) : (
            <span
              key={`${brand.name}-${i}`}
              className="flex-shrink-0 opacity-40 hover:opacity-100 transition-all duration-300"
              title={brand.name}
            >
              {img}
            </span>
          )
        })}
      </div>

      <style jsx>{`
        .brand-scroll {
          display: flex;
          width: max-content;
          animation: brand-scroll 40s linear infinite;
        }
        @keyframes brand-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
