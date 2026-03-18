'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, UserCheck } from 'lucide-react'

export function AccountLink({ variant = 'desktop' }: { variant?: 'desktop' | 'mobile' }) {
  const [loggedIn, setLoggedIn] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    fetch('/api/auth/check')
      .then(r => r.json())
      .then(d => { setLoggedIn(d.loggedIn); setChecked(true) })
      .catch(() => setChecked(true))
  }, [])

  if (!checked) return null

  const href = loggedIn ? '/mon-compte' : '/mon-compte/connexion'

  if (variant === 'mobile') {
    return (
      <Link
        href={href}
        className="flex items-center px-6 py-4 text-xl font-black uppercase tracking-widest text-white hover:text-vsonus-red transition-colors border-b border-gray-900 min-h-[56px]"
      >
        {loggedIn ? 'Mon compte' : 'Se connecter'}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className="relative flex items-center justify-center w-10 h-10 text-gray-400 hover:text-vsonus-red transition-colors"
      aria-label={loggedIn ? 'Mon compte' : 'Se connecter'}
    >
      {loggedIn ? (
        <>
          <UserCheck className="w-5 h-5" strokeWidth={1.5} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500" />
        </>
      ) : (
        <User className="w-5 h-5" strokeWidth={1.5} />
      )}
    </Link>
  )
}
