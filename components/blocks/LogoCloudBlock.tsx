import Image from 'next/image'
import { getImageUrl } from '@/lib/directus'

export interface LogoItem {
  id: string
  image: string
  nom?: string
  lien?: string
}

export interface LogoCloudBlockData {
  titre?: string
  logos: LogoItem[]
}

export function LogoCloudBlock({ data }: { data: LogoCloudBlockData }) {
  return (
    <section className="py-12 border-t border-gray-800">
      {data.titre && (
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-600 mb-8">
          {data.titre}
        </p>
      )}
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {data.logos.map((logo) => {
          const imgUrl = getImageUrl(logo.image, { width: '200', height: '80', fit: 'contain' })
          if (!imgUrl) return null

          const img = (
            <div key={logo.id} className="relative h-10 w-28 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300">
              <Image
                src={imgUrl}
                alt={logo.nom ?? ''}
                fill
                className="object-contain"
                sizes="112px"
              />
            </div>
          )

          if (logo.lien) {
            return (
              <a key={logo.id} href={logo.lien} target="_blank" rel="noopener noreferrer">
                {img}
              </a>
            )
          }
          return img
        })}
      </div>
    </section>
  )
}
