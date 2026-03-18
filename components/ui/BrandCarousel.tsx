'use client'

/* eslint-disable @next/next/no-img-element */

const BRANDS = [
  { name: 'L-Acoustics', src: '/images/brands/l-acoustics.svg', url: 'https://www.l-acoustics.com' },
  { name: 'Yamaha', src: '/images/brands/yamaha.svg', url: 'https://www.yamaha.com' },
  { name: 'Pioneer', src: '/images/brands/pioneer.svg', url: 'https://www.pioneerdj.com' },
  { name: 'AlphaTheta', src: '/images/brands/alphatheta.svg', url: 'https://www.alphatheta.com' },
  { name: 'Shure', src: '/images/brands/shure.svg', url: 'https://www.shure.com' },
  { name: 'QSC', src: '/images/brands/qsc.svg', url: 'https://www.qsc.com' },
  { name: 'Robe', src: '/images/brands/robe.svg', url: 'https://www.rfrobe.com' },
  { name: 'Chauvet', src: '/images/brands/chauvet.svg', url: 'https://www.chauvetprofessional.com' },
  { name: 'Global Truss', src: '/images/brands/global-truss.svg', url: 'https://www.globaltruss.com' },
  { name: 'VMB', src: '/images/brands/vmb.svg', url: 'https://www.vmb.com' },
  { name: 'GIS', src: '/images/brands/gis.svg', url: 'https://www.gis-ag.ch' },
  { name: 'Panasonic', src: '/images/brands/panasonic.png', url: 'https://www.panasonic.com' },
  { name: 'Kramer', src: '/images/brands/kramer.svg', url: 'https://www.kramerav.com' },
  { name: 'Neutrik', src: '/images/brands/neutrik.svg', url: 'https://www.neutrik.com' },
  { name: 'Wolfmix', src: '/images/brands/wolfmix.svg', url: 'https://www.wolfmix.com' },
  { name: 'Stageworx', src: '/images/brands/stageworx.svg', url: 'https://www.stageworx.com' },
]

export function BrandCarousel({ variant = 'dark' }: { variant?: 'dark' | 'black' }) {
  const items = [...BRANDS, ...BRANDS]
  const from = variant === 'dark' ? 'from-vsonus-dark' : 'from-vsonus-black'

  return (
    <div className="overflow-hidden relative group">
      {/* Fade edges */}
      <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r ${from} to-transparent z-10 pointer-events-none`} />
      <div className={`absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l ${from} to-transparent z-10 pointer-events-none`} />

      <div
        className="flex items-center gap-12 md:gap-16 animate-scroll group-hover:[animation-play-state:paused]"
        style={{ width: 'max-content' }}
      >
        {items.map((brand, i) => (
          <a
            key={`${brand.name}-${i}`}
            href={brand.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 opacity-50 hover:opacity-100 transition-all duration-300"
            title={brand.name}
          >
            <img
              src={brand.src}
              alt={brand.name}
              className="h-8 md:h-10 w-auto"
              style={{ filter: 'brightness(0) invert(1)' }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = 'none' }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(0) invert(1)' }}
            />
          </a>
        ))}
      </div>
    </div>
  )
}
