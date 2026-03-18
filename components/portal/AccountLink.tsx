'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, LogIn } from 'lucide-react'

export function AccountLink({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Check if we have access token cookie (can't read httpOnly, check via API)
    fetch('/api/auth/check')
      .then(r => r.json())
      .then(d => { setLoggedIn(d.loggedIn); setChecked(true) })
      .catch(() => setChecked(true))
  }, [])

  if (!checked) return null

  if (variant === 'mobile') {
    return (
      <Link
        href={loggedIn ? '/mon-compte' : '/mon-compte/connexion'}
        className="flex items-center gap-3 px-6 py-4 text-xl font-black uppercase tracking-widest text-white hover:text-vsonus-red transition-colors border-b border-gray-900 min-h-[56px]"
      >
        {loggedIn ? 'Mon compte' : 'Se connecter'}
      </Link>
    )
  }

  return (
    <Link
      href={loggedIn ? '/mon-compte' : '/mon-compte/connexion'}
      className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
    >
      {loggedIn ? 'Mon compte' : 'Se connecter'}
    </Link>
  )
}
