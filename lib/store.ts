'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Equipement, Pack, TarifAnnexe } from './directus'

// ---------------------------------------------------------------------------
// Types du panier
// ---------------------------------------------------------------------------

export interface CartEquipement {
  type: 'equipement'
  item: Equipement
  quantite: number
}

export interface CartPack {
  type: 'pack'
  item: Pack
  quantite: number
}

export type CartItem = CartEquipement | CartPack

// ---------------------------------------------------------------------------
// État du store
// ---------------------------------------------------------------------------

interface StoreState {
  // Panier
  cart: CartItem[]
  // Dates de location
  startDate: string | null
  endDate: string | null
  // Tarifs annexes chargés depuis Directus (transport, montage…)
  tarifsAnnexes: TarifAnnexe[]

  // --- Actions ---
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string, type: 'equipement' | 'pack') => void
  updateQuantite: (id: string, type: 'equipement' | 'pack', quantite: number) => void
  clearCart: () => void
  setDates: (start: string, end: string) => void
  setTarifsAnnexes: (tarifs: TarifAnnexe[]) => void

  // --- Getters (dérivés) ---
  getNbJours: () => number
  getSousTotal: () => number
  requiresTechnicien: () => boolean
  requiresTransport: () => boolean
}

// ---------------------------------------------------------------------------
// Store Zustand
// ---------------------------------------------------------------------------

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      startDate: null,
      endDate: null,
      tarifsAnnexes: [],

      // -----------------------------------------------------------------------
      // Actions
      // -----------------------------------------------------------------------

      addToCart: (newItem) => {
        set((state) => {
          const existing = state.cart.find(
            (i) => i.type === newItem.type && i.item.id === newItem.item.id
          )
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.type === newItem.type && i.item.id === newItem.item.id
                  ? { ...i, quantite: i.quantite + newItem.quantite }
                  : i
              ),
            }
          }
          return { cart: [...state.cart, newItem] }
        })
      },

      removeFromCart: (id, type) => {
        set((state) => ({
          cart: state.cart.filter((i) => !(i.item.id === id && i.type === type)),
        }))
      },

      updateQuantite: (id, type, quantite) => {
        if (quantite <= 0) {
          get().removeFromCart(id, type)
          return
        }
        set((state) => ({
          cart: state.cart.map((i) =>
            i.item.id === id && i.type === type ? { ...i, quantite } : i
          ),
        }))
      },

      clearCart: () => set({ cart: [], startDate: null, endDate: null }),

      setDates: (start, end) => set({ startDate: start, endDate: end }),

      setTarifsAnnexes: (tarifs) => set({ tarifsAnnexes: tarifs }),

      // -----------------------------------------------------------------------
      // Getters / Logique dérivée
      // -----------------------------------------------------------------------

      /**
       * Calcul du nombre de jours de location.
       * Ex : du 12 au 13 = 2 jours (inclusif)
       */
      getNbJours: () => {
        const { startDate, endDate } = get()
        if (!startDate || !endDate) return 1
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffMs = end.getTime() - start.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
        return Math.max(1, diffDays + 1)
      },

      /**
       * Sous-total matériel (hors frais annexes)
       * = Σ (prix_journalier ou prix_base × quantite × nbJours)
       */
      getSousTotal: () => {
        const { cart } = get()
        const nbJours = get().getNbJours()
        return cart.reduce((acc, item) => {
          const prix =
            item.type === 'equipement'
              ? item.item.prix_journalier * nbJours
              : item.item.prix_base
          return acc + prix * item.quantite
        }, 0)
      },

      /**
       * Règle métier L-Acoustics / Levage :
       * Si le panier contient un équipement avec technicien_obligatoire = true
       * → retirer l'option "retrait sur place", technicien requis.
       */
      requiresTechnicien: () => {
        return get().cart.some(
          (i) => i.type === 'equipement' && (i.item as Equipement).technicien_obligatoire
        )
      },

      /**
       * Règle métier transport :
       * Si le panier contient un équipement avec transport_obligatoire = true
       * → transport obligatoire.
       */
      requiresTransport: () => {
        return get().cart.some(
          (i) => i.type === 'equipement' && (i.item as Equipement).transport_obligatoire
        )
      },
    }),
    {
      name: 'vsonus-cart',
    }
  )
)
