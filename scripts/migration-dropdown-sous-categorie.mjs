/**
 * V-Sonus – Migration : dropdown conditionnel sous_categorie + corrections données
 * ----------------------------------------------------------------------------------
 * 1. Transforme sous_categorie en select-dropdown groupé par catégorie
 * 2. Déplace les 3 équipements levage sous categorie=scenes, sous_categorie=levage
 * 3. Déplace les câbles DMX sous categorie=eclairage, sous_categorie=cablage-dmx
 *
 * Lance avec : node scripts/migration-dropdown-sous-categorie.mjs
 */

import { createDirectus, rest, staticToken, updateField, readItems, updateItem } from '@directus/sdk'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Chargement .env.local
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

if (!DIRECTUS_URL || !TOKEN) {
  console.error('Configure NEXT_PUBLIC_DIRECTUS_URL et DIRECTUS_SERVER_TOKEN dans .env.local')
  process.exit(1)
}

const client = createDirectus(DIRECTUS_URL).with(staticToken(TOKEN)).with(rest())

// ---------------------------------------------------------------------------
// Choices du dropdown sous_categorie (groupés par catégorie)
// ---------------------------------------------------------------------------

const SOUS_CAT_CHOICES = [
  // Sonorisation
  { text: 'Sonorisation > Enceintes L-Acoustics et RCF', value: 'enceintes' },
  { text: 'Sonorisation > Régie, table de mixage, contrôleur DJ', value: 'regie' },
  { text: 'Sonorisation > Micro, DI', value: 'micro' },
  // Éclairage
  { text: 'Éclairage > Lyres (Moving Head) LED IP65', value: 'lyres' },
  { text: 'Éclairage > Projecteur & Barre LED / UV IP65', value: 'projecteurs' },
  { text: 'Éclairage > Câblage DMX', value: 'cablage-dmx' },
  { text: 'Éclairage > Barre tout-en-un', value: 'barre-tout-en-un' },
  // Mapping
  { text: 'Mapping > Vidéoprojecteurs', value: 'videoprojecteurs' },
  { text: 'Mapping > Câblage & Accessoires', value: 'cablage-accessoires' },
  { text: 'Mapping > Laser', value: 'laser' },
  // Scènes & Structures
  { text: 'Scènes > Structures alu (Truss)', value: 'structures' },
  { text: 'Scènes > Praticables', value: 'praticables' },
  { text: 'Scènes > Levage (Pieds et Palan)', value: 'levage' },
  { text: 'Scènes > Pavillons pliable & Tables', value: 'pavillons-tables' },
  // Nettoyage
  { text: 'Nettoyage > Autolaveuse & Machine à laver les verres', value: 'autolaveuse' },
  // Câblage
  { text: 'Câblage > Câbles XLR', value: 'xlr' },
  { text: 'Câblage > Câbles DMX', value: 'dmx' },
  { text: 'Câblage > Câbles Speakon', value: 'speakon' },
  { text: 'Câblage > Câbles Ethercon', value: 'ethercon' },
  { text: 'Câblage > Adaptateurs', value: 'adaptateurs' },
  { text: 'Câblage > Câbles RCA / Jack', value: 'rca-jack' },
  // Levage
  { text: 'Levage > Pieds de levage', value: 'pieds' },
  { text: 'Levage > Palans', value: 'palans' },
  // Accessoires
  { text: 'Accessoires > Pieds K&M', value: 'pieds-km' },
  { text: 'Accessoires > Bumpers & Accessoires L-Acoustics', value: 'bumpers' },
]

// Choices pour les packs (sous-ensemble)
const PACK_SOUS_CAT_CHOICES = [
  { text: 'Sonorisation', value: 'sonorisation' },
  { text: 'DJ', value: 'dj' },
  { text: 'Concerts', value: 'concerts' },
  { text: 'Éclairage', value: 'eclairage' },
  { text: 'Scènes', value: 'scenes' },
  { text: 'Mapping', value: 'mapping' },
]

// ---------------------------------------------------------------------------
// Migration principale
// ---------------------------------------------------------------------------

