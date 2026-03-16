import Image from 'next/image'
import Link from 'next/link'
import { getImageUrl } from '@/lib/directus'

export interface HeroBlockData {
  titre: string
  sous_titre?: string
  image_fond?: string | null
  video_fond?: string | null
  bouton_label?: string
  bouton_lien?: string
  bouton2_label?: string
  bouton2_lien?: string
}

export function HeroBlock({ data }: { data: HeroBlockData }) {
  const bgUrl = getImageUrl(data.image_fond, { width: '1920', height: '800', fit: 'cover' })

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[560px] text-center px-6 py-24 overflow-hidden border-b-2 border-vsonus-red">
      {/* Fond vidéo */}
      {data.video_fond && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={data.video_fond} />
        </video>
      )}

      {/* Fond image */}
      {!data.video_fond && bgUrl && (
        <Image
          src={bgUrl}
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      )}

      {/* Overlay sombre */}
      {(bgUrl || data.video_fond) && (
        <div className="absolute inset-0 bg-black/65" />
      )}

      {/* Contenu */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-widest text-white leading-tight">
          {data.titre}
        </h1>
        {data.sous_titre && (
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {data.sous_titre}
          </p>
        )}
        {(data.bouton_lien || data.bouton2_lien) && (
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {data.bouton_lien && data.bouton_label && (
              <Link
                href={data.bouton_lien}
                className="bg-vsonus-red text-white font-bold uppercase tracking-widest px-10 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
              >
                {data.bouton_label}
              </Link>
            )}
            {data.bouton2_lien && data.bouton2_label && (
              <Link
                href={data.bouton2_lien}
                className="border-2 border-white text-white font-bold uppercase tracking-widest px-10 py-4 hover:border-vsonus-red hover:text-vsonus-red transition-colors duration-200"
              >
                {data.bouton2_label}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
