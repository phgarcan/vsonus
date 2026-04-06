import { createDirectus, rest, staticToken } from '@directus/sdk'

// ---------------------------------------------------------------------------
// TypeScript Interfaces – Collections Directus
// ---------------------------------------------------------------------------

export interface Equipement {
  id: string
  slug: string
  nom: string
  prix_journalier: number
  stock_total: number
  /** Si true → livraison + technicien obligatoires (règle L-Acoustics / Levage) */
  technicien_obligatoire: boolean
  /** Si true → transport obligatoire */
  transport_obligatoire: boolean
  image: string | null
  categorie?: string[]
  sous_categorie?: string
  marque?: string
  description?: string
  /** Frais de livraison éclairage (facturés 1×, null = pas de livraison proposée) */
  prix_livraison?: number | null
  sort?: number | null
  /** Photos supplémentaires (junction M2M via equipements_images) */
  images?: EquipementImage[]
}

export interface EquipementImage {
  id: number
  directus_files_id: string
}

/** Dictionnaire centralisé des labels de catégories */
export const CAT_LABELS: Record<string, string> = {
  sonorisation: 'Sonorisation',
  eclairage: 'Éclairage',
  scenes: 'Scènes & Structures',
  mapping: 'Mapping / Laser',
  dj: 'DJ',
  concerts: 'Concerts',
  cablage: 'Câblage',
  accessoires: 'Accessoires',
  nettoyage: 'Nettoyage',
}

/** Parse le champ categorie qui peut être un tableau ou une chaîne JSON brute depuis Directus */
export function parseCategorie(categorie: unknown): string[] {
  if (Array.isArray(categorie)) return categorie
  if (typeof categorie === 'string') {
    try {
      const parsed = JSON.parse(categorie)
      if (Array.isArray(parsed)) return parsed
    } catch { /* pas du JSON, traiter comme catégorie simple */ }
    if (categorie) return [categorie]
  }
  return []
}

/** Retourne la catégorie principale (premier tag du tableau) */
export function getPrimaryCategory(categorie?: string[] | string): string | undefined {
  return parseCategorie(categorie)?.[0]
}

/** Dictionnaire des labels de sous-catégories */
export const SOUS_CAT_LABELS: Record<string, string> = {
  enceintes: 'Enceintes',
  regie: 'Régie & Tables de mixage',
  micro: 'Micros & DI',
  lyres: 'Lyres (Moving Head)',
  projecteurs: 'Projecteurs & Barres LED',
  'barre-tout-en-un': 'Barres tout-en-un',
  'cablage-dmx': 'Câblage DMX',
  structures: 'Structures alu (Truss)',
  praticables: 'Praticables',
  levage: 'Levage (Pieds & Palan)',
  'pavillons-tables': 'Pavillons & Tables',
  bumpers: 'Bumpers & Accessoires L-Acoustics',
  'pieds-km': 'Pieds de haut-parleur & micro',
  speakon: 'Câbles Speakon',
  xlr: 'Câbles XLR',
  'rca-jack': 'Câbles RCA & Jack',
  'cablage-accessoires': 'Câblage & Accessoires',
  adaptateurs: 'Adaptateurs & Répartiteurs',
  ethercon: 'Câbles Ethercon',
  ethernet: 'Câbles Ethernet & Vidéo',
  'passe-cable': 'Passes-câbles',
  videoprojecteurs: 'Vidéoprojecteurs',
  laser: 'Laser',
  autolaveuse: 'Autolaveuse & Machine à verres',
  'accessoires-mapping': 'Accessoires Mapping',
}

/** Génère l'URL hiérarchique d'un équipement */
export function getEquipementUrl(eq: { categorie?: string[] | string, sous_categorie?: string, slug: string }): string {
  const cat = parseCategorie(eq.categorie)[0] ?? 'sonorisation'
  const sousCat = eq.sous_categorie ?? 'autres'
  return `/catalogue/${cat}/${sousCat}/${eq.slug}`
}

/** Génère l'URL d'un pack */
export function getPackUrl(pack: { slug: string }): string {
  return `/catalogue/pack/${pack.slug}`
}

