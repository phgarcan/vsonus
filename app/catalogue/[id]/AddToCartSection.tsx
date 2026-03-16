'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import type { Equipement } from '@/lib/directus'

export function AddToCartSection({ equipement }: { equipement: Equipement }) {
  const [quantite, setQuantite] = useState(1)
  const [added, setAdded] = useState(false)
  const addToCart = useStore((s) => s.addToCart)

  function handleAdd() {
    addToCart({ type: 'equipement', item: equipement, quantite })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Sélecteur de quantité */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Quantité</span>
        <div className="flex items-center border border-gray-700">
          <button
            onClick={() => setQuantite((q) => Math.max(1, q - 1))}
            className="w-10 h-10 text-white bg-vsonus-dark hover:bg-vsonus-red transition-colors text-lg font-bold"
          >
            −
          </button>
          <span className="w-12 text-center text-white font-bold text-lg">{quantite}</span>
          <button
            onClick={() => setQuantite((q) => Math.min(equipement.stock_total, q + 1))}
            className="w-10 h-10 text-white bg-vsonus-dark hover:bg-vsonus-red transition-colors text-lg font-bold"
          >
            +
          </button>
        </div>
        <span className="text-xs text-gray-600">Max : {equipement.stock_total}</span>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleAdd}
      >
        {added ? '✓ Ajouté à la sélection !' : '+ Ajouter à ma sélection'}
      </Button>
    </div>
  )
}
