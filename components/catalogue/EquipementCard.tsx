import Image from 'next/image'
import Link from 'next/link'
import { Music } from 'lucide-react'
import { getImageUrl, getEquipementUrl } from '@/lib/directus'
import type { Equipement } from '@/lib/directus'
import { AddToCartButton } from './AddToCartButton'

interface Props {
  equipement: Equipement
  priority?: boolean
}

export function EquipementCard({ equipement, priority = false }: Props) {
  const imageUrl = getImageUrl(equipement.image, { width: '400', fit: 'contain' })

  return (
    <article className="bg-vsonus-dark border border-gray-800 flex flex-col hover:border-vsonus-red hover:scale-[1.02] hover:shadow-card-hover transition-all duration-300 group">
      <Link href={getEquipementUrl(equipement)} className="block">
        <div className="relative w-full h-48 bg-white overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={equipement.nom}
              fill
              priority={priority}
              className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-8 h-8 text-gray-700" strokeWidth={1} />
            </div>
          )}
          {(equipement.technicien_obligatoire || equipement.transport_obligatoire) && (
            <span className="absolute top-2 right-2 bg-vsonus-red text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
              Tech requis
            </span>
          )}
        </div>

        <div className="p-4 pb-2">
          <h3 className="font-bold text-white text-sm leading-tight group-hover:text-vsonus-red transition-colors">
            {equipement.nom}
          </h3>
          {equipement.marque && (
            <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{equipement.marque}</p>
          )}
          {equipement.description && (
            <p className="text-xs text-gray-300 mt-2 line-clamp-2">{equipement.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-vsonus-red font-black text-lg">{equipement.prix_journalier.toFixed(2)}</span>
              <span className="text-gray-500 text-xs ml-1">CHF/jour</span>
            </div>
            <span className="text-xs text-gray-600">Stock: {equipement.stock_total}</span>
          </div>
        </div>
      </Link>

      <div className="p-4 pt-2">
        <AddToCartButton type="equipement" item={equipement} />
      </div>
    </article>
  )
}
