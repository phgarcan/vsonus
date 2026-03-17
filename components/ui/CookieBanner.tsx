'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getCookie('vsonus_cookies_ok')) {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    setCookie('vsonus_cookies_ok', '1', 365)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-vsonus-red bg-vsonus-dark px-4 py-4 sm:px-6 sm:py-5">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-300 flex-1">
          Ce site utilise des cookies techniques nécessaires à son fonctionnement.
          En poursuivant votre navigation, vous acceptez l&apos;utilisation de ces cookies.{' '}
          <Link href="/politique-de-confidentialite" className="text-vsonus-red hover:text-white underline transition-colors">
            En savoir plus
          </Link>
        </p>
        <button
          onClick={accept}
          className="flex-shrink-0 bg-vsonus-red text-white text-sm font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-red-700 transition-colors"
        >
          Accepter
        </button>
      </div>
    </div>
  )
}
