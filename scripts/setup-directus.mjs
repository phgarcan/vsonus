/**
 * V-Sonus – Script de setup Directus
 * ------------------------------------
 * Crée automatiquement toutes les collections, champs et relations.
 * Lance avec : node scripts/setup-directus.mjs
 *
 * Pré-requis : .env.local configuré avec NEXT_PUBLIC_DIRECTUS_URL et DIRECTUS_SERVER_TOKEN
 */

import { createDirectus, rest, staticToken, createCollection, createField, createRelation } from '@directus/sdk'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Chargement des variables d'environnement depuis .env.local
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')

try {
  const envContent = readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...rest] = trimmed.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
  }
} catch {
  console.error('❌  Impossible de lire .env.local')
  process.exit(1)
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL
const TOKEN = process.env.DIRECTUS_SERVER_TOKEN

if (!DIRECTUS_URL || !TOKEN || TOKEN === 'ton_token_ici') {
  console.error('\n❌  Configure NEXT_PUBLIC_DIRECTUS_URL et DIRECTUS_SERVER_TOKEN dans .env.local\n')
  process.exit(1)
}

const client = createDirectus(DIRECTUS_URL).with(staticToken(TOKEN)).with(rest())

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function safeCreate(label, fn) {
  try {
    await fn()
    console.log(`  ✓  ${label}`)
  } catch (e) {
    const msg = e?.errors?.[0]?.message ?? e?.message ?? String(e)
    if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate') || e?.response?.status === 400) {
      console.log(`  –  ${label} (déjà existant)`)
    } else {
      console.warn(`  ⚠  ${label} : ${msg}`)
    }
  }
}

async function createCol(collection, fields, meta = {}) {
  await safeCreate(`Collection "${collection}"`, () =>
    client.request(createCollection({ collection, meta: { icon: 'box', ...meta }, schema: {}, fields }))
  )
}

async function addField(collection, field) {
  await safeCreate(`  └ ${collection}.${field.field}`, () =>
    client.request(createField(collection, field))
  )
}

