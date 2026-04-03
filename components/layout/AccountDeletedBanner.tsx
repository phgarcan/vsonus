'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'

export function AccountDeletedBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (searchParams.get('compte') === 'supprime') {
      setVisible(true)
      // Nettoyer l'URL sans recharger
      const url = new URL(window.location.href)
      url.searchParams.delete('compte')
      window.history.replaceState({}, '', url.pathname)

      // Auto-dismiss après 5 secondes
      const timer = setTimeout(() => setVisible(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams, router])

  if (!visible) return null

  return (
    <div className="bg-vsonus-dark border-b-2 border-vsonus-red px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          Votre compte et vos données personnelles ont été supprimés avec succès.
        </p>
        <button
          onClick={() => setVisible(false)}
          className="ml-auto text-gray-600 hover:text-white transition-colors text-lg leading-none"
          aria-label="Fermer"
        >
          ×
        </button>
      </div>
    </div>
  )
}
