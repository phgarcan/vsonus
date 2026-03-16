import Link from 'next/link'

export interface CtaBlockData {
  titre: string
  texte?: string
  bouton_label: string
  bouton_lien: string
  bouton2_label?: string
  bouton2_lien?: string
  variante?: 'default' | 'minimal'
}

export function CtaBlock({ data }: { data: CtaBlockData }) {
  if (data.variante === 'minimal') {
    return (
      <section className="py-12 border-t border-gray-800 text-center">
        <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-4">{data.titre}</h2>
        {data.texte && <p className="text-gray-400 mb-6 max-w-lg mx-auto">{data.texte}</p>}
        <Link
          href={data.bouton_lien}
          className="inline-block border-2 border-vsonus-red text-vsonus-red font-bold uppercase tracking-widest px-8 py-4 hover:bg-vsonus-red hover:text-white transition-colors duration-200"
        >
          {data.bouton_label}
        </Link>
      </section>
    )
  }

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Bande décorative rouge */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-vsonus-red" />
      <div className="absolute right-0 top-0 bottom-0 w-1 bg-vsonus-red" />

      <div className="bg-vsonus-dark border-t-2 border-b-2 border-vsonus-red px-8 md:px-16 py-14 text-center">
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-white mb-4">
          {data.titre}
        </h2>
        {data.texte && (
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            {data.texte}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href={data.bouton_lien}
            className="bg-vsonus-red text-white font-bold uppercase tracking-widest px-10 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
          >
            {data.bouton_label}
          </Link>
          {data.bouton2_lien && data.bouton2_label && (
            <Link
              href={data.bouton2_lien}
              className="border-2 border-gray-500 text-gray-300 font-bold uppercase tracking-widest px-10 py-4 hover:border-white hover:text-white transition-colors duration-200"
            >
              {data.bouton2_label}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
