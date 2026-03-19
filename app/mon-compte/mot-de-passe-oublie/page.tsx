'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => {})
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
          Mot de passe oublié
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Entrez votre adresse email pour recevoir un lien de réinitialisation.
        </p>

        {sent ? (
          <div className="bg-vsonus-dark border border-gray-700 p-6">
            <p className="text-white font-bold mb-2">Email envoyé</p>
            <p className="text-gray-400 text-sm">
              Si cette adresse est associée à un compte, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </p>
            <Link
              href="/mon-compte/connexion"
              className="inline-block mt-6 text-vsonus-red text-sm font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:border-vsonus-red focus:outline-none transition-colors"
                placeholder="votre@email.ch"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vsonus-red text-white font-bold uppercase tracking-widest py-3 text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Réinitialiser'}
            </button>
            <Link
              href="/mon-compte/connexion"
              className="block text-center text-sm text-gray-500 hover:text-vsonus-red transition-colors"
            >
              Retour à la connexion
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
