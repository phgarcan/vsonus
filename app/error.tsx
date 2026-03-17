'use client'

import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-12 h-1 bg-vsonus-red mb-8 mx-auto" />
      <h1 className="text-4xl font-black uppercase tracking-widest text-white mb-3">
        Une erreur est survenue
      </h1>
      <p className="text-gray-500 text-sm mb-2 max-w-sm">
        Quelque chose s&apos;est mal passé. Vous pouvez réessayer ou revenir à l&apos;accueil.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-700 mb-8 font-mono">code : {error.digest}</p>
      )}
      {!error.digest && <div className="mb-8" />}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-vsonus-red text-white text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-700 text-gray-400 text-sm font-bold uppercase tracking-widest hover:border-white hover:text-white transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  )
}
