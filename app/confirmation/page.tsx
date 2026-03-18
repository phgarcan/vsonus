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
    <div className="max-w-2xl mx-auto px-6 py-20">

      {/* En-tête succès */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-vsonus-red mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-4">
          Demande envoyée !
        </h1>
        <p className="text-gray-400 leading-relaxed">
          Votre demande de devis a bien été enregistrée. Un email de confirmation vous a été envoyé.
          Notre équipe vous répondra <strong className="text-white">dans les 24 heures</strong>.
        </p>
        {id && (
          <p className="text-xs text-gray-600 mt-3">
            Référence : <span className="font-mono text-gray-400">{id}</span>
          </p>
        )}
      </div>

      {/* Processus 4 étapes */}
      <div className="border-t border-gray-800 pt-10 mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-6">
          La suite du processus
        </p>
        <ol className="space-y-0">
          {[
            { n: 1, label: 'Vérification de la disponibilité du matériel pour vos dates.' },
            { n: 2, label: 'Devis officiel envoyé par email sous 24h.' },
            { n: 3, label: 'Validation du devis et règlement de l\'acompte pour confirmer la réservation.' },
            { n: 4, label: 'Livraison et installation le jour J par notre équipe.' },
          ].map(({ n, label }) => (
            <li key={n} className="flex gap-4 py-4 border-b border-gray-900">
              <span className="flex-shrink-0 w-7 h-7 bg-vsonus-red text-white font-black text-xs flex items-center justify-center">
                {n}
              </span>
              <span className="text-sm text-gray-400 leading-relaxed pt-0.5">{label}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Note info */}
      <div className="bg-vsonus-dark border-l-2 border-vsonus-red px-5 py-4 mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-vsonus-red mb-2">À savoir</p>
        <ul className="space-y-1 text-sm text-gray-500 leading-relaxed">
          <li>• Annulation gratuite jusqu'à 5 jours avant l'événement.</li>
          <li>• Le devis officiel fera foi — ce récapitulatif est indicatif.</li>
          <li>• Une question ? <a href="tel:+41796512114" className="text-vsonus-red hover:underline">+41 79 651 21 14</a></li>
        </ul>
      </div>

      {/* Espace client */}
      <div className="bg-vsonus-dark border border-gray-800 px-5 py-4 mb-10">
        <p className="text-sm text-gray-400 leading-relaxed">
          Un espace client a été créé pour vous. Vérifiez votre email pour définir votre mot de passe et{' '}
          <Link href="/mon-compte/connexion" className="text-vsonus-red hover:underline font-bold">
            suivre vos réservations
          </Link>.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-700 text-gray-400 font-bold uppercase tracking-widest px-6 py-3 hover:border-white hover:text-white transition-colors text-sm"
        >
          Accueil
        </Link>
        <Link
          href="/catalogue"
          className="flex-1 flex items-center justify-center gap-2 bg-vsonus-red text-white font-bold uppercase tracking-widest px-6 py-3 hover:bg-red-700 transition-colors text-sm"
        >
          Retour au catalogue
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="square" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
