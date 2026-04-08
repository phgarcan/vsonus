'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import Link from 'next/link'
import { getCatalogueData } from '@/app/actions/catalogue'
import { CategoryFilterBar } from './CategoryFilterBar'
import { SubCategoryBar } from './SubCategoryBar'
import { EquipementCard } from './EquipementCard'
import { PackCard } from './PackCard'
import { CAT_LABELS, SOUS_CAT_LABELS } from '@/lib/directus'
import type { Equipement, Pack } from '@/lib/directus'

// ---------------------------------------------------------------------------
// CatalogueGrid — Grille catalogue avec navigation client-side
// ---------------------------------------------------------------------------
//
// Pourquoi ce composant existe :
// React 19 + Next.js App Router souffrent d'un bug de repaint différé en
// production : les transitions de navigation entre routes RSC restent en
// attente jusqu'à un événement DOM synchrone. Conséquence : cliquer sur un
// filtre catégorie ne mettait pas à jour visuellement la page tant qu'on
// n'avait pas cliqué sur le menu burger.
//
// Solution : éliminer la navigation Next.js entre filtres. Au clic, on :
// 1. Met à jour l'URL via window.history.pushState (pas de routeur Next.js)
// 2. Appelle un Server Action pour fetcher les nouvelles données
// 3. Met à jour le state React → repaint immédiat garanti
//
// Les routes serveur (/catalogue/[cat]/[sub]) existent toujours pour le SEO
// et l'accès direct par URL. Elles font le rendu serveur initial puis passent
// la main à ce composant client.
// ---------------------------------------------------------------------------

interface Props {
  initialEquipements: Equipement[]
  initialPacks: Pack[]
  initialSousCategories: string[]
  initialCategorie?: string
  initialSousCategorie?: string
}

export function CatalogueGrid({
  initialEquipements,
  initialPacks,
  initialSousCategories,
  initialCategorie,
  initialSousCategorie,
}: Props) {
  const [equipements, setEquipements] = useState(initialEquipements)
  const [packs, setPacks] = useState(initialPacks)
  const [sousCategories, setSousCategories] = useState(initialSousCategories)
  const [activeCategorie, setActiveCategorie] = useState(initialCategorie)
  const [activeSousCategorie, setActiveSousCategorie] = useState(initialSousCategorie)
  const [isPending, startTransition] = useTransition()

  // Helper : appelle le Server Action et met à jour le state
  const fetchAndUpdate = useCallback((cat?: string, sous?: string) => {
    startTransition(async () => {
      const data = await getCatalogueData({ categorie: cat, sousCategorie: sous })
      setEquipements(data.equipements)
      setPacks(data.packs)
      setSousCategories(data.sousCategories)
    })
  }, [])

  // Click sur un filtre catégorie
  const handleCategorieClick = useCallback(
    (slug: string | null) => {
      const newCat = slug ?? undefined
      const newUrl = slug ? `/catalogue/${slug}` : '/catalogue'
      window.history.pushState({}, '', newUrl)
      setActiveCategorie(newCat)
      setActiveSousCategorie(undefined)
      fetchAndUpdate(newCat, undefined)
    },
    [fetchAndUpdate]
  )

  // Click sur un filtre sous-catégorie
  const handleSousCategorieClick = useCallback(
    (slug: string | null) => {
      if (!activeCategorie) return
      const newSous = slug ?? undefined
      const newUrl = slug
        ? `/catalogue/${activeCategorie}/${slug}`
        : `/catalogue/${activeCategorie}`
      window.history.pushState({}, '', newUrl)
      setActiveSousCategorie(newSous)
      fetchAndUpdate(activeCategorie, newSous)
    },
    [activeCategorie, fetchAndUpdate]
  )

  // Listener back/forward navigateur — re-parse l'URL et refetch
  useEffect(() => {
    const handler = () => {
      const path = window.location.pathname
      const segs = path.split('/').filter(Boolean)
      // segs[0] = 'catalogue', segs[1] = categorie, segs[2] = sous_categorie
      const cat = segs[0] === 'catalogue' && segs[1] ? segs[1] : undefined
      const sous = segs[0] === 'catalogue' && segs[2] ? segs[2] : undefined
      setActiveCategorie(cat)
      setActiveSousCategorie(sous)
      fetchAndUpdate(cat, sous)
    }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [fetchAndUpdate])

  // Calculs dérivés pour le titre / breadcrumb
  const catLabel = activeCategorie ? CAT_LABELS[activeCategorie] ?? activeCategorie : null
  const sousCatLabel = activeSousCategorie
    ? SOUS_CAT_LABELS[activeSousCategorie] ?? activeSousCategorie
    : null

  const showPacks = !activeSousCategorie && packs.length > 0
  const heading = sousCatLabel || (catLabel ? `Location ${catLabel}` : 'Catalogue')
  const subtitle = sousCatLabel
    ? `${catLabel} · Matériel professionnel · Suisse Romande`
    : catLabel
      ? 'Matériel professionnel · Suisse Romande'
      : 'Location de matériel événementiel professionnel · Suisse Romande'

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-600 mb-8 uppercase tracking-widest flex-wrap">
        <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
        <span>/</span>
        {activeCategorie ? (
          <>
            <button
              type="button"
              onClick={() => handleCategorieClick(null)}
              className="hover:text-white transition-colors uppercase tracking-widest"
            >
              Catalogue
            </button>
            <span>/</span>
            {activeSousCategorie ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSousCategorieClick(null)}
                  className="hover:text-white transition-colors uppercase tracking-widest"
                >
                  {catLabel}
                </button>
                <span>/</span>
                <span className="text-gray-400">{sousCatLabel}</span>
              </>
            ) : (
              <span className="text-gray-400">{catLabel}</span>
            )}
          </>
        ) : (
          <span className="text-gray-400">Catalogue</span>
        )}
      </nav>

      <h1 className="text-3xl md:text-4xl font-black uppercase tracking-wider md:tracking-widest text-white mb-2 break-words">
        {heading}
      </h1>
      <p className="text-gray-300 mb-8">{subtitle}</p>

      {/* Filtres */}
      <CategoryFilterBar
        activeCategory={activeCategorie}
        onCategorieClick={handleCategorieClick}
      />
      {activeCategorie && (
        <SubCategoryBar
          categorie={activeCategorie}
          activeSousCategorie={activeSousCategorie}
          sousCategories={sousCategories}
          onSousCategorieClick={handleSousCategorieClick}
        />
      )}

      {/* Contenu — opacité réduite pendant le fetch pour feedback visuel */}
      <div
        className={`transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}
        aria-busy={isPending}
      >
        {/* Packs (cachés en mode sous-catégorie) */}
        {showPacks && (
          <section className="mb-14">
            <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
              Packs clé en main
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {packs.map((pack, i) => (
                <PackCard key={pack.id} pack={pack} priority={i < 2} />
              ))}
            </div>
          </section>
        )}

        {/* Équipements */}
        <section id="materiel-unitaire">
          <h2 className="text-xl font-black uppercase tracking-widest text-vsonus-red mb-6 border-b-2 border-vsonus-red pb-2">
            Matériel unitaire
          </h2>
          {equipements.length === 0 ? (
            <p className="text-gray-500 py-12 text-center">
              Aucun matériel trouvé pour cette sélection.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {equipements.map((eq, i) => (
                <EquipementCard key={eq.id} equipement={eq} priority={i < 2} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
