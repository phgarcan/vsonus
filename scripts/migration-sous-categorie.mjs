/**
 * V-Sonus – Migration : ajout du champ sous_categorie
 * -----------------------------------------------------
 * Crée le champ sous_categorie sur equipements et packs,
 * puis peuple les valeurs existantes par matching de noms.
 *
 * Lance avec : node scripts/migration-sous-categorie.mjs
 */

import { createDirectus, rest, staticToken, createField, updateCollection, readItems, updateItem } from '@directus/sdk'
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
  console.error('Impossible de lire .env.local')
  process.exit(1)
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL
const TOKEN = process.env.DIRECTUS_SERVER_TOKEN

if (!DIRECTUS_URL || !TOKEN || TOKEN === 'ton_token_ici') {
  console.error('\nConfigure NEXT_PUBLIC_DIRECTUS_URL et DIRECTUS_SERVER_TOKEN dans .env.local\n')
  process.exit(1)
}

const client = createDirectus(DIRECTUS_URL).with(staticToken(TOKEN)).with(rest())

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function safeCreate(label, fn) {
  try {
    await fn()
    console.log(`  +  ${label}`)
  } catch (e) {
    const msg = e?.errors?.[0]?.message ?? e?.message ?? String(e)
    if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('duplicate') || e?.response?.status === 400) {
      console.log(`  -  ${label} (deja existant)`)
    } else {
      console.warn(`  !  ${label} : ${msg}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Regles de matching sous_categorie pour les equipements
// ---------------------------------------------------------------------------

const EQUIP_RULES = [
  // Sonorisation
  { categorie: 'sonorisation', keywords: ['l-acoustics', 'rcf', 'qsc', 'enceinte', 'caisson', 'sub', 'ks21', 'ks118', 'kw122', 'a15', 'la4x', 'kara', 'nx 15'], sous_categorie: 'enceintes' },
  { categorie: 'sonorisation', keywords: ['yamaha', 'drawmer', 'pioneer', 'mixage', 'console', 'dm3', 'tio', 'djm', 'xdj', 'rx3', 'plx', 'sp2120'], sous_categorie: 'regie' },
  { categorie: 'sonorisation', keywords: ['micro', 'shure', 'sm58', 'sm57', 'sennheiser', '906', 'radial', 'bss', ' di', 'pro di', 'ar133', 'k&m', 'pied'], sous_categorie: 'micro' },

  // Eclairage — barre-tout-en-un AVANT projecteurs (Stairville contient "rgb")
  { categorie: 'eclairage', keywords: ['lyre', 'moving', 'wash 7x40', 'wash 7'], sous_categorie: 'lyres' },
  { categorie: 'eclairage', keywords: ['show bar', 'wolfmix', 'tout-en-un', 'stairville'], sous_categorie: 'barre-tout-en-un' },
  { categorie: 'eclairage', keywords: ['projecteur', 'typhoon', 'thunder', 'uv', 'rgb', 'par ', 'zoom par'], sous_categorie: 'projecteurs' },
  { categorie: 'eclairage', keywords: ['dmx', 'cable dmx', 'câble'], sous_categorie: 'cablage-dmx' },

  // Mapping
  { categorie: 'mapping', keywords: ['videoprojecteur', 'vidéoprojecteur', 'projecteur', 'panasonic', 'vmz'], sous_categorie: 'videoprojecteurs' },

  // Scenes
  { categorie: 'scenes', keywords: ['truss', 'f33', 'f32', 'structure', 'global truss'], sous_categorie: 'structures' },
  { categorie: 'scenes', keywords: ['praticable', 'praktikus', 'podest'], sous_categorie: 'praticables' },
  { categorie: 'scenes', keywords: ['vmb', 'palan', 'levage', 'te-074', 'tl-a', 'lp-500', 'gis'], sous_categorie: 'levage' },
  { categorie: 'scenes', keywords: ['pavillon', 'table', 'kaiserkraft', 'cocon', 'pliable'], sous_categorie: 'pavillons-tables' },

  // Nettoyage — tous les produits
  { categorie: 'nettoyage', keywords: null, sous_categorie: 'autolaveuse' },
]

/**
 * Trouve la sous_categorie pour un equipement donne
 */
function matchSousCategorie(nom, categorie) {
  const lower = nom.toLowerCase()
  for (const rule of EQUIP_RULES) {
    if (rule.categorie !== categorie) continue
    // keywords: null = matcher tous les items de cette categorie
    if (rule.keywords === null) return rule.sous_categorie
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.sous_categorie
  }
  return null
}

// ---------------------------------------------------------------------------
// Migration principale
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nConnexion a ${DIRECTUS_URL}\n`)

  // --- 1. Creer le champ sous_categorie ---
  console.log('1. Creation du champ sous_categorie...')

  const fieldDef = {
    field: 'sous_categorie',
    type: 'string',
    meta: { width: 'half', interface: 'input', note: 'Sous-catégorie pour le filtrage MegaMenu' },
    schema: { is_nullable: true, default_value: null },
  }

  await safeCreate('equipements.sous_categorie', () =>
    client.request(createField('equipements', fieldDef))
  )
  await safeCreate('packs.sous_categorie', () =>
    client.request(createField('packs', fieldDef))
  )

  // --- 2. Configurer sort_field pour le drag-and-drop ---
  console.log('\n2. Configuration sort_field...')

  for (const col of ['equipements', 'packs']) {
    await safeCreate(`${col}.sort_field = 'sort'`, () =>
      client.request(updateCollection(col, { meta: { sort_field: 'sort' } }))
    )
  }

  // --- 3. Peupler sous_categorie des equipements ---
  console.log('\n3. Peuplement sous_categorie equipements...')

  const equipements = await client.request(
    readItems('equipements', { limit: -1, fields: ['id', 'nom', 'categorie'] })
  )

  console.log(`   ${equipements.length} equipements trouves`)

  let updatedCount = 0
  let skippedCount = 0

  for (const eq of equipements) {
    const sc = matchSousCategorie(eq.nom, eq.categorie)
    if (sc) {
      await client.request(updateItem('equipements', eq.id, { sous_categorie: sc }))
      console.log(`   [${eq.categorie}] ${eq.nom} -> ${sc}`)
      updatedCount++
    } else {
      console.log(`   [${eq.categorie}] ${eq.nom} -> (non matche)`)
      skippedCount++
    }
  }

  console.log(`   => ${updatedCount} mis a jour, ${skippedCount} non matches`)

  // --- 4. Peupler sous_categorie des packs ---
  console.log('\n4. Peuplement sous_categorie packs...')

  const packs = await client.request(
    readItems('packs', { limit: -1, fields: ['id', 'nom', 'categorie'] })
  )

  console.log(`   ${packs.length} packs trouves`)

  for (const pack of packs) {
    if (pack.categorie) {
      await client.request(updateItem('packs', pack.id, { sous_categorie: pack.categorie }))
      console.log(`   [${pack.categorie}] ${pack.nom} -> ${pack.categorie}`)
    }
  }

  console.log('\nMigration terminee !')
}

main().catch((err) => {
  console.error('Erreur fatale :', err)
  process.exit(1)
})
