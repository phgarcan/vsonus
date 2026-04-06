import { NextRequest, NextResponse } from 'next/server'
import { getServerDirectus, parseCategorie } from '@/lib/directus'
import { readItems } from '@directus/sdk'

/** Construit un filtre Directus "chaque mot doit apparaître dans nom OU marque OU description" */
function buildFuzzyFilter(q: string) {
  let words = q.split(/[\s\-_]+/).filter((w) => w.length >= 2)
  // Si aucun mot assez long, garder tous les mots et aussi chercher la query complète sans séparateurs
  if (words.length === 0) words = [q.replace(/[\s\-_]+/g, '')]
  if (words.length === 0) return {}

  // Chaque mot doit matcher au moins un champ
  return {
    _and: words.map((word) => ({
      _or: [
        { nom: { _icontains: word } },
        { marque: { _icontains: word } },
        { description: { _icontains: word } },
      ],
    })),
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const client = getServerDirectus()
  const filter = buildFuzzyFilter(q)

  const [equipements, packs] = await Promise.all([
    client.request(
      readItems('equipements', {
        filter: filter as Record<string, unknown>,
        limit: 6,
        fields: ['id', 'slug', 'nom', 'marque', 'categorie', 'sous_categorie', 'prix_journalier', 'image'],
      })
    ).catch(() => []),
    client.request(
      readItems('packs', {
        filter: filter as Record<string, unknown>,
        limit: 4,
        fields: ['id', 'slug', 'nom', 'marque', 'categorie', 'prix_base', 'image_principale'],
      })
    ).catch(() => []),
  ])

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const results = [
    ...(equipements as any[]).map((eq) => ({
      id: eq.id,
      slug: eq.slug,
      nom: eq.nom,
      marque: eq.marque,
      categorie: parseCategorie(eq.categorie),
      sous_categorie: eq.sous_categorie,
      prix_journalier: eq.prix_journalier,
      image: eq.image,
      type: 'equipement' as const,
    })),
    ...(packs as any[]).map((p) => ({
      id: p.id,
      slug: p.slug,
      nom: p.nom,
      marque: p.marque,
      categorie: p.categorie ? [p.categorie] : [],
      sous_categorie: p.categorie,
      prix_journalier: p.prix_base,
      image: p.image_principale,
      type: 'pack' as const,
    })),
  ]
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return NextResponse.json({ results })
}
