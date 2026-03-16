/**
 * V-Sonus – Import catalogue WooCommerce → Directus
 * ---------------------------------------------------
 * Lit le CSV exporté de WooCommerce, importe les images depuis WordPress,
 * et insère les équipements dans Directus.
 *
 * Usage : npx tsx scripts/import-catalog.ts
 */

import { createDirectus, rest, staticToken, createItem } from '@directus/sdk'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = dirname(fileURLToPath(import.meta.url))

// Lecture du .env.local
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx).trim()
  const val = trimmed.slice(eqIdx + 1).trim()
  if (key) process.env[key] = val
}

const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL ?? 'http://localhost:8055'
const TOKEN = process.env.DIRECTUS_SERVER_TOKEN ?? ''

if (!TOKEN || TOKEN === 'ton_token_ici') {
  console.error('❌  DIRECTUS_SERVER_TOKEN manquant dans .env.local')
  process.exit(1)
}

const client = createDirectus(DIRECTUS_URL).with(staticToken(TOKEN)).with(rest())

// ---------------------------------------------------------------------------
// Mapping catégories WooCommerce → slugs V-Sonus
// ---------------------------------------------------------------------------

const CAT_MAP: Record<string, string> = {
  'Sonorisation':         'sonorisation',
  'Éclairages':           'eclairage',
  'Éclairage':            'eclairage',
  'Système de levage':    'scenes',
  'Infrastructure':       'scenes',
  'Accessoires':          'accessoires',
  'Câblage':              'accessoires',
}

// ---------------------------------------------------------------------------
// Règle métier : technicien + transport obligatoires
// ---------------------------------------------------------------------------

function needsTech(nom: string, categorie: string): boolean {
  const s = `${nom} ${categorie}`.toLowerCase()
  return s.includes('l-acoustics') || s.includes('levage') || s.includes('palan')
}

// ---------------------------------------------------------------------------
// Nettoyage HTML basique (description courte)
// ---------------------------------------------------------------------------

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
}

// ---------------------------------------------------------------------------
// Upload d'une image vers Directus depuis une URL WordPress
// ---------------------------------------------------------------------------

async function uploadImage(imageUrl: string, nom: string): Promise<string | null> {
  try {
    // Téléchargement de l'image depuis WordPress
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VsonusImporter/1.0)' },
    })
    if (!response.ok) {
      console.log(`  ⚠  Image introuvable (${response.status}): ${imageUrl}`)
      return null
    }

    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'

    // Déduction du nom de fichier depuis l'URL
    const fileName = imageUrl.split('/').pop()?.split('?')[0] ?? `${nom.replace(/\s+/g, '-').toLowerCase()}.jpg`

    // Envoi vers Directus via l'endpoint /files (multipart/form-data)
    const formData = new FormData()
    formData.append(
      'file',
      new Blob([buffer], { type: contentType }),
      fileName
    )

    const uploadResponse = await fetch(`${DIRECTUS_URL}/files`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${TOKEN}` },
      body: formData,
    })

    if (!uploadResponse.ok) {
      const err = await uploadResponse.text()
      console.log(`  ⚠  Échec upload image (${uploadResponse.status}): ${err.slice(0, 100)}`)
      return null
    }

    const result = await uploadResponse.json() as { data: { id: string } }
    return result.data.id

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.log(`  ⚠  Erreur image: ${msg}`)
    return null
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const csvPath = resolve(__dirname, '../doc/wc-product-export-4-3-2026-1772660521914.csv')
  const raw = readFileSync(csvPath)

  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,           // gère le BOM UTF-8
    relax_quotes: true,
    relax_column_count: true,
  }) as Record<string, string>[]

  // Filtrer : garder uniquement les équipements (exclure les packs)
  const equipRows = rows.filter(r => {
    const cat = r['Catégories'] ?? ''
    return !cat.startsWith('Pack') && !cat.startsWith('Packs')
  })

  console.log(`\n📦  ${equipRows.length} équipements à importer (${rows.length - equipRows.length} packs ignorés)\n`)

  let ok = 0
  let skipped = 0

  for (let i = 0; i < equipRows.length; i++) {
    const row = equipRows[i]
    const nom = (row['Nom'] ?? '').trim()
    if (!nom) { skipped++; continue }

    const catWoo    = (row['Catégories'] ?? '').split(',')[0].trim()
    const categorie = CAT_MAP[catWoo] ?? 'accessoires'
    const marque    = (row['Marques'] ?? '').replace('&amp;', '&').trim() || extractBrand(nom)

    const prixRaw    = row['Afficher_coût'] ?? ''
    const prix_journalier = parseFloat(prixRaw) || 0

    const stockRaw  = row['Personnes_max'] ?? ''
    const stock_total = parseInt(stockRaw, 10) || 1

    const descHtml  = row['Description courte'] ?? row['Description'] ?? ''
    const description = stripHtml(descHtml).slice(0, 500)

    const tech = needsTech(nom, catWoo)

    // Images : prendre uniquement la première URL
    const imagesRaw = (row['Images'] ?? '').split(',')[0].trim()
    let imageId: string | null = null

    if (imagesRaw.startsWith('http')) {
      process.stdout.write(`[${i + 1}/${equipRows.length}] ${nom.slice(0, 40).padEnd(40)} → 📥 image...`)
      imageId = await uploadImage(imagesRaw, nom)
      process.stdout.write(imageId ? ' ✓\n' : ' –\n')
    } else {
      console.log(`[${i + 1}/${equipRows.length}] ${nom.slice(0, 40)}`)
    }

    try {
      await client.request(createItem('equipements', {
        nom,
        marque:                  marque || null,
        categorie,
        description:             description || null,
        prix_journalier,
        stock_total,
        technicien_obligatoire:  tech,
        transport_obligatoire:   tech,
        image:                   imageId,
        status:                  'published',
      }))
      ok++
    } catch (err) {
      const msg = (err as { errors?: { message: string }[] })?.errors?.[0]?.message ?? String(err)
      console.log(`  ❌  Erreur insert "${nom}": ${msg}`)
      skipped++
    }
  }

  console.log(`\n✅  Import terminé : ${ok} insérés, ${skipped} ignorés/erreurs\n`)
}

// Extrait la marque depuis le début du nom ("L-Acoustics A15 Wide" → "L-Acoustics")
function extractBrand(nom: string): string {
  const known = ['L-Acoustics', 'QSC', 'Yamaha', 'Shure', 'Sennheiser', 'Pioneer', 'RCF',
                 'K&M', 'Gravity', 'Drawmer', 'BSS Audio', 'Radial Engineering',
                 'Robe', 'Chauvet', 'ADJ', 'Stairville', 'Varytec', 'Prolyte', 'CM',
                 'Wolfmix', 'Thunder']
  for (const b of known) {
    if (nom.toLowerCase().startsWith(b.toLowerCase())) return b
  }
  return ''
}

main().catch(e => {
  console.error('❌  Erreur fatale:', e?.message ?? e)
  process.exit(1)
})
