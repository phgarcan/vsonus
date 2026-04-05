/**
 * V-Sonus – Fix sous-catégories : normalisation + levage → scenes + allowOther=false
 * Lance avec : node scripts/fix-sous-categories.mjs
 */

import { createDirectus, rest, staticToken, readItems, updateItem, updateField } from '@directus/sdk'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

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
} catch { process.exit(1) }

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL
const TOKEN = process.env.DIRECTUS_SERVER_TOKEN

const client = createDirectus(DIRECTUS_URL)
  .with(staticToken(TOKEN))
  .with(rest())

// Mapping de normalisation : sous_categorie non standard → slug correct
// Basé sur le contenu du nom OU de la sous_categorie actuelle
const NORMALIZE_RULES = [
  // Câblage
  { match: (sc, nom) => cat(sc, nom, 'Jack'), target: 'rca-jack' },
  { match: (sc, nom) => cat(sc, nom, 'RCA') && !cat(sc, nom, 'Jack'), target: 'rca-jack' },
  { match: (sc, nom) => cat(sc, nom, 'Passe-Câble') || cat(sc, nom, 'Passe-câble'), target: 'passe-cable' },
  { match: (sc, nom) => cat(sc, nom, 'Répartiteur') || cat(sc, nom, 'courant'), target: 'adaptateurs' },
  // Accessoires
  { match: (sc, nom) => cat(sc, nom, 'Gravity') || cat(sc, nom, 'Pieds Gravity'), target: 'pieds-km' },
]

function cat(sc, nom, keyword) {
  const lower = `${sc ?? ''} ${nom ?? ''}`.toLowerCase()
  return lower.includes(keyword.toLowerCase())
}

// Valeurs normalisées attendues (slugs du dropdown)
const VALID_SLUGS = new Set([
  'enceintes', 'regie', 'micro',
  'lyres', 'projecteurs', 'cablage-dmx', 'barre-tout-en-un',
  'videoprojecteurs', 'cablage-accessoires', 'laser',
  'structures', 'praticables', 'levage', 'pavillons-tables',
  'autolaveuse',
  'xlr', 'dmx', 'speakon', 'ethercon', 'adaptateurs', 'rca-jack', 'passe-cable',
  'pieds-km', 'bumpers',
])

// Choices pour le dropdown sous_categorie (mis à jour avec passe-cable)
const SOUS_CAT_CHOICES = [
  { text: 'Sonorisation > Enceintes L-Acoustics et RCF', value: 'enceintes' },
  { text: 'Sonorisation > Régie, table de mixage, contrôleur DJ', value: 'regie' },
  { text: 'Sonorisation > Micro, DI', value: 'micro' },
  { text: 'Éclairage > Lyres (Moving Head) LED IP65', value: 'lyres' },
  { text: 'Éclairage > Projecteur & Barre LED / UV IP65', value: 'projecteurs' },
  { text: 'Éclairage > Câblage DMX', value: 'cablage-dmx' },
  { text: 'Éclairage > Barre tout-en-un', value: 'barre-tout-en-un' },
  { text: 'Mapping > Vidéoprojecteurs', value: 'videoprojecteurs' },
  { text: 'Mapping > Câblage & Accessoires', value: 'cablage-accessoires' },
  { text: 'Mapping > Laser', value: 'laser' },
  { text: 'Scènes > Structures alu (Truss)', value: 'structures' },
  { text: 'Scènes > Praticables', value: 'praticables' },
  { text: 'Scènes > Levage (Pieds et Palan)', value: 'levage' },
  { text: 'Scènes > Pavillons pliable & Tables', value: 'pavillons-tables' },
  { text: 'Nettoyage > Autolaveuse & Machine à laver les verres', value: 'autolaveuse' },
  { text: 'Câblage > Câbles XLR', value: 'xlr' },
  { text: 'Câblage > Câbles Speakon', value: 'speakon' },
  { text: 'Câblage > Câbles Ethercon', value: 'ethercon' },
  { text: 'Câblage > Câbles RCA / Jack', value: 'rca-jack' },
  { text: 'Câblage > Passe-Câble', value: 'passe-cable' },
  { text: 'Câblage > Adaptateurs & Répartiteurs', value: 'adaptateurs' },
  { text: 'DJ > Régie DJ', value: 'regie' },
  { text: 'Accessoires > Pieds K&M / Gravity', value: 'pieds-km' },
  { text: 'Accessoires > Bumpers & Accessoires L-Acoustics', value: 'bumpers' },
]

