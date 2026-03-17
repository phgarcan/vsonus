import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page introuvable – V-Sonus',
}

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-black text-vsonus-red mb-4 leading-none">404</p>
      <div className="w-12 h-1 bg-vsonus-red mb-8 mx-auto" />
      <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-3">
        Page introuvable
      </h1>
      <p className="text-gray-500 text-sm mb-10 max-w-sm">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-vsonus-red text-white text-sm font-bold uppercase tracking-widest hover:bg-red-700 transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  )
}
