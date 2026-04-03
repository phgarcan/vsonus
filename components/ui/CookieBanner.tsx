'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Cookie } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

export interface ConsentPreferences {
  necessary: true
  functional: boolean
  analytics: boolean
  marketing: boolean
  timestamp: string
}

// ── Helpers cookies ──────────────────────────────────────────────────────────

const COOKIE_NAME = 'vsonus_consent'
const COOKIE_DAYS = 365

function getRawCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setRawCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

export function getConsent(): ConsentPreferences | null {
  try {
    const raw = getRawCookie(COOKIE_NAME)
    if (!raw) return null
    return JSON.parse(raw) as ConsentPreferences
  } catch {
    return null
  }
}

export function hasConsent(): boolean {
  return getConsent() !== null
}

function setConsent(prefs: ConsentPreferences) {
  setRawCookie(COOKIE_NAME, JSON.stringify(prefs), COOKIE_DAYS)
  window.dispatchEvent(new CustomEvent('consentUpdated', { detail: prefs }))
}

// ── Catégories ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    key: 'necessary' as const,
    label: 'Nécessaires',
    description: 'Session, panier, préférences de consentement. Indispensables au fonctionnement du site.',
    locked: true,
  },
  {
    key: 'functional' as const,
    label: 'Fonctionnels',
    description: 'Assistant virtuel Max (chatbot). Permet d\'interagir avec notre assistant en ligne.',
    locked: false,
  },
  {
    key: 'analytics' as const,
    label: 'Analytiques',
    description: 'Google Analytics, Hotjar. Nous aident à comprendre comment vous utilisez le site.',
    locked: false,
  },
  {
    key: 'marketing' as const,
    label: 'Marketing',
    description: 'Google Ads. Permettent de mesurer l\'efficacité de nos campagnes publicitaires.',
    locked: false,
  },
]

// ── Composant Toggle ─────────────────────────────────────────────────────────

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center transition-colors duration-200 ${
        checked ? 'bg-vsonus-red' : 'bg-gray-600'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-4 w-4 bg-white transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// ── Composant principal ──────────────────────────────────────────────────────

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [prefs, setPrefs] = useState({
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    if (!hasConsent()) {
      setVisible(true)
    } else {
      setConsentGiven(true)
    }

    // Écouter les demandes d'ouverture du panneau (depuis le footer)
    const handleOpen = () => {
      const current = getConsent()
      if (current) {
        setPrefs({
          functional: current.functional,
          analytics: current.analytics,
          marketing: current.marketing,
        })
      }
      setShowCustomize(true)
      setVisible(true)
    }
    window.addEventListener('openCookieSettings', handleOpen)
    return () => window.removeEventListener('openCookieSettings', handleOpen)
  }, [])

  const saveAndClose = useCallback((consent: Omit<ConsentPreferences, 'necessary' | 'timestamp'>) => {
    setConsent({
      necessary: true,
      ...consent,
      timestamp: new Date().toISOString(),
    })
    setVisible(false)
    setShowCustomize(false)
    setConsentGiven(true)
  }, [])

  const acceptAll = () => saveAndClose({ functional: true, analytics: true, marketing: true })
  const refuseAll = () => saveAndClose({ functional: false, analytics: false, marketing: false })
  const saveCustom = () => saveAndClose(prefs)

  if (!visible) {
    // Icône cookie discrète — visible uniquement après un choix
    if (!consentGiven) return null
    return (
      <button
        type="button"
        onClick={() => {
          const current = getConsent()
          if (current) {
            setPrefs({
              functional: current.functional,
              analytics: current.analytics,
              marketing: current.marketing,
            })
          }
          setShowCustomize(true)
          setVisible(true)
        }}
        className="fixed bottom-4 left-4 z-40 text-gray-500 opacity-30 hover:opacity-100 transition-opacity duration-200"
        aria-label="Gérer mes cookies"
        title="Gérer mes cookies"
      >
        <Cookie size={20} />
      </button>
    )
  }

  // ── Panneau de personnalisation ──────────────────────────────────────────

  if (showCustomize) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => { setShowCustomize(false); if (hasConsent()) setVisible(false) }}
        />

        {/* Panneau */}
        <div className="relative z-10 w-full max-w-lg bg-vsonus-dark border-t-2 border-vsonus-red sm:border-2 sm:border-vsonus-red/30 sm:border-t-2 sm:border-t-vsonus-red mx-0 sm:mx-4">
          <div className="px-5 py-5 sm:px-6 sm:py-6">
            <h2 className="text-white text-base font-bold uppercase tracking-widest mb-1">
              Gérer mes cookies
            </h2>
            <p className="text-gray-400 text-xs mb-5">
              Choisissez les catégories de cookies que vous acceptez.
            </p>

            <div className="space-y-4">
              {CATEGORIES.map((cat) => (
                <div key={cat.key} className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      {cat.label}
                      {cat.locked && (
                        <span className="ml-2 text-[10px] font-normal text-gray-500 uppercase tracking-wider">
                          toujours actif
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{cat.description}</p>
                  </div>
                  <Toggle
                    checked={cat.locked ? true : prefs[cat.key as keyof typeof prefs]}
                    disabled={cat.locked}
                    onChange={cat.locked ? undefined : (v) => setPrefs((p) => ({ ...p, [cat.key]: v }))}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={saveCustom}
              className="mt-6 w-full bg-vsonus-red text-white text-sm font-bold uppercase tracking-widest px-6 py-3 hover:bg-red-700 transition-colors"
            >
              Enregistrer mes préférences
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Bandeau principal ────────────────────────────────────────────────────

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-vsonus-red bg-vsonus-dark px-4 py-5 sm:px-6 sm:py-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <p className="text-sm text-gray-300">
          Nous utilisons des cookies pour améliorer votre expérience.{' '}
          <Link href="/politique-de-confidentialite" className="text-vsonus-red hover:text-white underline transition-colors">
            En savoir plus
          </Link>
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={acceptAll}
            className="flex-1 bg-vsonus-red text-white text-sm font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-red-700 transition-colors"
          >
            Tout accepter
          </button>
          <button
            onClick={refuseAll}
            className="flex-1 border-2 border-vsonus-red text-vsonus-red text-sm font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-vsonus-red hover:text-white transition-colors"
          >
            Tout refuser
          </button>
          <button
            onClick={() => setShowCustomize(true)}
            className="flex-1 border-2 border-gray-600 text-gray-300 text-sm font-bold uppercase tracking-widest px-6 py-2.5 hover:border-gray-400 hover:text-white transition-colors"
          >
            Personnaliser
          </button>
        </div>
      </div>
    </div>
  )
}