async function main() {
  console.log('=== FIX SOUS-CATÉGORIES ===\n')

  // ── 1. Déplacer levage → scenes ──────────────────────────────────────────
  console.log('1. Déplacement equipements categorie=levage → scenes/levage...\n')

  const levageItems = await client.request(readItems('equipements', {
    filter: { categorie: { _eq: 'levage' } },
    limit: -1,
    fields: ['id', 'nom', 'categorie', 'sous_categorie'],
  }))

  if (levageItems.length === 0) {
    console.log('   Aucun équipement avec categorie=levage (déjà migré)')
  } else {
    for (const item of levageItems) {
      await client.request(updateItem('equipements', item.id, {
        categorie: 'scenes',
        sous_categorie: 'levage',
      }))
      console.log(`   ✓ "${item.nom}" : levage → scenes/levage`)
    }
    console.log(`   → ${levageItems.length} équipement(s) déplacé(s)\n`)
  }

  // ── 2. Normaliser les sous-catégories non standard ───────────────────────
  console.log('\n2. Normalisation des sous-catégories non standard...\n')

  const allEquips = await client.request(readItems('equipements', {
    limit: -1,
    fields: ['id', 'nom', 'categorie', 'sous_categorie'],
    sort: ['categorie', 'sous_categorie'],
  }))

  // Trouver les items avec sous_categorie non standard
  const nonStandard = allEquips.filter(e => e.sous_categorie && !VALID_SLUGS.has(e.sous_categorie))

  if (nonStandard.length === 0) {
    console.log('   Aucune sous-catégorie non standard trouvée')
  } else {
    console.log(`   ${nonStandard.length} équipement(s) avec sous-catégorie non standard :\n`)

    const unmapped = []

    for (const item of nonStandard) {
      const rule = NORMALIZE_RULES.find(r => r.match(item.sous_categorie, item.nom))
      if (rule) {
        await client.request(updateItem('equipements', item.id, { sous_categorie: rule.target }))
        console.log(`   ✓ "${item.nom}" : "${item.sous_categorie}" → "${rule.target}"`)
      } else {
        unmapped.push(item)
      }
    }

    if (unmapped.length > 0) {
      console.log(`\n   ⚠ ${unmapped.length} item(s) sans mapping automatique :`)
      console.table(unmapped.map(e => ({
        ID: e.id,
        Nom: e.nom,
        Catégorie: e.categorie,
        'Sous-cat actuelle': e.sous_categorie,
      })))
    }
  }

  // ── 3. Verrouiller le dropdown (allowOther=false) ─���──────────────────────
  console.log('\n3. Verrouillage dropdown sous_categorie (allowOther=false)...\n')

  try {
    await client.request(updateField('equipements', 'sous_categorie', {
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: SOUS_CAT_CHOICES,
          allowOther: false,
        },
        width: 'half',
        note: 'Sous-catégorie pour le filtrage MegaMenu. Valeurs prédéfinies uniquement.',
      },
    }))
    console.log('   ✓ equipements.sous_categorie → allowOther: false')
  } catch (e) {
    console.log(`   ⚠ Erreur: ${e?.errors?.[0]?.message ?? e?.message}`)
  }

  // ── 4. Vérification finale ───────────────────────────────────────────────
  console.log('\n=== VÉRIFICATION FINALE ===\n')

  // Re-fetch après corrections
  const equips = await client.request(readItems('equipements', {
    limit: -1,
    fields: ['id', 'nom', 'categorie', 'sous_categorie', 'prix_journalier'],
    sort: ['categorie', 'sous_categorie', 'nom'],
  }))

  // Vérifier liens MegaMenu
  const MEGAMENU_LINKS = [
    { categorie: 'sonorisation', sous_categorie: 'enceintes' },
    { categorie: 'sonorisation', sous_categorie: 'regie' },
    { categorie: 'sonorisation', sous_categorie: 'micro' },
    { categorie: 'eclairage', sous_categorie: 'lyres' },
    { categorie: 'eclairage', sous_categorie: 'projecteurs' },
    { categorie: 'eclairage', sous_categorie: 'cablage-dmx' },
    { categorie: 'eclairage', sous_categorie: 'barre-tout-en-un' },
    { categorie: 'mapping', sous_categorie: 'videoprojecteurs' },
    { categorie: 'mapping', sous_categorie: 'laser' },
    { categorie: 'scenes', sous_categorie: 'structures' },
    { categorie: 'scenes', sous_categorie: 'praticables' },
    { categorie: 'scenes', sous_categorie: 'levage' },
    { categorie: 'scenes', sous_categorie: 'pavillons-tables' },
    { categorie: 'nettoyage', sous_categorie: 'autolaveuse' },
  ]

  console.log('Liens MegaMenu :\n')
  const megaResults = []
  let allOk = true
  for (const link of MEGAMENU_LINKS) {
    const count = equips.filter(e =>
      e.categorie === link.categorie && e.sous_categorie === link.sous_categorie
    ).length
    const ok = count > 0
    if (!ok) allOk = false
    megaResults.push({
      Catégorie: link.categorie,
      'Sous-catégorie': link.sous_categorie,
      'Nb équipements': count,
      Statut: ok ? '✓ OK' : '✗ VIDE',
    })
  }
  console.table(megaResults)

  // Sous-catégories non standard restantes
  const remaining = equips.filter(e => e.sous_categorie && !VALID_SLUGS.has(e.sous_categorie))
  if (remaining.length > 0) {
    console.log(`\n⚠ ${remaining.length} sous-catégorie(s) non standard restante(s) :`)
    console.table(remaining.map(e => ({
      ID: e.id, Nom: e.nom, Catégorie: e.categorie, 'Sous-cat': e.sous_categorie,
    })))
  } else {
    console.log('\n✓ Aucune sous-catégorie non standard')
  }

  // Récapitulatif complet
  console.log('\nRécapitulatif par catégorie/sous-catégorie :\n')
  const grouped = {}
  for (const e of equips) {
    const key = `${e.categorie}|${e.sous_categorie || '(vide)'}`
    if (!grouped[key]) grouped[key] = { categorie: e.categorie, sous_categorie: e.sous_categorie || '(vide)', count: 0 }
    grouped[key].count++
  }
  console.table(
    Object.values(grouped)
      .sort((a, b) => a.categorie.localeCompare(b.categorie) || a.sous_categorie.localeCompare(b.sous_categorie))
      .map(g => ({ Catégorie: g.categorie, 'Sous-catégorie': g.sous_categorie, Nb: g.count }))
  )

  if (allOk) {
    console.log('\n✓ Tous les liens MegaMenu retournent au moins 1 produit')
  } else {
    console.log('\n✗ Certains liens MegaMenu sont encore vides')
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
