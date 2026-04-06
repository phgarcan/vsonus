import { NextRequest, NextResponse } from 'next/server'
import { getServerDirectus } from '@/lib/directus'
import { createItem } from '@directus/sdk'

export async function POST(request: NextRequest) {
  try {
    const { query, nb_resultats } = await request.json()

    if (!query || typeof query !== 'string' || query.trim().length < 3) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }

    const client = getServerDirectus()
    await client.request(
      createItem('recherches_catalogue' as never, {
        query: query.trim(),
        nb_resultats: nb_resultats ?? 0,
        date: new Date().toISOString(),
      } as never)
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
