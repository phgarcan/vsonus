'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingCart, Phone, Mail, MapPin, ChevronDown, Disc3, Mic2, Volume2, Lightbulb, Landmark, MonitorPlay, Wrench, Camera, Info, Send, type LucideIcon } from 'lucide-react'
import { MegaMenu } from './MegaMenu'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { AccountLink } from '@/components/portal/AccountLink'
import { useStore } from '@/lib/store'

// ─── Données de navigation ────────────────────────────────────────────────────

const PACKS_ITEMS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Disc3,      label: 'Packs DJ & Soirées',    href: '/packs/dj' },
  { icon: Mic2,       label: 'Packs Concerts',         href: '/packs/concerts' },
  { icon: Volume2,    label: 'Packs Sonorisation',     href: '/packs/sonorisation-l-acoustics' },
  { icon: Lightbulb,  label: 'Packs Éclairage',        href: '/packs/eclairage' },
  { icon: Landmark,   label: 'Packs Scènes',           href: '/packs/scenes' },
  { icon: MonitorPlay,label: 'Pack Mapping',            href: '/packs/mapping' },
]

const MOBILE_MATERIEL = [
  { label: 'Sonorisation',       href: '/catalogue?categorie=sonorisation' },
  { label: 'Éclairage',          href: '/catalogue?categorie=eclairage' },
  { label: 'Scènes & Structures', href: '/catalogue?categorie=scenes' },
  { label: 'Vidéo & Mapping',    href: '/catalogue?categorie=mapping' },
]

const DIRECT_LINKS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Wrench,  label: 'Événementiel', href: '/gestion-evenementielle' },
  { icon: Camera,  label: 'Réalisations',  href: '/galerie' },
  { icon: Info,    label: 'À propos',     href: '/a-propos' },
  { icon: Send,    label: 'Contact',      href: '/contact' },
]

// ─── Composant ────────────────────────────────────────────────────────────────

function useActiveNav() {
  const pathname = usePathname()
  return (key: 'packs' | 'location' | 'evenementiel' | 'realisations' | 'a-propos' | 'contact') => {
    if (key === 'packs')         return pathname.startsWith('/packs')
    if (key === 'location')      return pathname.startsWith('/catalogue')
    if (key === 'evenementiel')  return pathname === '/gestion-evenementielle'
    if (key === 'realisations')  return pathname === '/galerie'
    if (key === 'a-propos')      return pathname === '/a-propos'
    if (key === 'contact')       return pathname === '/contact'
    return false
  }
}

