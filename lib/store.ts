'use client'

import React from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Equipement, Pack, TarifAnnexe } from './directus'
import { getPackPrixEffectif } from './directus'
import { getLocationCoefficient } from './pricing'

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
  // Tiroir panier (contrôle global)
  cartDrawerOpen: boolean
  // Choix de livraison par article (packs optionnels + équipements éclairage)
  // Clés : ID nu pour les packs, "equip-{id}" pour les équipements
  livraisonChoix: Record<string, 'retrait' | 'livraison'>

  // --- Actions ---
  setCartDrawerOpen: (open: boolean) => void
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string, type: 'equipement' | 'pack') => void
  updateQuantite: (id: string, type: 'equipement' | 'pack', quantite: number) => void
  clearCart: () => void
  setDates: (start: string, end: string) => void
  setTarifsAnnexes: (tarifs: TarifAnnexe[]) => void
  setLivraisonChoix: (itemKey: string, choix: 'retrait' | 'livraison') => void

  // --- Getters (dérivés) ---
  getNbJours: () => number
  /** Somme brute : prix de location × quantite (sans coefficient de durée) */
  getSousTotalBrut: () => number
  /** Sous-total avec coefficient de durée appliqué (0 si 6+ jours → "sur demande") */
  getSousTotal: () => number
  /** Total des frais de livraison + fourgon (facturés 1×, hors coefficient) */
  getFraisLivraison: () => number
  /** Détail des frais : livraison seule et fourgon seul (facturés 1×, hors coefficient) */
  getFraisDetail: () => { livraison: number; fourgon: number }
  /** Coefficient de durée actuel (null = 6+ jours = sur demande) */
  getCoefficient: () => number | null
  requiresTechnicien: () => boolean
  requiresTransport: () => boolean
}

// ---------------------------------------------------------------------------
// Store Zustand
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Store chat (session — persiste pendant la navigation, pas entre sessions)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ChatState {
  chatMessages: ChatMessage[]
  chatOpen: boolean
  messageCount: number
  addChatMessage: (message: ChatMessage) => void
  setChatOpen: (open: boolean) => void
  setMessageCount: (count: number) => void
  clearChat: () => void
}

const sessionStorageAdapter =
  typeof window !== 'undefined' ? createJSONStorage(() => sessionStorage) : undefined

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chatMessages: [],
      chatOpen: false,
      messageCount: 0,
      addChatMessage: (message) =>
        set((state) => ({ chatMessages: [...state.chatMessages, message] })),
      setChatOpen: (open) => set({ chatOpen: open }),
      setMessageCount: (count) => set({ messageCount: count }),
      clearChat: () => set({ chatMessages: [], messageCount: 0 }),
    }),
    {
      name: 'vsonus-chat',
      ...(sessionStorageAdapter ? { storage: sessionStorageAdapter } : {}),
    }
  )
)

