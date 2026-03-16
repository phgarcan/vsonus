'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import type { Pack } from '@/lib/directus'

export function AddToCartPackSection({ pack }: { pack: Pack }) {
  const [added, setAdded] = useState(false)
  const addToCart = useStore((s) => s.addToCart)
  const setCartDrawerOpen = useStore((s) => s.setCartDrawerOpen)

  function handleAdd() {
    addToCart({ type: 'pack', item: pack, quantite: 1 })
    setCartDrawerOpen(true)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <button
      onClick={handleAdd}
      className="w-full bg-vsonus-red text-white font-bold uppercase tracking-widest py-4 hover:shadow-glow-red-hover transition-shadow duration-200 disabled:opacity-60"
    >
      {added ? '✓ Ajouté à la sélection !' : '+ Ajouter à ma sélection'}
    </button>
  )
}