/** Vérifie si un équipement propose l'option retrait/livraison (éclairage avec prix_livraison renseigné) */
export function equipementHasLivraisonOption(eq: Equipement): boolean {
  return parseCategorie(eq.categorie).includes('eclairage') && eq.prix_livraison != null
}

export interface Pack {
  id: string
  slug: string
  nom: string
  categorie: 'sonorisation' | 'eclairage' | 'scene' | 'mapping' | string
  sous_categorie?: string
  prix_base: number
  /** Frais de livraison et installation (facturés 1×, null = pas de livraison) */
  prix_livraison?: number | null
  /** Frais de location fourgon + essence (facturés 1×, null = pas de fourgon) */
  prix_fourgon?: number | null
  /** Mode de livraison : obligatoire, optionnel ou retrait uniquement */
  mode_livraison?: 'obligatoire' | 'optionnel' | 'retrait_uniquement'
  image_principale: string | null
  description?: string
  /** Capacité du pack (ex: "100-200 personnes"), null si non applicable */
  capacite?: string | null
  /** Label promo affiché sur la carte, ex: "Promo été -20%" */
  promo_label?: string | null
  /** Date d'expiration de la promo (ISO datetime, null = pas d'expiration) */
  promo_date_fin?: string | null
  /** Pourcentage de réduction (0-100). Calcule automatiquement le prix promo. */
  promo_pourcentage?: number | null
  /** Marque principale du pack (L-Acoustics, RCF, etc.) */
  marque?: string | null
  pack_equipements?: PackEquipement[]
  sort?: number | null
}

/** Vérifie si la promo d'un pack est active (promo_pourcentage > 0 + non expiré) */
export function isPromoActive(pack: Pack): boolean {
  if (pack.promo_pourcentage == null || pack.promo_pourcentage <= 0) return false
  if (pack.promo_date_fin == null) return true
  return new Date(pack.promo_date_fin) > new Date()
}

/** Retourne la capacité du pack : champ dédié si rempli, sinon extraction depuis la description */
export function getPackCapacite(pack: Pack): string | null {
  if (pack.capacite) return pack.capacite
  if (!pack.description) return null
  const match = pack.description.match(/Capacité\s*:\s*(\d+(?:\s*[-–àa]\s*\d+)?\s*personnes)/i)
  return match ? match[1].trim() : null
}

/** Retourne le prix effectif du pack (calcul depuis promo_pourcentage si actif, sinon prix_base) */
export function getPackPrixEffectif(pack: Pack): number {
  if (!isPromoActive(pack)) return pack.prix_base
  return Math.round(pack.prix_base * (1 - pack.promo_pourcentage! / 100))
}


export interface PackEquipement {
  id: string
  pack_id: string
  equipement_id: Equipement
  quantite: number
  sort?: number | null
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
  /** Catégorie(s) : peut être un string simple (legacy) ou un tableau JSON (multi-catégories) */
  categorie?: string | string[]
  date_evenement?: string
  lieu?: string
  image_principale?: string | null
  images?: RealisationFile[] | null
  publie: boolean
}

export interface SiteSettings {
  id: number
  hero_video: string | null
  hero_video_poster: string | null
  /** Bandeau promo — actif/inactif */
  promo_active?: boolean
  /** Texte du bandeau promo */
  promo_texte?: string | null
  /** URL du CTA (ex: "/catalogue") */
  promo_lien?: string | null
  /** Texte du bouton CTA (ex: "Voir les offres →") */
  promo_cta?: string | null
  /** Images MegaMenu par catégorie */
  menu_image_sonorisation?: string | null
  menu_image_eclairage?: string | null
  menu_image_mapping?: string | null
  menu_image_scenes?: string | null
  menu_image_nettoyage?: string | null
}

export interface LogoPartenaire {
  id: number
  nom: string
  logo: string | null
  url: string | null
  sort: number | null
  status: string
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
  site_settings: SiteSettings
  logos_partenaires: LogoPartenaire[]
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

/** URL brute d'un asset Directus (vidéo, fichier quelconque) */
export function getAssetUrl(assetId: string | null | undefined): string | null {
  if (!assetId) return null
  return `${directusUrl}/assets/${assetId}`
}
