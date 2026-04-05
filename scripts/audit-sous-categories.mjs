/**
 * V-Sonus – Audit des sous-catégories des équipements
 * Vérifie la cohérence des sous-catégories et que chaque lien MegaMenu retourne ≥ 1 produit
 * Lance avec : node scripts/audit-sous-categories.mjs
 */

import { createDirectus, rest, staticToken, readItems } from '@directus/sdk'
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

const client = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL)
  .with(staticToken(process.env.DIRECTUS_SERVER_TOKEN))
  .with(rest())

// Liens du MegaMenu : chaque combinaison catégorie + sous_catégorie
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

// Sous-catégories attendues par catégorie
const EXPECTED_SOUS_CAT = {
  sonorisation: ['enceintes', 'regie', 'micro'],
  eclairage: ['lyres', 'projecteurs', 'cablage-dmx', 'barre-tout-en-un'],
  mapping: ['videoprojecteurs', 'laser'],
  scenes: ['structures', 'praticables', 'levage', 'pavillons-tables'],
  nettoyage: ['autolaveuse'],
}

async function main() {
  console.log('=== AUDIT SOUS-CATÉGORIES ÉQUIPEMENTS ===\n')

  // 1. Fetch tous les équipements
  const equips = await client.request(readItems('equipements', {
    limit: -1,
    fields: ['id', 'nom', 'categorie', 'sous_categorie', 'prix_journalier'],
    sort: ['categorie', 'sous_categorie', 'nom'],
  }))
  console.log(`Total : ${equips.length} équipements\n`)

  // 2. Équipements sans sous_categorie
  const sansSSCat = equips.filter(e => !e.sous_categorie)
  if (sansSSCat.length > 0) {
    console.log(`\n⚠  ${sansSSCat.length} équipement(s) SANS sous_categorie :`)
    console.table(sansSSCat.map(e => ({
      ID: e.id,
      Nom: e.nom,
      Catégorie: e.categorie || '(vide)',
      Prix: e.prix_journalier,
    })))
  } else {
    console.log('✓ Tous les équipements ont une sous_categorie')
  }

  // 3. Vérifier les valeurs de sous_categorie vs attendues
  const allSousCats = [...new Set(equips.map(e => e.sous_categorie).filter(Boolean))]
  const expectedAll = Object.values(EXPECTED_SOUS_CAT).flat()
  const unexpected = allSousCats.filter(sc => !expectedAll.includes(sc))
  if (unexpected.length > 0) {
    console.log(`\n⚠  Sous-catégories NON attendues (possibles typos) :`)
    for (const sc of unexpected) {
      const items = equips.filter(e => e.sous_categorie === sc)
      console.log(`  - "${sc}" (${items.length} items, catégorie: ${items[0]?.categorie})`)
    }
  } else {
    console.log('✓ Toutes les sous-catégories correspondent aux valeurs attendues')
  }

  // 4. Vérification de chaque lien MegaMenu
  console.log('\n=== VÉRIFICATION LIENS MEGAMENU ===\n')
  const results = []

  for (const link of MEGAMENU_LINKS) {
    const count = equips.filter(e =>
      e.categorie === link.categorie && e.sous_categorie === link.sous_categorie
    ).length
    results.push({
      Catégorie: link.categorie,
      'Sous-catégorie': link.sous_categorie,
      'Nb équipements': count,
      Statut: count > 0 ? '✓ OK' : '✗ VIDE',
    })
  }

  console.table(results)

  // 5. Tableau récapitulatif complet par catégorie/sous-catégorie
  console.log('\n=== RÉCAPITULATIF COMPLET ===\n')
  const grouped = {}
  for (const e of equips) {
    const cat = e.categorie || '(sans catégorie)'
    const sc = e.sous_categorie || '(sans sous-catégorie)'
    const key = `${cat}|${sc}`
    if (!grouped[key]) grouped[key] = { categorie: cat, sous_categorie: sc, count: 0 }
    grouped[key].count++
  }

  const recap = Object.values(grouped)
    .sort((a, b) => a.categorie.localeCompare(b.categorie) || a.sous_categorie.localeCompare(b.sous_categorie))
    .map(g => ({
      Catégorie: g.categorie,
      'Sous-catégorie': g.sous_categorie,
      'Nb équipements': g.count,
      Statut: g.count > 0 ? '✓' : '✗',
    }))

  console.table(recap)

  // 6. Résumé
  const vides = results.filter(r => r.Statut.includes('VIDE'))
  if (vides.length > 0) {
    console.log(`\n⚠  ${vides.length} lien(s) MegaMenu sans résultat :`)
    vides.forEach(v => console.log(`  - ${v.Catégorie} > ${v['Sous-catégorie']}`))
  } else {
    console.log('\n✓ Tous les liens MegaMenu retournent au moins 1 produit')
  }
}

main().catch((err) => { console.error(err); process.exit(1) })
