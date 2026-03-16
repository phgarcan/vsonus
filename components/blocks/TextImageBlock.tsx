import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/directus'

export interface TextImageBlockData {
  titre?: string
  contenu: string
  image?: string | null
  image_alignment?: 'left' | 'right'
  bouton_label?: string
  bouton_lien?: string
}

export function TextImageBlock({ data }: { data: TextImageBlockData }) {
  const imgUrl = getImageUrl(data.image, { width: '800', height: '600', fit: 'cover' })
  const isRight = data.image_alignment === 'right'

  const textCol = (
    <div className="flex flex-col justify-center space-y-4">
      {data.titre && (
        <h2 className="text-3xl font-black uppercase tracking-widest text-white leading-tight border-l-4 border-vsonus-red pl-4">
          {data.titre}
        </h2>
      )}
      <div
        className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: data.contenu }}
      />
      {data.bouton_lien && data.bouton_label && (
        <div>
          <Link
            href={data.bouton_lien}
            className="inline-block bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-3 hover:shadow-glow-red-hover transition-shadow duration-200 mt-2"
          >
            {data.bouton_label}
          </Link>
        </div>
      )}
    </div>
  )

  const imgCol = imgUrl ? (
    <div className="relative aspect-[4/3] overflow-hidden border border-gray-800">
      <Image
        src={imgUrl}
        alt={data.titre ?? ''}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </div>
  ) : null

  return (
    <section className="py-16">
      <div className={`grid grid-cols-1 ${imgCol ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
        {isRight ? (
          <>
            {textCol}
            {imgCol}
          </>
        ) : (
          <>
            {imgCol}
            {textCol}
          </>
        )}
      </div>
    </section>
  )
}
