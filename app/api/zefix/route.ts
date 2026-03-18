import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name || name.length < 3) {
    return NextResponse.json({ list: [] })
  }

  try {
    const res = await fetch(
      `https://www.zefix.ch/ZefixREST/api/v1/company/search?name=${encodeURIComponent(name)}&activeOnly=true&maxEntries=5`,
      {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      }
    )

    if (!res.ok) return NextResponse.json({ list: [] })

    const data = await res.json()
    // Zefix returns { list: [...] } or an array directly
    const companies = Array.isArray(data) ? data : (data.list ?? data.result ?? [])

    const results = companies.slice(0, 5).map((c: Record<string, unknown>) => ({
      name: c.name ?? c.companyName ?? '',
      uid: c.uid ?? c.chid ?? '',
      legalSeat: c.legalSeat ?? c.seat ?? '',
      address: c.address ?? null,
    }))

    return NextResponse.json({ list: results })
  } catch {
    return NextResponse.json({ list: [] })
  }
}
