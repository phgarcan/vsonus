import { createDirectus, rest, staticToken } from '@directus/sdk'

// ---------------------------------------------------------------------------
// TypeScript Interfaces – Collections Directus
// ---------------------------------------------------------------------------

export interface Equipement {
  id: string
  nom: string
  prix_journalier: number
  stock_total: number
  /** Si true → livraison + technicien obligatoires (règle L-Acoustics / Levage) */
  technicien_obligatoire: boolean
  /** Si true → transport obligatoire */
  transport_obligatoire: boolean
  image: string | null
  categorie?: string
  marque?: string
  description?: string
}

export interface Pack {
  id: string
  nom: string
  categorie: 'sonorisation' | 'eclairage' | 'scene' | 'mapping' | string
  prix_base: number
  image_principale: string | null
  description?: string
  pack_equipements?: PackEquipement[]
}

export interface PackEquipement {
  id: string
  pack_id: string
  equipement_id: Equipement
  quantite: number
}

export interface TarifAnnexe {
  id: string
  label: string
  type: 'transport' | 'montage' | 'demontage' | 'livraison'
  prix: number
  unite: 'forfait' | 'heure' | 'jour'
  description?: string
}

export interface Page {
  id: string
  slug: string
  title: string
  meta_description: string | null
  content: PageBlock[] | null
  status: 'published' | 'draft' | 'archived'
}

export interface PageBlock {
  id: string
  collection: 'block_hero' | 'block_texte' | 'block_galerie' | 'block_cta' | string
  item: Record<string, unknown>
}

export interface Reservation {
  id?: string
  statut: 'en_attente_validation' | 'confirme' | 'annule' | 'en_cours'
  nom_client: string
  email_client: string
  tel_client: string
  adresse_evenement: string
  date_debut: string
  date_fin: string
  total_ht: number
  besoin_montage: boolean
  besoin_livraison: boolean
  notes?: string
}

export interface ReservationLigne {
  id?: string
  reservation_id: string
  type: 'equipement' | 'pack' | 'frais_annexe'
  reference_id: string
  label: string
  quantite: number
  prix_unitaire: number
  prix_total: number
}

// ---------------------------------------------------------------------------
// Schéma global pour le SDK Directus
// ---------------------------------------------------------------------------

export interface MessageContact {
  id?: string
  nom: string
  email: string
  telephone?: string
  sujet?: string
  message: string
  date_envoi?: string
  lu?: boolean
}

export interface RealisationFile {
  id?: number
  realisations_id?: number
  directus_files_id: string
  sort: number | null
}

export interface Realisation {
  id: number
  titre: string
  description?: string
  categorie?: string
  date_evenement?: string
  lieu?: string
  image_principale?: string | null
  images?: RealisationFile[] | null
  publie: boolean
}

interface Schema {
  equipements: Equipement[]
  packs: Pack[]
  pack_equipements: PackEquipement[]
  tarifs_annexes: TarifAnnexe[]
  reservations: Reservation[]
  reservation_lignes: ReservationLigne[]
  pages: Page[]
  messages_contact: MessageContact[]
  realisations: Realisation[]
  realisations_files: RealisationFile[]
}

// ---------------------------------------------------------------------------
// Client public (sans token – lecture du catalogue côté front/serveur)
// ---------------------------------------------------------------------------

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055'

export const directus = createDirectus<Schema>(directusUrl).with(rest())

// ---------------------------------------------------------------------------
// Client serveur sécurisé (avec static token – pour les mutations)
// ---------------------------------------------------------------------------

export function getServerDirectus() {
  const token = process.env.DIRECTUS_SERVER_TOKEN
  if (!token) {
    throw new Error('DIRECTUS_SERVER_TOKEN est manquant dans les variables d\'environnement.')
  }
  return createDirectus<Schema>(directusUrl).with(staticToken(token)).with(rest())
}

// ---------------------------------------------------------------------------
// Utilitaire : URL d'une image hébergée dans Directus
// ---------------------------------------------------------------------------

export function getImageUrl(imageId: string | null | undefined, params?: Record<string, string>): string | null {
  if (!imageId) return null
  const url = new URL(`${directusUrl}/assets/${imageId}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
  }
  return url.toString()
}
