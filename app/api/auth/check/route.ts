import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const hasToken = !!cookieStore.get('vsonus_access_token')?.value || !!cookieStore.get('vsonus_refresh_token')?.value
  return NextResponse.json({ loggedIn: hasToken })
}
