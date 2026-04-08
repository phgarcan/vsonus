import Image from 'next/image'
import Link from 'next/link'
import { Users } from 'lucide-react'
import {
  getImageUrl,
  getPackUrl,
  isPromoActive,
  getPackCapacite,
  getPackPrixEffectif,
} from '@/lib/directus'
import type { Pack } from '@/lib/directus'
import { AddToCartButton } from './AddToCartButton'

interface Props {
  pack: Pack
  priority?: boolean
}

/** Extrait la première ligne d'une description pack (sans le détail matériel) */
function truncatePackDescription(desc: string): string {
  let text = desc.replace(/^Adapté pour\s*:\s*/i, '')
  const sepIndex = Math.min(
    ...['\n', '•', '·'].map((s) => {
      const i = text.indexOf(s)
      return i === -1 ? Infinity : i
    })
  )
  if (sepIndex !== Infinity) text = text.slice(0, sepIndex).trim()
  if (text.length > 80) text = text.slice(0, 80).trim() + '…'
  return text
}

export function PackCard({ pack, priority = false }: Props) {
  const imageUrl = getImageUrl(pack.image_principale, { width: '400', fit: 'contain' })

  return (
    <article className="bg-vsonus-dark border-2 border-vsonus-red flex flex-col hover:shadow-glow-red hover:scale-[1.02] transition-all duration-300 group">
      <Link href={getPackUrl(pack)} className="block">
        <div className="relative w-full aspect-[4/3] bg-white overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={pack.nom}
              fill
              priority={priority}
              className="object-contain group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700 text-4xl">★</div>
          )}
          <span className="absolute top-2 left-2 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
            Pack
          </span>
          {isPromoActive(pack) && (
            <span className="absolute top-2 right-2 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider animate-pulse">
              {pack.promo_label || 'PROMO'}
            </span>
          )}
        </div>

        <div className="p-4 pb-2 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-sm leading-tight group-hover:text-vsonus-red transition-colors">
              {pack.nom}
            </h3>
            {pack.marque && (
              <span className="text-[10px] text-gray-400 border border-gray-600 px-1.5 py-0.5 uppercase tracking-wider whitespace-nowrap flex-shrink-0">
                {pack.marque}
              </span>
            )}
          </div>
          {getPackCapacite(pack) && (
            <p className="text-xs text-gray-300 mt-1 font-medium flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              {getPackCapacite(pack)}
            </p>
          )}
          {pack.description && (
            <p className="text-xs text-gray-300 mt-1 line-clamp-2">{truncatePackDescription(pack.description)}</p>
          )}
          <div className="mt-3">
            {isPromoActive(pack) ? (
              <>
                <span className="text-gray-500 text-sm line-through mr-2">{pack.prix_base.toFixed(2)}</span>
                <span className="text-vsonus-red font-black text-lg">{getPackPrixEffectif(pack).toFixed(2)}</span>
              </>
            ) : (
              <span className="text-vsonus-red font-black text-lg">{pack.prix_base.toFixed(2)}</span>
            )}
            <span className="text-gray-500 text-xs ml-1">CHF / événement</span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-2">
        <AddToCartButton type="pack" item={pack} />
      </div>
    </article>
  )
}
