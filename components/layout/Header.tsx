'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MegaMenu } from './MegaMenu'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useStore } from '@/lib/store'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const cart = useStore((s) => s.cart)
  const drawerOpen = useStore((s) => s.cartDrawerOpen)
  const setDrawerOpen = useStore((s) => s.setCartDrawerOpen)
  const cartCount = cart.reduce((acc, i) => acc + i.quantite, 0)

  return (
    <>
    <header className="sticky top-0 z-50 bg-vsonus-black border-b border-vsonus-dark">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/logo-vsonus.png"
            alt="V-Sonus"
            width={140}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </Link>

        {/* Navigation principale */}
        <nav className="flex items-center gap-6">
          {/* Bouton Catalogue – ouvre le MegaMenu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              onMouseEnter={() => setMenuOpen(true)}
              className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-white hover:text-vsonus-red transition-colors"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              Catalogue
              <svg
                className={`w-3 h-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <Link
            href="/catalogue"
            className="hidden md:block text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Tout voir
          </Link>

          <Link
            href="/galerie"
            className="hidden md:block text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Galerie
          </Link>

          <Link
            href="/contact"
            className="hidden md:block text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Bouton panier → ouvre le tiroir */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex items-center gap-2 bg-vsonus-dark border border-gray-700 px-4 py-2 text-sm font-bold uppercase tracking-widest hover:border-vsonus-red hover:shadow-glow-red transition-all duration-200"
          aria-label="Ouvrir ma sélection"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="hidden sm:inline">Sélection</span>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-vsonus-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mega Menu */}
      {menuOpen && <MegaMenu onClose={() => setMenuOpen(false)} />}
    </header>

    {/* Tiroir panier — monté en dehors du header pour couvrir toute la page */}
    <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
