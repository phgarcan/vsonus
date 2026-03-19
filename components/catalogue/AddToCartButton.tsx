'use client'

import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/Button'
import type { Equipement, Pack } from '@/lib/directus'

type Props =
  | { type: 'equipement'; item: Equipement }
  | { type: 'pack'; item: Pack }

export function AddToCartButton({ type, item }: Props) {
  const addToCart = useStore((s) => s.addToCart)
  const setCartDrawerOpen = useStore((s) => s.setCartDrawerOpen)

  function handleAdd() {
    if (type === 'equipement') {
      addToCart({ type: 'equipement', item, quantite: 1 })
    } else {
      addToCart({ type: 'pack', item, quantite: 1 })
    }
    setCartDrawerOpen(true)
  }

  return (
    <Button variant="primary" size="sm" fullWidth onClick={handleAdd}>
      + AJOUTER À MA LISTE
    </Button>
  )
}
