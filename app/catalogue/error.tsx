'use client'

import Link from 'next/link'
import { VolumeX, RefreshCw, ShoppingBag } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CatalogueError({ error, reset }: ErrorProps) {
  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-20 bg-vsonus-black">
      {/* Illustration : câble jack débranché */}
      <div className="relative mb-10">
        <svg
          width="200"
          height="160"
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto"
          aria-hidden="true"
        >
          <path d="M20 80 C40 80, 50 60, 70 55 C85 51, 88 58, 88 65" stroke="#666" strokeWidth="3" strokeLinecap="round" fill="none" />
          <rect x="8" y="72" width="16" height="16" rx="1" fill="#444" />
          <rect x="2" y="76" width="8" height="8" rx="1" fill="#666" />
          <circle cx="16" cy="80" r="2" fill="#EC1C24" />
          <path d="M180 80 C160 80, 150 100, 130 105 C115 109, 112 102, 112 95" stroke="#666" strokeWidth="3" strokeLinecap="round" fill="none" />
          <rect x="176" y="72" width="16" height="16" rx="1" fill="#444" />
          <rect x="190" y="76" width="8" height="8" rx="1" fill="#666" />
          <circle cx="184" cy="80" r="2" fill="#EC1C24" />
          <line x1="95" y1="70" x2="95" y2="60" stroke="#EC1C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="75" x2="108" y2="68" stroke="#EC1C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="85" x2="108" y2="92" stroke="#EC1C24" strokeWidth="2" strokeLinecap="round" />
          <line x1="105" y1="80" x2="115" y2="80" stroke="#EC1C24" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="100" cy="80" r="12" fill="#EC1C24" opacity="0.08" />
          <circle cx="100" cy="80" r="6" fill="#EC1C24" opacity="0.15" />
        </svg>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <VolumeX className="w-8 h-8 text-vsonus-red opacity-60" strokeWidth={1.5} />
        </div>
      </div>

      <div className="w-16 h-1 bg-vsonus-red mb-6 mx-auto" />

      <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-3 text-center">
        Impossible de charger le catalogue
      </h1>
      <p className="text-gray-500 text-sm mb-2 max-w-md text-center leading-relaxed">
        Le catalogue est temporairement indisponible. Veuillez réessayer dans quelques instants.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-700 mb-8 font-mono">code : {error.digest}</p>
      )}
      {!error.digest && <div className="mb-8" />}

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Réessayer
        </button>
        <Link
          href="/catalogue"
          className="flex items-center gap-2 border-2 border-gray-700 text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:border-vsonus-red hover:text-vsonus-red transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Retour au catalogue
        </Link>
      </div>
    </main>
  )
}
