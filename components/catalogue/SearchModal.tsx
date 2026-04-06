'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  slug: string
  nom: string
  marque?: string
  categorie?: string[]
  sous_categorie?: string
  prix_journalier: number
  image?: string | null
  type: 'equipement' | 'pack'
}

interface SearchModalProps {
  onClose: () => void
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const close = useCallback(() => {
    onClose()
  }, [onClose])

  // Raccourci ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [close])

  // Focus auto
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Bloquer le scroll du body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Debounce recherche
  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    setSelectedIndex(-1)
    const timer = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results)
      } catch { setResults([]) }
      finally { setIsLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Tracking debounce 2s — logue la recherche finale uniquement
  useEffect(() => {
    if (query.trim().length < 3) return
    const timer = setTimeout(() => {
      fetch('/api/search/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim(), nb_resultats: results.length }),
      }).catch(() => {})
    }, 2000)
    return () => clearTimeout(timer)
  }, [query, results.length])

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        const r = results[selectedIndex]
        const href = r.type === 'equipement'
          ? `/catalogue/${r.categorie?.[0] ?? 'sonorisation'}/${r.sous_categorie ?? 'autres'}/${r.slug}`
          : `/catalogue/pack/${r.slug}`
        router.push(href)
        close()
      } else if (query.length >= 2) {
        router.push(`/catalogue?q=${encodeURIComponent(query)}`)
        close()
      }
    }
  }

  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || ''

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] md:pt-[15vh]"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl mx-4 bg-[#1a1a1a] border border-gray-600 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Champ de recherche */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un équipement, une marque, un pack..."
            className="flex-1 bg-transparent text-white text-xl placeholder:text-gray-400 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden md:inline-block px-2 py-0.5 text-xs text-gray-500 border border-gray-600">
              ESC
            </kbd>
          </div>
        </div>

        {/* Résultats */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.length < 2 && (
            <div className="p-6 text-center text-gray-500 text-sm">
              Tapez au moins 2 caractères pour rechercher
            </div>
          )}

          {isLoading && query.length >= 2 && (
            <div className="p-4 text-sm text-gray-500">Recherche en cours...</div>
          )}

          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-400 mb-1">Aucun résultat pour &laquo; {query} &raquo;</p>
              <p className="text-gray-600 text-sm">Essayez avec d&apos;autres termes</p>
            </div>
          )}

          {results.map((r, index) => {
            const href = r.type === 'equipement'
              ? `/catalogue/${r.categorie?.[0] ?? 'sonorisation'}/${r.sous_categorie ?? 'autres'}/${r.slug}`
              : `/catalogue/pack/${r.slug}`
            return (
              <Link
                key={`${r.type}-${r.id}`}
                href={href}
                onClick={close}
                className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                  index === selectedIndex ? 'bg-vsonus-red/10' : 'hover:bg-white/5'
                }`}
              >
                {r.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`${directusUrl}/assets/${r.image}?width=64&height=64&fit=cover&quality=70`}
                    alt=""
                    width={56}
                    height={56}
                    className="object-cover flex-shrink-0 bg-black"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-14 h-14 bg-black flex-shrink-0 flex items-center justify-center">
                    <Search className="w-5 h-5 text-gray-700" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white font-medium truncate">{r.nom}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                    {r.marque && <span>{r.marque}</span>}
                    {r.marque && <span>·</span>}
                    <span className="text-vsonus-red font-bold">
                      {r.prix_journalier} {r.type === 'pack' ? 'CHF / événement' : 'CHF/jour'}
                    </span>
                    {r.type === 'pack' && (
                      <span className="px-1.5 py-0.5 bg-vsonus-red/20 text-vsonus-red text-[10px] font-bold uppercase">
                        Pack
                      </span>
                    )}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </Link>
            )
          })}

          {results.length > 0 && (
            <Link
              href={`/catalogue?q=${encodeURIComponent(query)}`}
              onClick={close}
              className="flex items-center justify-center gap-2 p-4 text-sm text-vsonus-red hover:bg-vsonus-red/5 border-t border-gray-700 font-bold uppercase tracking-wide"
            >
              Voir tous les résultats
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Footer raccourcis */}
        <div className="px-4 py-2 border-t border-gray-700 flex items-center gap-4 text-xs text-gray-600">
          <span>↑↓ naviguer</span>
          <span>↵ ouvrir</span>
          <span>esc fermer</span>
        </div>
      </div>
    </div>
  )
}
