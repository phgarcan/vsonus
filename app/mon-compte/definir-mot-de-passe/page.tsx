'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { PasswordInput } from '@/components/ui/PasswordInput'

export default function DefinirMotDePassePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await res.json()

      if (data.success) {
        setDone(true)
      } else {
        setError(data.error ?? 'Erreur lors de la définition du mot de passe.')
      }
    } catch {
      setError('Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          <div className="bg-vsonus-dark border border-gray-700 p-6">
            <p className="text-white font-bold mb-2">Mot de passe défini !</p>
            <p className="text-gray-400 text-sm">
              Vous pouvez maintenant vous connecter à votre espace client.
            </p>
            <Link
              href="/mon-compte/connexion"
              className="inline-block mt-6 bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:bg-red-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
          Bienvenue sur votre espace client !
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Définissez votre mot de passe pour accéder à vos réservations.
        </p>

        {!token && (
          <div className="bg-vsonus-dark border border-gray-700 p-6">
            <p className="text-gray-400 text-sm">
              Lien invalide ou expiré. Veuillez demander un nouveau lien depuis la page{' '}
              <Link href="/mon-compte/mot-de-passe-oublie" className="text-vsonus-red hover:underline">
                mot de passe oublié
              </Link>.
            </p>
          </div>
        )}

        {token && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Nouveau mot de passe
              </label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                Confirmer le mot de passe
              </label>
              <PasswordInput
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm border border-red-900 bg-red-900/10 px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-vsonus-red text-white font-bold uppercase tracking-widest py-3 text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Définir mon mot de passe'}
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