// ---------------------------------------------------------------------------
// COLLECTIONS
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\n🔗  Connexion à ${DIRECTUS_URL}\n`)

  // -------------------------------------------------------------------------
  // 1. equipements
  // -------------------------------------------------------------------------
  console.log('\n📦  Collection : equipements')
  await createCol('equipements', [], { icon: 'speaker', display_template: '{{nom}}' })
  await addField('equipements', { field: 'nom',                  type: 'string',  meta: { required: true, width: 'full' },                        schema: { is_nullable: false } })
  await addField('equipements', { field: 'marque',               type: 'string',  meta: { width: 'half' },                                        schema: {} })
  await addField('equipements', { field: 'categorie',            type: 'string',  meta: { width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'Sonorisation', value: 'sonorisation' },
    { text: 'Éclairage',    value: 'eclairage' },
    { text: 'Scènes',       value: 'scenes' },
    { text: 'Mapping',      value: 'mapping' },
    { text: 'DJ',           value: 'dj' },
    { text: 'Câblage',      value: 'cablage' },
    { text: 'Levage',       value: 'levage' },
    { text: 'Accessoires',  value: 'accessoires' },
    { text: 'Nettoyage',    value: 'nettoyage' },
  ] } }, schema: {} })
  await addField('equipements', { field: 'description',          type: 'text',    meta: { width: 'full', interface: 'input-multiline' },           schema: {} })
  await addField('equipements', { field: 'prix_journalier',      type: 'float',   meta: { required: true, width: 'half' },                        schema: { is_nullable: false, default_value: 0 } })
  await addField('equipements', { field: 'stock_total',          type: 'integer', meta: { required: true, width: 'half' },                        schema: { is_nullable: false, default_value: 1 } })
  await addField('equipements', { field: 'technicien_obligatoire', type: 'boolean', meta: { width: 'half', note: 'L-Acoustics / Levage' },        schema: { default_value: false } })
  await addField('equipements', { field: 'transport_obligatoire',  type: 'boolean', meta: { width: 'half' },                                      schema: { default_value: false } })
  await addField('equipements', { field: 'prix_livraison',       type: 'float',   meta: { width: 'half', note: 'Frais livraison éclairage (facturés 1×, null = pas de livraison)' }, schema: { is_nullable: true, default_value: null } })
  await addField('equipements', { field: 'image',                type: 'uuid',    meta: { width: 'full', interface: 'file-image', special: ['file'] }, schema: {} })
  await addField('equipements', { field: 'status',               type: 'string',  meta: { width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'Publié',   value: 'published' },
    { text: 'Brouillon', value: 'draft' },
  ] }, default_value: 'published' }, schema: { default_value: 'published' } })

  // -------------------------------------------------------------------------
  // 2. packs
  // -------------------------------------------------------------------------
  console.log('\n📦  Collection : packs')
  await createCol('packs', [], { icon: 'inventory_2', display_template: '{{nom}}' })
  await addField('packs', { field: 'nom',             type: 'string', meta: { required: true, width: 'full' },  schema: { is_nullable: false } })
  await addField('packs', { field: 'categorie',       type: 'string', meta: { width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'Sonorisation', value: 'sonorisation' },
    { text: 'Éclairage',    value: 'eclairage' },
    { text: 'Scènes',       value: 'scenes' },
    { text: 'Mapping',      value: 'mapping' },
    { text: 'DJ',           value: 'dj' },
    { text: 'Concerts',     value: 'concerts' },
    { text: 'Nettoyage',    value: 'nettoyage' },
  ] } }, schema: {} })
  await addField('packs', { field: 'prix_base',       type: 'float',  meta: { required: true, width: 'half' }, schema: { is_nullable: false, default_value: 0 } })
  await addField('packs', { field: 'prix_livraison',  type: 'float',  meta: { width: 'half', note: 'Livraison, installation, montage et démontage (facturés 1×)' }, schema: { is_nullable: true, default_value: null } })
  await addField('packs', { field: 'prix_fourgon',    type: 'float',  meta: { width: 'half', note: 'Frais location fourgon + essence (facturés 1×)' }, schema: { is_nullable: true, default_value: null } })
  await addField('packs', { field: 'mode_livraison',  type: 'string', meta: { width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'Obligatoire',        value: 'obligatoire' },
    { text: 'Optionnel',          value: 'optionnel' },
    { text: 'Retrait uniquement', value: 'retrait_uniquement' },
  ] } }, schema: { default_value: 'obligatoire' } })
  await addField('packs', { field: 'description',     type: 'text',   meta: { width: 'full', interface: 'input-multiline' }, schema: {} })
  await addField('packs', { field: 'capacite',        type: 'string', meta: { width: 'half', interface: 'input', options: { placeholder: 'ex: 100-200 personnes' }, note: 'Capacité du pack. Laisser vide si non applicable.' }, schema: { is_nullable: true, default_value: null } })

  // --- Groupe Promotion ---
  await addField('packs', { field: 'promotion_group', type: 'alias', meta: { interface: 'group-detail', special: ['alias', 'no-data', 'group'], options: { start: 'closed' }, width: 'full', note: 'Promotion temporaire sur ce pack' }, schema: null })
  await addField('packs', { field: 'prix_promo',      type: 'float',    meta: { width: 'half', group: 'promotion_group', note: 'Prix promotionnel (remplace prix_base si rempli)' }, schema: { is_nullable: true, default_value: null } })
  await addField('packs', { field: 'promo_label',     type: 'string',   meta: { width: 'half', group: 'promotion_group', note: 'Ex: "Promo été -20%"' }, schema: { is_nullable: true, default_value: null } })
  await addField('packs', { field: 'promo_date_fin',  type: 'timestamp', meta: { width: 'half', group: 'promotion_group', interface: 'datetime', note: 'Date d\'expiration (promo disparaît après)' }, schema: { is_nullable: true, default_value: null } })
  await addField('packs', { field: 'image_principale', type: 'uuid',  meta: { width: 'full', interface: 'file-image', special: ['file'] }, schema: {} })
  await addField('packs', { field: 'status',          type: 'string', meta: { width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'Publié',    value: 'published' },
    { text: 'Brouillon', value: 'draft' },
  ] } }, schema: { default_value: 'published' } })

  // -------------------------------------------------------------------------
  // 3. pack_equipements (liaison M2M)
  // -------------------------------------------------------------------------
  console.log('\n📦  Collection : pack_equipements')
  await createCol('pack_equipements', [], { icon: 'link', hidden: true })
  await addField('pack_equipements', { field: 'pack_id',       type: 'integer', meta: { hidden: true }, schema: {} })
  await addField('pack_equipements', { field: 'equipement_id', type: 'integer', meta: { hidden: true }, schema: {} })
  await addField('pack_equipements', { field: 'quantite',      type: 'integer', meta: { width: 'half' }, schema: { default_value: 1 } })

  await safeCreate('Relation pack_equipements.pack_id → packs', () =>
    client.request(createRelation({
      collection: 'pack_equipements',
      field: 'pack_id',
      related_collection: 'packs',
    }))
  )
  await safeCreate('Relation pack_equipements.equipement_id → equipements', () =>
    client.request(createRelation({
      collection: 'pack_equipements',
      field: 'equipement_id',
      related_collection: 'equipements',
    }))
  )

  // -------------------------------------------------------------------------
  // 4. tarifs_annexes
  // -------------------------------------------------------------------------
  console.log('\n📦  Collection : tarifs_annexes')
  await createCol('tarifs_annexes', [], { icon: 'price_check', display_template: '{{label}} – {{prix}} CHF' })
  await addField('tarifs_annexes', { field: 'label',       type: 'string', meta: { required: true, width: 'full' }, schema: { is_nullable: false } })
  await addField('tarifs_annexes', { field: 'type',        type: 'string', meta: { required: true, width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'Transport',   value: 'transport' },
    { text: 'Montage',     value: 'montage' },
    { text: 'Démontage',   value: 'demontage' },
    { text: 'Livraison',   value: 'livraison' },
  ] } }, schema: { is_nullable: false } })
  await addField('tarifs_annexes', { field: 'prix',        type: 'float',  meta: { required: true, width: 'half' }, schema: { is_nullable: false, default_value: 0 } })
  await addField('tarifs_annexes', { field: 'unite',       type: 'string', meta: { width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'Forfait', value: 'forfait' },
    { text: 'Heure',   value: 'heure' },
    { text: 'Jour',    value: 'jour' },
  ] } }, schema: { default_value: 'forfait' } })
  await addField('tarifs_annexes', { field: 'description', type: 'text',   meta: { width: 'full', interface: 'input-multiline' }, schema: {} })

  // -------------------------------------------------------------------------
  // 5. reservations
  // -------------------------------------------------------------------------
  console.log('\n📦  Collection : reservations')
  await createCol('reservations', [], { icon: 'event', display_template: '{{nom_client}} – {{date_debut}}' })
  await addField('reservations', { field: 'statut',            type: 'string',  meta: { width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'En attente',  value: 'en_attente_validation' },
    { text: 'Confirmée',   value: 'confirme' },
    { text: 'En cours',    value: 'en_cours' },
    { text: 'Annulée',     value: 'annule' },
  ] } }, schema: { default_value: 'en_attente_validation' } })
  await addField('reservations', { field: 'nom_client',        type: 'string',  meta: { required: true, width: 'half' }, schema: { is_nullable: false } })
  await addField('reservations', { field: 'email_client',      type: 'string',  meta: { required: true, width: 'half' }, schema: { is_nullable: false } })
  await addField('reservations', { field: 'tel_client',        type: 'string',  meta: { width: 'half' }, schema: {} })
  await addField('reservations', { field: 'adresse_evenement', type: 'text',    meta: { width: 'full' }, schema: {} })
  await addField('reservations', { field: 'date_debut',        type: 'date',    meta: { required: true, width: 'half' }, schema: { is_nullable: false } })
  await addField('reservations', { field: 'date_fin',          type: 'date',    meta: { required: true, width: 'half' }, schema: { is_nullable: false } })
  await addField('reservations', { field: 'total_ht',          type: 'float',   meta: { width: 'half' }, schema: { default_value: 0 } })
  await addField('reservations', { field: 'besoin_montage',    type: 'boolean', meta: { width: 'half' }, schema: { default_value: false } })
  await addField('reservations', { field: 'besoin_livraison',  type: 'boolean', meta: { width: 'half' }, schema: { default_value: false } })
  await addField('reservations', { field: 'notes',             type: 'text',    meta: { width: 'full', interface: 'input-multiline' }, schema: {} })

  // -------------------------------------------------------------------------
  // 6. reservation_lignes
  // -------------------------------------------------------------------------
  console.log('\n📦  Collection : reservation_lignes')
  await createCol('reservation_lignes', [], { icon: 'list', hidden: true })
  await addField('reservation_lignes', { field: 'reservation_id', type: 'integer', meta: { hidden: true }, schema: {} })
  await addField('reservation_lignes', { field: 'type',           type: 'string',  meta: { width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'Équipement',   value: 'equipement' },
    { text: 'Pack',         value: 'pack' },
    { text: 'Frais annexe', value: 'frais_annexe' },
  ] } }, schema: {} })
  await addField('reservation_lignes', { field: 'reference_id',  type: 'string',  meta: { width: 'half' }, schema: {} })
  await addField('reservation_lignes', { field: 'label',         type: 'string',  meta: { width: 'full' }, schema: {} })
  await addField('reservation_lignes', { field: 'quantite',      type: 'integer', meta: { width: 'half' }, schema: { default_value: 1 } })
  await addField('reservation_lignes', { field: 'prix_unitaire', type: 'float',   meta: { width: 'half' }, schema: { default_value: 0 } })
  await addField('reservation_lignes', { field: 'prix_total',    type: 'float',   meta: { width: 'half' }, schema: { default_value: 0 } })

  await safeCreate('Relation reservation_lignes.reservation_id → reservations', () =>
    client.request(createRelation({
      collection: 'reservation_lignes',
      field: 'reservation_id',
      related_collection: 'reservations',
    }))
  )

  // -------------------------------------------------------------------------
  // 7. pages (CMS)
  // -------------------------------------------------------------------------
  console.log('\n📦  Collection : pages')
  await createCol('pages', [], { icon: 'article', display_template: '{{title}}' })
  await addField('pages', { field: 'slug',             type: 'string', meta: { required: true, width: 'half' }, schema: { is_nullable: false, is_unique: true } })
  await addField('pages', { field: 'status',           type: 'string', meta: { width: 'half', interface: 'select-dropdown', options: { choices: [
    { text: 'Publié',    value: 'published' },
    { text: 'Brouillon', value: 'draft' },
    { text: 'Archivé',   value: 'archived' },
  ] } }, schema: { default_value: 'draft' } })
  await addField('pages', { field: 'title',            type: 'string', meta: { required: true, width: 'full' }, schema: { is_nullable: false } })
  await addField('pages', { field: 'meta_description', type: 'text',   meta: { width: 'full', interface: 'input-multiline', note: 'Description SEO (160 caractères max)' }, schema: {} })
  await addField('pages', { field: 'content',          type: 'json',   meta: { width: 'full', interface: 'list', note: 'Blocs de contenu (hero, texte, galerie, cta)', special: ['cast-json'] }, schema: {} })

  // -------------------------------------------------------------------------
  // 8. messages_contact
  // -------------------------------------------------------------------------
  console.log('\n📦  Collection : messages_contact')
  await createCol('messages_contact', [], { icon: 'mail', display_template: '{{nom}} – {{sujet}}' })
  await addField('messages_contact', { field: 'nom',       type: 'string',   meta: { required: true, width: 'half' }, schema: { is_nullable: false } })
  await addField('messages_contact', { field: 'email',     type: 'string',   meta: { required: true, width: 'half' }, schema: { is_nullable: false } })
  await addField('messages_contact', { field: 'telephone', type: 'string',   meta: { width: 'half' }, schema: {} })
  await addField('messages_contact', { field: 'sujet',     type: 'string',   meta: { width: 'half' }, schema: {} })
  await addField('messages_contact', { field: 'message',   type: 'text',     meta: { required: true, width: 'full', interface: 'input-multiline' }, schema: { is_nullable: false } })
  await addField('messages_contact', { field: 'date_envoi',type: 'datetime', meta: { width: 'half' }, schema: {} })
  await addField('messages_contact', { field: 'lu',        type: 'boolean',  meta: { width: 'half' }, schema: { default_value: false } })

  // -------------------------------------------------------------------------
  // Seed : données de démonstration
  // -------------------------------------------------------------------------
  console.log('\n🌱  Seed – données de démonstration\n')
  await seedData()

  console.log('\n✅  Setup terminé ! Directus est prêt.\n')
  console.log('   → Ouvre ton instance Directus pour vérifier les collections.')
  console.log('   → Lance "npm run dev" et va sur http://localhost:3000/catalogue\n')
}

// ---------------------------------------------------------------------------
// Seed – quelques données de démo pour tester le front
// ---------------------------------------------------------------------------

async function seedData() {
  const { createItems } = await import('@directus/sdk')

  // Tarifs annexes
  await safeCreate('Tarifs annexes (transport + montage)', async () => {
    await client.request(createItems('tarifs_annexes', [
      { label: 'Transport – Fourgon 1100kg', type: 'transport', prix: 200, unite: 'forfait', description: 'Livraison et reprise du matériel en Suisse Romande' },
      { label: 'Montage / Démontage Sonorisation', type: 'montage', prix: 400, unite: 'forfait', description: '4h × 2 techniciens à 50.-/h' },
    ]))
  })

  // Équipements de démo
  await safeCreate('Équipements de démo', async () => {
    await client.request(createItems('equipements', [
      { nom: 'L-Acoustics KARA II', marque: 'L-Acoustics', categorie: 'sonorisation', prix_journalier: 180, stock_total: 8,  technicien_obligatoire: true,  transport_obligatoire: true,  description: 'Enceinte de ligne compacte 2 voies, SPL max 133 dB', status: 'published' },
      { nom: 'L-Acoustics SB18',    marque: 'L-Acoustics', categorie: 'sonorisation', prix_journalier: 120, stock_total: 4,  technicien_obligatoire: true,  transport_obligatoire: true,  description: 'Subwoofer 18" 2000W',                              status: 'published' },
      { nom: 'Yamaha QL5',          marque: 'Yamaha',       categorie: 'sonorisation', prix_journalier: 150, stock_total: 2,  technicien_obligatoire: false, transport_obligatoire: false, description: 'Console numérique 64 canaux',                        status: 'published' },
      { nom: 'Shure SM58',          marque: 'Shure',        categorie: 'sonorisation', prix_journalier: 15,  stock_total: 20, technicien_obligatoire: false, transport_obligatoire: false, description: 'Micro dynamique cardioïde pour chant',               status: 'published' },
      { nom: 'Robe BMFL Spot',      marque: 'Robe',         categorie: 'eclairage',    prix_journalier: 90,  stock_total: 6,  technicien_obligatoire: false, transport_obligatoire: false, description: 'Moving head spot 1700W',                            status: 'published' },
      { nom: 'Chauvet Épix Strip',  marque: 'Chauvet',      categorie: 'eclairage',    prix_journalier: 25,  stock_total: 16, technicien_obligatoire: false, transport_obligatoire: false, description: 'Barre LED RGB 1m, 50 pixels',                       status: 'published' },
      { nom: 'Scène 6×4m',          marque: 'Prolyte',      categorie: 'scenes',       prix_journalier: 350, stock_total: 1,  technicien_obligatoire: true,  transport_obligatoire: true,  description: 'Scène modulaire aluminium avec toit',               status: 'published' },
      { nom: 'Palan CM 500kg',      marque: 'CM',           categorie: 'scenes',       prix_journalier: 60,  stock_total: 4,  technicien_obligatoire: true,  transport_obligatoire: true,  description: 'Palan électrique 500kg levage',                     status: 'published' },
    ]))
  })

  // Pack de démo
  await safeCreate('Pack soirée démo', async () => {
    await client.request(createItems('packs', [
      { nom: 'Pack Soirée Privée', categorie: 'sonorisation', prix_base: 450, prix_livraison: 200, prix_fourgon: 200, mode_livraison: 'obligatoire', description: 'Sonorisation complète pour 100 personnes : 4× enceintes, 2× subs, console, micro', status: 'published' },
      { nom: 'Pack Festival Lumière', categorie: 'eclairage', prix_base: 600, prix_livraison: 150, prix_fourgon: null, mode_livraison: 'optionnel', description: '12× moving heads + 24× barres LED + contrôleur DMX, idéal scènes 6-10m', status: 'published' },
    ]))
  })
}

main().catch((e) => {
  console.error('\n❌  Erreur fatale :', e?.errors?.[0]?.message ?? e?.message ?? e)
  process.exit(1)
})
