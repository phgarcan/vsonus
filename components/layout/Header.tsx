'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ClipboardList } from 'lucide-react'
import { MegaMenu } from './MegaMenu'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { useStore } from '@/lib/store'

const NAV_LINKS = [
  { href: '/',            label: 'Accueil' },
  { href: '/prestations', label: 'Prestations' },
  { href: '/catalogue',   label: 'Catalogue' },
  { href: '/galerie',     label: 'Galerie' },
  { href: '/a-propos',    label: 'À propos' },
  { href: '/contact',     label: 'Contact' },
]

export function Header() {
  const [megaOpen, setMegaOpen]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mounted, setMounted]     = useState(false)

  const cart        = useStore((s) => s.cart)
  const drawerOpen  = useStore((s) => s.cartDrawerOpen)
  const setDrawerOpen = useStore((s) => s.setCartDrawerOpen)
  const cartCount   = cart.reduce((acc, i) => acc + i.quantite, 0)

  useEffect(() => { setMounted(true) }, [])

  // Bloque le scroll quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header className="sticky top-0 z-50 bg-vsonus-black border-b border-vsonus-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

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

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/prestations" className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
              Prestations
            </Link>

            {/* Catalogue — MegaMenu desktop */}
            <div className="relative">
              <button
                onClick={() => setMegaOpen((v) => !v)}
                onMouseEnter={() => setMegaOpen(true)}
                className="flex items-center gap-1 text-sm font-bold uppercase tracking-widest text-white hover:text-vsonus-red transition-colors"
                aria-expanded={megaOpen}
                aria-haspopup="true"
              >
                Catalogue
                <svg className={`w-3 h-3 transition-transform ${megaOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <Link href="/galerie"   className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Galerie</Link>
            <Link href="/a-propos"  className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">À propos</Link>
            <Link href="/contact"   className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Contact</Link>
          </nav>

          {/* Actions droite */}
          <div className="flex items-center gap-3">
            {/* Bouton Ma liste */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 bg-vsonus-dark border border-gray-700 px-3 sm:px-4 py-2 text-sm font-bold uppercase tracking-widest hover:border-vsonus-red hover:shadow-glow-red transition-all duration-200"
              aria-label="Ouvrir ma sélection"
            >
              <ClipboardList className="w-5 h-5" strokeWidth={2} />
              <span className="hidden sm:inline">Ma liste</span>
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-vsonus-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Burger mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden flex items-center justify-center w-10 h-10 text-white hover:text-vsonus-red transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* MegaMenu desktop */}
        {megaOpen && <MegaMenu onClose={() => setMegaOpen(false)} />}
      </header>

      {/* ── Menu mobile plein écran ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-vsonus-black flex flex-col">
          {/* En-tête */}
          <div className="flex items-center justify-between px-4 h-16 border-b border-vsonus-dark flex-shrink-0">
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Image src="/logo-vsonus.png" alt="V-Sonus" width={120} height={40} className="h-9 w-auto object-contain" />
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center w-10 h-10 text-white hover:text-vsonus-red transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Liens */}
          <nav className="flex flex-col flex-1 justify-center px-8 gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="text-2xl font-black uppercase tracking-widest text-white hover:text-vsonus-red transition-colors py-3 border-b border-gray-900"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Coordonnées + CTA bas */}
          <div className="px-8 py-8 flex-shrink-0 space-y-4">
            <div className="space-y-1 text-sm text-gray-400">
              <a href="tel:+41796512114" className="block hover:text-white transition-colors">+41 79 651 21 14</a>
              <a href="mailto:info@vsonus.ch" className="block hover:text-white transition-colors">info@vsonus.ch</a>
              <p>Rue des Bosquets 17, 1800 Vevey</p>
            </div>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center bg-vsonus-red text-white font-bold uppercase tracking-widest px-6 py-4 hover:bg-red-700 transition-colors"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      )}

      {/* Tiroir sélection */}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