// Flag pour savoir si le store chat a été réhydraté depuis sessionStorage
export const useChatHydrated = () => {
  const [hydrated, setHydrated] = React.useState(false)
  React.useEffect(() => {
    const unsub = useChatStore.persist.onFinishHydration(() => setHydrated(true))
    // Si déjà hydraté (appel tardif)
    if (useChatStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])
  return hydrated
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      startDate: null,
      endDate: null,
      tarifsAnnexes: [],
      cartDrawerOpen: false,
      livraisonChoix: {},

      // -----------------------------------------------------------------------
      // Actions
      // -----------------------------------------------------------------------

      setCartDrawerOpen: (open) => set({ cartDrawerOpen: open }),

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
        set((state) => {
          const key = type === 'pack' ? id : `equip-${id}`
          const { [key]: _, ...restChoix } = state.livraisonChoix
          return {
            cart: state.cart.filter((i) => !(i.item.id === id && i.type === type)),
            livraisonChoix: restChoix,
          }
        })
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

      clearCart: () => set({ cart: [], startDate: null, endDate: null, livraisonChoix: {} }),

      setDates: (start, end) => set({ startDate: start, endDate: end }),

      setTarifsAnnexes: (tarifs) => set({ tarifsAnnexes: tarifs }),

      setLivraisonChoix: (itemKey, choix) =>
        set((state) => ({
          livraisonChoix: { ...state.livraisonChoix, [itemKey]: choix },
        })),

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
       * Sous-total brut : Σ (prix_unitaire × quantite) — sans coefficient de durée.
       * Prix unitaire = prix_journalier (équipement) ou prix_base (pack) pour 1 jour.
       */
      getSousTotalBrut: () => {
        return get().cart.reduce((acc, item) => {
          const prix = item.type === 'equipement' ? item.item.prix_journalier : getPackPrixEffectif(item.item as Pack)
          return acc + prix * item.quantite
        }, 0)
      },

      /**
       * Sous-total avec coefficient de durée appliqué (location seule, sans frais livraison/fourgon).
       * Retourne 0 si 6+ jours (tarif sur demande — la UI bloque la validation).
       */
      getSousTotal: () => {
        const brut = get().getSousTotalBrut()
        const nbJours = get().getNbJours()
        const coeff = getLocationCoefficient(nbJours)
        return coeff !== null ? brut * coeff : 0
      },

      /**
       * Total des frais de livraison + fourgon (facturés 1× hors coefficient).
       * Livraison : additive (chaque pack a sa propre livraison/installation).
       * Fourgon : 1× maximum — on facture le prix le plus élevé parmi tous les packs.
       */
      getFraisLivraison: () => {
        const { livraison, fourgon } = get().getFraisDetail()
        return livraison + fourgon
      },

      /**
       * Détail des frais : livraison (somme) et fourgon (max, facturé 1× quel que soit le nb de packs).
       */
      getFraisDetail: () => {
        const { cart, livraisonChoix } = get()
        let livraison = 0
        let fourgonMax = 0
        for (const item of cart) {
          if (item.type === 'pack') {
            const pack = item.item as Pack
            const mode = pack.mode_livraison ?? 'obligatoire'
            if (mode === 'retrait_uniquement') continue
            if (mode === 'obligatoire') {
              livraison += pack.prix_livraison ?? 0
              fourgonMax = Math.max(fourgonMax, pack.prix_fourgon ?? 0)
            } else if (mode === 'optionnel') {
              const choix = livraisonChoix[pack.id] ?? 'retrait'
              if (choix === 'livraison') {
                livraison += pack.prix_livraison ?? 0
                fourgonMax = Math.max(fourgonMax, pack.prix_fourgon ?? 0)
              }
            }
          } else if (item.type === 'equipement') {
            const eq = item.item as Equipement
            if (eq.categorie !== 'eclairage' || eq.prix_livraison == null) continue
            const choix = livraisonChoix[`equip-${eq.id}`] ?? 'retrait'
            if (choix === 'livraison') {
              livraison += eq.prix_livraison
            }
          }
        }
        return { livraison, fourgon: fourgonMax }
      },

      /** Coefficient de durée pour les dates actuelles (null = 6+ jours = sur demande) */
      getCoefficient: () => {
        return getLocationCoefficient(get().getNbJours())
      },

      /**
       * Règle métier L-Acoustics / Levage :
       * Si le panier contient un équipement avec technicien_obligatoire = true
       * → technicien requis.
       * MAIS si un pack est présent → pas de frais (le pack inclut déjà la livraison).
       */
      requiresTechnicien: () => {
        const { cart } = get()
        const hasPack = cart.some((i) => i.type === 'pack')
        if (hasPack) return false
        return cart.some(
          (i) => i.type === 'equipement' && (i.item as Equipement).technicien_obligatoire
        )
      },

      /**
       * Règle métier transport :
       * Si le panier contient un équipement avec transport_obligatoire = true
       * → transport obligatoire.
       * MAIS si un pack est présent → pas de frais (le pack inclut déjà la livraison).
       */
      requiresTransport: () => {
        const { cart } = get()
        const hasPack = cart.some((i) => i.type === 'pack')
        if (hasPack) return false
        return cart.some(
          (i) => i.type === 'equipement' && (i.item as Equipement).transport_obligatoire
        )
      },
    }),
    {
      name: 'vsonus-cart',
    }
  )
)
