'use server'

import { readItems } from '@directus/sdk'
import { getServerDirectus } from '@/lib/directus'
import type { Equipement, Pack } from '@/lib/directus'

// ---------------------------------------------------------------------------
// Server Action — Récupération des données catalogue
// ---------------------------------------------------------------------------
//
// Utilisé par <CatalogueGrid> pour fetcher les données quand l'utilisateur
// change de filtre, sans déclencher une navigation Next.js (qui souffre d'un
// bug de repaint différé sous React 19 + App Router en production).
//
// L'URL est mise à jour en parallèle via window.history.pushState côté client.
// ---------------------------------------------------------------------------

const EQUIP_FIELDS = [
  'id', 'slug', 'nom', 'prix_journalier', 'stock_total',
  'technicien_obligatoire', 'transport_obligatoire', 'image',
  'categorie', 'sous_categorie', 'marque', 'description',
  'prix_livraison', 'sort',
] as const

const PACK_FIELDS = [
  'id', 'slug', 'nom', 'categorie', 'sous_categorie', 'prix_base',
  'prix_livraison', 'prix_fourgon', 'mode_livraison', 'image_principale',
  'description', 'sort', 'promo_pourcentage', 'promo_label',
  'promo_date_fin', 'capacite', 'marque',
] as const

interface CatalogueParams {
  categorie?: string
  sousCategorie?: string
}

export interface CatalogueData {
  equipements: Equipement[]
  packs: Pack[]
  sousCategories: string[]
}

export async function getCatalogueData({
  categorie,
  sousCategorie,
}: CatalogueParams): Promise<CatalogueData> {
  const client = getServerDirectus()

  // Filtres équipements
  const equipFilter: Record<string, unknown> = {}
  if (categorie) equipFilter.categorie = { _contains: categorie }
  if (sousCategorie) equipFilter.sous_categorie = { _eq: sousCategorie }

  // Pack filter (jamais en mode sous-catégorie)
  const packFilter: Record<string, unknown> = {}
  if (categorie) packFilter.categorie = { _eq: categorie }

  // Tâches parallèles
  const equipementsTask = client
    .request(
      readItems('equipements', {
        ...(Object.keys(equipFilter).length ? { filter: equipFilter } : {}),
        limit: 100,
        fields: EQUIP_FIELDS,
        sort: ['sort'],
      })
    )
    .catch(() => [] as Equipement[])

  const packsTask = sousCategorie
    ? Promise.resolve([] as Pack[])
    : client
        .request(
          readItems('packs', {
            ...(Object.keys(packFilter).length ? { filter: packFilter } : {}),
            limit: 50,
            fields: PACK_FIELDS,
            sort: ['sort'],
          })
        )
        .catch(() => [] as Pack[])

  // Si on est en mode sous-catégorie, fetch séparément tous les équipements
  // de la catégorie parente pour pouvoir extraire la liste des sous-cats.
  const sousCategoriesTask =
    sousCategorie && categorie
      ? client
          .request(
            readItems('equipements', {
              filter: { categorie: { _contains: categorie } } as Record<string, unknown>,
              limit: -1,
              fields: ['sous_categorie'],
            })
          )
          .catch(() => [] as Equipement[])
      : null

  const [equipements, packs, allCatEquip] = await Promise.all([
    equipementsTask,
    packsTask,
    sousCategoriesTask,
  ])

  // Source pour extraire les sous-catégories disponibles :
  // — Si on est en mode sous-catégorie : fetch séparé (allCatEquip)
  // — Sinon : on déduit depuis les équipements déjà fetched (qui couvrent toute la catégorie)
  const sourceForSousCats = (allCatEquip ?? equipements) as Equipement[]
  const sousCategories = [
    ...new Set(
      sourceForSousCats
        .map((eq) => eq.sous_categorie)
        .filter((sc): sc is string => !!sc)
    ),
  ].sort()

  return {
    equipements: equipements as Equipement[],
    packs: packs as Pack[],
    sousCategories,
  }
}
