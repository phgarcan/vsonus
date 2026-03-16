import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Demande envoyée – V-Sonus',
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const { id } = await searchParams

  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-vsonus-red mb-6">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-4">
        Demande envoyée !
      </h1>
      <p className="text-gray-400 leading-relaxed mb-4">
        Votre demande de devis a bien été reçue. Un technicien V-Sonus vous contactera dans les plus brefs délais pour confirmer la disponibilité du matériel et vous transmettre le devis officiel.
      </p>
      {id && (
        <p className="text-xs text-gray-600 mb-8">
          Référence : <span className="font-mono text-gray-400">{id}</span>
        </p>
      )}

      <Link
        href="/catalogue"
        className="inline-block border-2 border-vsonus-red text-vsonus-red font-bold uppercase tracking-widest px-8 py-3 hover:bg-vsonus-red hover:text-white transition-colors duration-200"
      >
        Retour au catalogue
      </Link>
    </div>
  )
}
