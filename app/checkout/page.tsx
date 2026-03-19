import { readItems } from '@directus/sdk'
import type { Metadata } from 'next'
import { getServerDirectus } from '@/lib/directus'
import type { TarifAnnexe } from '@/lib/directus'
import { CheckoutForm } from './CheckoutForm'

export const metadata: Metadata = {
  title: 'Ma liste – V-Sonus',
  description: 'Finalisez votre demande de devis pour la location de matériel événementiel.',
}

export default async function CheckoutPage() {
  // Chargement des tarifs annexes depuis Directus côté serveur
  const tarifsAnnexes = await getServerDirectus()
    .request(readItems('tarifs_annexes', { limit: 50 }))
    .catch(() => [] as TarifAnnexe[])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-2">
        Ma liste
      </h1>
      <p className="text-gray-400 mb-10">
        Complétez vos informations pour soumettre votre demande de devis.
      </p>

      <CheckoutForm tarifsAnnexes={tarifsAnnexes as TarifAnnexe[]} />
    </div>
  )
}
