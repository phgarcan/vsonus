'use client'

import { useState } from 'react'
import { createAccountPostCheckout } from '@/app/actions/account'

interface Props {
  email: string
  nom: string
  reservationId: string
}

export function CreateAccountSection({ email, nom, reservationId }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    const result = await createAccountPostCheckout({ email, nom, reservationId })
    if (result.success) {
      setDone(true)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="mt-10 bg-vsonus-dark border border-gray-800 px-5 py-4 text-center">
        <p className="text-sm text-green-400 font-bold mb-1">Compte créé !</p>
        <p className="text-sm text-gray-400">
          Vérifiez votre email pour définir votre mot de passe.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-10 border-t border-gray-800 pt-8 text-center">
      <p className="text-sm text-gray-400 mb-4">
        Vous n&apos;avez pas encore d&apos;espace client ?
      </p>
      <button
        onClick={handleCreate}
        disabled={loading}
        className="bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {loading ? 'Création en cours…' : 'Créer mon espace client'}
      </button>
      {error && (
        <p className="text-xs text-red-400 mt-3">{error}</p>
      )}
    </div>
  )
}
