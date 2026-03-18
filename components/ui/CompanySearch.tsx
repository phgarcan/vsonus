'use client'

import { useState, useRef, useEffect } from 'react'

interface ZefixResult {
  name: string
  uid: string
  legalSeat: string
  address: { street?: string; swissZipCode?: string; city?: string } | null
}

interface CompanySearchProps {
  value: string
  onChange: (name: string) => void
  onSelect: (company: { name: string; uid: string; rue?: string; npa?: string; ville?: string }) => void
}

function formatUid(uid: string): string {
  // Convert UID like "CHE123456789" to "CHE-123.456.789"
  const clean = uid.replace(/[^0-9]/g, '')
  if (clean.length === 9) {
    return `CHE-${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}`
  }
  // Already formatted or other format
  if (uid.startsWith('CHE')) return uid
  return uid
}

export function CompanySearch({ value, onChange, onSelect }: CompanySearchProps) {
  const [results, setResults] = useState<ZefixResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInput(val: string) {
    onChange(val)
    if (timerRef.current) clearTimeout(timerRef.current)

    if (val.length < 3) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/zefix?name=${encodeURIComponent(val)}`)
        const data = await res.json()
        setResults(data.list ?? [])
        setOpen((data.list ?? []).length > 0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }

  function handleSelect(company: ZefixResult) {
    onSelect({
      name: company.name,
      uid: formatUid(company.uid),
      rue: company.address?.street ?? undefined,
      npa: company.address?.swissZipCode ?? undefined,
      ville: company.address?.city ?? company.legalSeat ?? undefined,
    })
    setOpen(false)
    setResults([])
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        placeholder="Rechercher une entreprise suisse..."
        className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-vsonus-red transition-colors placeholder-gray-600"
      />
      {loading && (
        <div className="absolute right-3 top-3.5 text-xs text-gray-500">...</div>
      )}
      {open && results.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full bg-vsonus-dark border border-gray-700 border-t-0 max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 hover:bg-black/40 transition-colors border-b border-gray-800 last:border-b-0"
              >
                <span className="text-white text-sm font-bold block">{r.name}</span>
                <span className="text-xs text-gray-500">
                  {r.legalSeat}
                  {r.uid && ` · ${formatUid(r.uid)}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