export function Header() {
  const [packsOpen, setPacksOpen]           = useState(false)
  const [megaOpen, setMegaOpen]             = useState(false)
  const [mobileOpen, setMobileOpen]         = useState(false)
  const [mobilePacksOpen, setMobilePacksOpen]       = useState(false)
  const [mobileMaterielOpen, setMobileMaterielOpen] = useState(false)
  const [mounted, setMounted]               = useState(false)
  const isActive = useActiveNav()

  const cart           = useStore((s) => s.cart)
  const drawerOpen     = useStore((s) => s.cartDrawerOpen)
  const setDrawerOpen  = useStore((s) => s.setCartDrawerOpen)
  const cartCount      = cart.reduce((acc, i) => acc + i.quantite, 0)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const closeAll = () => {
    setMobileOpen(false)
    setMobilePacksOpen(false)
    setMobileMaterielOpen(false)
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-vsonus-black border-b border-vsonus-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-vsonus.svg" alt="V-Sonus" className="h-11 w-auto" />
          </Link>

          {/* ── Navigation desktop (lg+) ─────────────────────────────────── */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">

            {/* PACKS — petit dropdown hover */}
            <div
              className="relative"
              onMouseEnter={() => setPacksOpen(true)}
              onMouseLeave={() => setPacksOpen(false)}
            >
              <button
                className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${isActive('packs') ? 'text-vsonus-red border-b-2 border-vsonus-red' : 'text-gray-400 hover:text-white'}`}
                aria-expanded={packsOpen}
                aria-haspopup="true"
              >
                Packs
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${packsOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
              </button>

              {/* Dropdown */}
              {packsOpen && (
                <div className="absolute top-full left-0 pt-3 z-50 min-w-[250px]">
                  <div className="bg-vsonus-dark border border-gray-800 border-t-2 border-t-vsonus-red shadow-glow-red py-1">
                    {PACKS_ITEMS.map(({ icon: Icon, label, href }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-black/40 transition-colors min-h-[44px]"
                        onClick={() => setPacksOpen(false)}
                      >
                        <Icon className="w-4 h-4 text-vsonus-red flex-shrink-0" strokeWidth={1.5} />
                        <span className="font-bold uppercase tracking-wider text-xs">{label}</span>
                      </Link>
                    ))}
                    <div className="h-px bg-vsonus-red/40 mx-4 my-1" />
                    <Link
                      href="/packs"
                      className="flex items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-vsonus-red hover:text-white transition-colors min-h-[44px]"
                      onClick={() => setPacksOpen(false)}
                    >
                      Voir tous les packs
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="square" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* LOCATION MATÉRIEL — mega menu */}
            <div className="relative">
              <button
                onClick={() => setMegaOpen((v) => !v)}
                onMouseEnter={() => setMegaOpen(true)}
                className={`flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${isActive('location') ? 'text-vsonus-red border-b-2 border-vsonus-red' : 'text-gray-400 hover:text-white'}`}
                aria-expanded={megaOpen}
                aria-haspopup="true"
              >
                Location
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
              </button>
            </div>

            <Link href="/gestion-evenementielle" className={`text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${isActive('evenementiel') ? 'text-vsonus-red border-b-2 border-vsonus-red' : 'text-gray-400 hover:text-white'}`}>
              Événementiel
            </Link>
            <Link href="/galerie" className={`text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${isActive('realisations') ? 'text-vsonus-red border-b-2 border-vsonus-red' : 'text-gray-400 hover:text-white'}`}>
              Réalisations
            </Link>
            <Link href="/a-propos" className={`text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${isActive('a-propos') ? 'text-vsonus-red border-b-2 border-vsonus-red' : 'text-gray-400 hover:text-white'}`}>
              À propos
            </Link>
            <Link href="/contact" className={`text-xs font-bold uppercase tracking-widest transition-colors duration-200 ${isActive('contact') ? 'text-vsonus-red border-b-2 border-vsonus-red' : 'text-gray-400 hover:text-white'}`}>
              Contact
            </Link>
          </nav>

          {/* ── Actions droite ────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Icône Mon compte */}
            <AccountLink variant="desktop" />

            {/* Bouton MA LISTE */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative flex items-center gap-2 bg-vsonus-dark border border-gray-700 px-3 sm:px-4 py-2 text-sm font-bold uppercase tracking-widest hover:border-vsonus-red hover:shadow-glow-red transition-all duration-200"
              aria-label="Ouvrir ma liste"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={2} />
              <span className="hidden sm:inline">Ma liste</span>
              {mounted && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-vsonus-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Burger mobile (< lg) */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 text-white hover:text-vsonus-red transition-colors"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* MegaMenu desktop */}
        {megaOpen && <MegaMenu onClose={() => setMegaOpen(false)} />}
      </header>

      {/* ── Menu mobile plein écran ───────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-vsonus-black flex flex-col">
          {/* Liseré rouge */}
          <div className="h-1 bg-vsonus-red flex-shrink-0" />

          {/* En-tête : logo + MA LISTE + fermer */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-gray-900 flex-shrink-0">
            <Link href="/" onClick={closeAll}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-vsonus.svg" alt="V-Sonus" className="h-9 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              {/* MA LISTE visible dans le menu mobile */}
              <button
                onClick={() => { setDrawerOpen(true); setMobileOpen(false) }}
                className="relative flex items-center gap-2 bg-transparent border border-gray-800 px-3 py-2 text-sm font-bold uppercase tracking-widest hover:border-vsonus-red transition-all duration-200"
                aria-label="Ouvrir ma liste"
              >
                <ShoppingCart className="w-5 h-5" strokeWidth={2} />
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-vsonus-red text-white text-xs font-bold w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-10 h-10 border border-gray-800 text-gray-400 hover:text-white hover:border-vsonus-red transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation accordéon */}
          <nav className="flex-1 overflow-y-auto">

            {/* Nos Packs (accordéon) */}
            <div className="border-b border-gray-900">
              <button
                onClick={() => setMobilePacksOpen((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 hover:text-vsonus-red transition-colors duration-200 min-h-[56px]"
              >
                <span className={`text-xl font-black uppercase tracking-widest ${isActive('packs') ? 'text-vsonus-red' : 'text-white'}`}>Nos Packs</span>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${mobilePacksOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
              </button>
              {mobilePacksOpen && (
                <div className="bg-black/40 border-t border-gray-900">
                  {PACKS_ITEMS.map(({ label, href }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeAll}
                      className="flex items-center px-10 py-3.5 text-gray-300 hover:text-white transition-colors min-h-[44px]"
                    >
                      <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
                    </Link>
                  ))}
                  <Link
                    href="/packs"
                    onClick={closeAll}
                    className="flex items-center gap-2 px-10 py-3.5 text-vsonus-red text-sm font-bold uppercase tracking-widest hover:text-white transition-colors min-h-[44px]"
                  >
                    Voir tous les packs →
                  </Link>
                </div>
              )}
            </div>

            {/* Location Matériel (accordéon) */}
            <div className="border-b border-gray-900">
              <button
                onClick={() => setMobileMaterielOpen((v) => !v)}
                className="w-full flex items-center justify-between px-6 py-4 hover:text-vsonus-red transition-colors duration-200 min-h-[56px]"
              >
                <span className={`text-xl font-black uppercase tracking-widest ${isActive('location') ? 'text-vsonus-red' : 'text-white'}`}>Location Matériel</span>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${mobileMaterielOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
              </button>
              {mobileMaterielOpen && (
                <div className="bg-black/40 border-t border-gray-900">
                  {MOBILE_MATERIEL.map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={closeAll}
                      className="flex items-center px-10 py-3.5 text-gray-300 hover:text-white transition-colors min-h-[44px]"
                    >
                      <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
                    </Link>
                  ))}
                  <Link
                    href="/catalogue"
                    onClick={closeAll}
                    className="flex items-center gap-2 px-10 py-3.5 text-vsonus-red text-sm font-bold uppercase tracking-widest hover:text-white transition-colors min-h-[44px]"
                  >
                    Voir tout le catalogue →
                  </Link>
                </div>
              )}
            </div>

            {/* Liens directs */}
            {DIRECT_LINKS.map(({ label, href }) => {
              const key = href === '/gestion-evenementielle' ? 'evenementiel'
                        : href === '/galerie'                ? 'realisations'
                        : href === '/a-propos'               ? 'a-propos'
                        : 'contact' as Parameters<typeof isActive>[0]
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeAll}
                  className={`flex items-center px-6 py-4 text-xl font-black uppercase tracking-widest border-b border-gray-900 min-h-[56px] transition-colors duration-200 ${isActive(key) ? 'text-vsonus-red' : 'text-white hover:text-vsonus-red'}`}
                >
                  {label}
                </Link>
              )
            })}

            {/* Mon compte */}
            <AccountLink variant="mobile" />

            {/* Appel rapide */}
            <div className="px-6 py-4 border-b border-gray-900">
              <a
                href="tel:+41796512114"
                className="flex items-center justify-center gap-3 w-full bg-vsonus-dark border border-gray-700 py-4 text-white font-bold uppercase tracking-widest hover:border-vsonus-red transition-colors min-h-[56px]"
              >
                <Phone className="w-5 h-5 text-vsonus-red flex-shrink-0" strokeWidth={1.5} />
                +41 79 651 21 14
              </a>
            </div>
          </nav>

          {/* Coordonnées + CTA bas */}
          <div className="px-6 py-5 flex-shrink-0 space-y-4 border-t border-gray-900">
            <div className="space-y-2">
              <a href="mailto:info@vsonus.ch" className="flex items-center gap-3 text-sm text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-vsonus-red flex-shrink-0" strokeWidth={1.5} />
                info@vsonus.ch
              </a>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-vsonus-red flex-shrink-0" strokeWidth={1.5} />
                Rue des Bosquets 17, 1800 Vevey
              </div>
            </div>
            <Link
              href="/contact"
              onClick={closeAll}
              className="flex items-center justify-center gap-2 w-full bg-vsonus-red text-white font-bold uppercase tracking-widest px-6 py-4 hover:bg-red-700 transition-colors"
            >
              Demander un devis
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="square" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Tiroir liste */}
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
