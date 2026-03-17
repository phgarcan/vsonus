import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions générales de location',
  description: 'Conditions générales de location de matériel événementiel V-Sonus, Vevey, Suisse.',
  robots: { index: false, follow: true },
  alternates: { canonical: 'https://vsonus.ch/conditions-generales' },
}

export default function ConditionsGeneralesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <nav className="text-xs text-gray-600 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        <span className="text-gray-400">Conditions générales</span>
      </nav>

      <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
        Conditions générales de location
      </h1>
      <div className="w-12 h-1 bg-vsonus-red mb-2" />
      <p className="text-xs text-gray-600 mb-10">V-Sonus – Paul Villommet · Rue des Bosquets 17, 1800 Vevey, Suisse</p>

      <div className="space-y-8 text-sm text-gray-400 leading-relaxed">

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Art. 1 — Définitions</h2>
          <ul className="space-y-2">
            <li><span className="text-white font-semibold">Bailleur :</span> V-Sonus – Paul Villommet, Rue des Bosquets 17, 1800 Vevey.</li>
            <li><span className="text-white font-semibold">Locataire :</span> toute personne physique ou morale qui loue du matériel auprès de V-Sonus.</li>
            <li><span className="text-white font-semibold">Matériel :</span> l&apos;ensemble des équipements événementiels (sonorisation, éclairage, structures, mapping) mis à disposition par le bailleur.</li>
            <li><span className="text-white font-semibold">Dommages :</span> toute dégradation, détérioration ou dysfonctionnement du matériel imputable au locataire.</li>
            <li><span className="text-white font-semibold">Vol :</span> toute disparition du matériel non restituée dans les délais convenus ou signalée sans dépôt de plainte.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Art. 2 — Conditions à remplir</h2>
          <p>
            Le locataire doit être une personne physique{' '}
            <span className="text-white font-semibold">majeure (18 ans révolus)</span> ou une personne
            morale dûment représentée. Une pièce d&apos;identité valide peut être demandée au moment de
            la remise du matériel ou de la signature du contrat. Toute réservation effectuée par un
            mineur est nulle et non avenue.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Art. 3 — Utilisation du matériel</h2>
          <p>
            Le locataire s&apos;engage à :
          </p>
          <ul className="mt-2 space-y-2 list-disc list-inside">
            <li>Restituer le matériel dans l&apos;état dans lequel il lui a été remis, propre et en bon état de fonctionnement.</li>
            <li>Utiliser le matériel conformément à sa destination et aux instructions du bailleur.</li>
            <li>Ne pas sous-louer, prêter ou céder le matériel à un tiers sans accord écrit préalable du bailleur.</li>
            <li>Signaler immédiatement au bailleur toute panne, défectuosité ou dommage survenu pendant la location.</li>
            <li>Ne pas modifier, démonter ou réparer le matériel sans autorisation.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Art. 4 — Durée de location</h2>
          <p>
            La durée de location est fixée lors de la réservation.
            Elle débute à la remise du matériel et se termine à sa restitution complète.
          </p>
          <p className="mt-3">
            <span className="text-white font-semibold">Annulation :</span> l&apos;annulation est gratuite
            jusqu&apos;à <span className="text-white font-semibold">5 jours avant la date de l&apos;événement</span>.
            En deçà de ce délai, le bailleur se réserve le droit de retenir tout ou partie de l&apos;acompte versé.
          </p>
          <p className="mt-3">
            Tout dépassement de la durée convenue sera facturé au tarif journalier en vigueur.
            La restitution hors délai sans accord préalable est considérée comme une prolongation tacite.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Art. 5 — Prix et paiement</h2>
          <p>
            Le prix de location est établi selon le devis officiel transmis par V-Sonus.
            Le paiement intégral est dû{' '}
            <span className="text-white font-semibold">au moment de la confirmation de la réservation</span>.
          </p>
          <p className="mt-3">
            Un <span className="text-white font-semibold">dépôt de garantie</span> peut être exigé,
            payable en espèces (cash) ou via Twint. Il est restitué intégralement lors du retour
            du matériel en bon état.
          </p>
          <p className="mt-3">
            Tout retard de paiement entraîne des intérêts moratoires au taux légal suisse (5 % l&apos;an),
            sans mise en demeure préalable.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Art. 6 — Responsabilité et garanties</h2>
          <p>
            Le matériel est remis en bon état de fonctionnement. Le locataire assume l&apos;entière
            responsabilité du matériel dès sa prise en charge et jusqu&apos;à sa restitution au bailleur.
          </p>
          <p className="mt-3">
            En cas de dommages, de vol ou de perte, le locataire sera facturé à hauteur du coût
            de réparation ou de remplacement du matériel au prix du marché, indépendamment du
            dépôt de garantie versé.
          </p>
          <p className="mt-3">
            Le bailleur décline toute responsabilité pour les dommages indirects (perte d&apos;exploitation,
            préjudice moral, etc.) résultant d&apos;une défaillance du matériel non imputable à une faute de sa part.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Art. 7 — Force majeure</h2>
          <p>
            Aucune des parties ne saurait être tenue responsable d&apos;un manquement à ses obligations
            contractuelles résultant d&apos;un cas de force majeure : catastrophe naturelle, pandémie,
            incendie, grève, décision gouvernementale ou tout autre événement imprévisible et
            irrésistible. La partie concernée en informera l&apos;autre dans les plus brefs délais.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Art. 8 — Propriété du matériel</h2>
          <p>
            L&apos;intégralité du matériel mis à disposition reste la propriété exclusive de{' '}
            <span className="text-white font-semibold">Paul Villommet</span>.
            La location ne confère au locataire aucun droit de propriété ou de disposition sur le
            matériel. Toute tentative de vente, de mise en gage ou de cession est interdite et
            constituera une infraction pénalement répréhensible.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-white uppercase tracking-widest mb-3">Art. 9 — Traitement des données personnelles</h2>
          <p>
            Les données personnelles collectées lors de la réservation (nom, e-mail, téléphone,
            adresse) sont traitées par V-Sonus – Paul Villommet conformément à la{' '}
            <span className="text-white font-semibold">nouvelle Loi fédérale sur la protection des données (nLPD, RS 235.1)</span>.
          </p>
          <p className="mt-3">
            Ces données sont utilisées exclusivement pour la gestion de la relation contractuelle
            et ne sont jamais transmises à des tiers à des fins commerciales.
            Pour exercer vos droits (accès, rectification, suppression), contactez :{' '}
            <a href="mailto:info@vsonus.ch" className="text-vsonus-red hover:underline">info@vsonus.ch</a>.
          </p>
          <p className="mt-3">
            Pour plus de détails, consultez notre{' '}
            <Link href="/politique-de-confidentialite" className="text-vsonus-red hover:underline">
              politique de confidentialité
            </Link>.
          </p>
        </section>

        <div className="border-t border-gray-800 pt-6 space-y-1">
          <p className="text-xs text-gray-600">
            Les présentes conditions générales sont soumises au droit suisse.
            Tout litige relève de la compétence exclusive des tribunaux du canton de Vaud.
          </p>
          <p className="text-xs text-gray-600">
            Document mis à jour en 2025 · V-Sonus – Paul Villommet, Vevey
          </p>
        </div>
      </div>
    </main>
  )
}
