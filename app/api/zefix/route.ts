import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name || name.length < 3) {
    return NextResponse.json({ list: [] })
  }

  try {
    const res = await fetch(
      'https://www.zefix.ch/ZefixREST/api/v1/firm/search.json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Referer': 'https://www.zefix.ch/fr/search/entity/welcome',
        },
        body: JSON.stringify({
          name,
          languageKey: 'fr',
          maxEntries: 5,
        }),
        signal: AbortSignal.timeout(5000),
      }
    )

    if (!res.ok) return NextResponse.json({ list: [] })

    const data = await res.json()
    const companies = data.list ?? []

    const results = companies.map((c: Record<string, unknown>) => ({
      name: (c.name as string) ?? '',
      uid: (c.uidFormatted as string) ?? '',
      legalSeat: (c.legalSeat as string) ?? '',
    }))

    return NextResponse.json({ list: results })
  } catch {
    return NextResponse.json({ list: [] })
  }
}