async function main() {
  console.log(`\nConnexion a ${DIRECTUS_URL}\n`)

  // -----------------------------------------------------------------------
  // 1. Transformer sous_categorie en dropdown
  // -----------------------------------------------------------------------
  console.log('1. Mise a jour du champ sous_categorie en dropdown...\n')

  const fieldUpdate = {
    meta: {
      interface: 'select-dropdown',
      options: {
        choices: SOUS_CAT_CHOICES,
        allowOther: true,
      },
      width: 'half',
      note: 'Sous-catégorie pour le filtrage MegaMenu. Choisir une valeur correspondant à la catégorie.',
    },
  }

  try {
    await client.request(updateField('equipements', 'sous_categorie', fieldUpdate))
    console.log('  +  equipements.sous_categorie -> select-dropdown')
  } catch (e) {
    console.warn('  !  equipements.sous_categorie :', e?.errors?.[0]?.message ?? e?.message)
  }

  try {
    await client.request(updateField('packs', 'sous_categorie', {
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: PACK_SOUS_CAT_CHOICES,
          allowOther: true,
        },
        width: 'half',
        note: 'Sous-catégorie du pack (correspond généralement à la catégorie).',
      },
    }))
    console.log('  +  packs.sous_categorie -> select-dropdown')
  } catch (e) {
    console.warn('  !  packs.sous_categorie :', e?.errors?.[0]?.message ?? e?.message)
  }

  // -----------------------------------------------------------------------
  // 2. Deplacer les equipements levage sous categorie=scenes
  // -----------------------------------------------------------------------
  console.log('\n2. Deplacement equipements levage -> scenes...\n')

  const levageItems = await client.request(
    readItems('equipements', {
      filter: { categorie: { _eq: 'levage' } },
      limit: -1,
      fields: ['id', 'nom', 'categorie'],
    })
  )

  console.log(`   ${levageItems.length} equipements trouves dans categorie=levage`)

  for (const item of levageItems) {
    await client.request(updateItem('equipements', item.id, {
      categorie: 'scenes',
      sous_categorie: 'levage',
    }))
    console.log(`   [levage -> scenes] ${item.nom}`)
  }

  // -----------------------------------------------------------------------
  // 3. Deplacer les cables DMX sous categorie=eclairage
  // -----------------------------------------------------------------------
  console.log('\n3. Deplacement cables DMX -> eclairage...\n')

  const cablageItems = await client.request(
    readItems('equipements', {
      filter: { categorie: { _eq: 'cablage' } },
      limit: -1,
      fields: ['id', 'nom', 'categorie'],
    })
  )

  // Identifier les cables DMX par nom
  const dmxKeywords = ['dmx', 'adaptateur dmx']
  let movedCount = 0

  for (const item of cablageItems) {
    const lower = item.nom.toLowerCase()
    const isDmx = dmxKeywords.some((kw) => lower.includes(kw))

    if (isDmx) {
      await client.request(updateItem('equipements', item.id, {
        categorie: 'eclairage',
        sous_categorie: 'cablage-dmx',
      }))
      console.log(`   [cablage -> eclairage/cablage-dmx] ${item.nom}`)
      movedCount++
    }
  }

  console.log(`   => ${movedCount} cables DMX deplaces`)

  // -----------------------------------------------------------------------
  // Résumé
  // -----------------------------------------------------------------------
  console.log('\n--- Resume ---')

  // Recompter
  for (const cat of ['sonorisation', 'eclairage', 'scenes', 'mapping', 'nettoyage', 'cablage', 'levage', 'dj', 'accessoires']) {
    const items = await client.request(
      readItems('equipements', { filter: { categorie: { _eq: cat } }, limit: -1, fields: ['id'] })
    )
    if (items.length > 0) console.log(`   ${cat}: ${items.length} equipements`)
  }

  // Verifier les sous-categories qui etaient vides
  console.log('\n   Verification sous-categories problematiques :')

  for (const check of [
    { cat: 'scenes', sc: 'levage' },
    { cat: 'eclairage', sc: 'cablage-dmx' },
    { cat: 'mapping', sc: 'laser' },
  ]) {
    const items = await client.request(
      readItems('equipements', {
        filter: { categorie: { _eq: check.cat }, sous_categorie: { _eq: check.sc } },
        limit: -1,
        fields: ['id', 'nom'],
      })
    )
    console.log(`   ?categorie=${check.cat}&sous_categorie=${check.sc} -> ${items.length} produits ${items.length ? items.map((i) => i.nom).join(', ') : '(vide)'}`)
  }

  console.log('\nMigration terminee !')
}

main().catch((err) => {
  console.error('Erreur fatale :', err)
  process.exit(1)
})
