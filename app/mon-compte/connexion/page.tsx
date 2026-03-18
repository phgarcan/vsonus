'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '@/lib/auth'

export default function ConnexionPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    if (result.success) {
      router.push('/mon-compte')
      router.refresh()
    } else {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-2">
          Connexion
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Accédez à votre espace client V-Sonus.
        </p>

        {error && (
          <div className="bg-red-900/30 border border-vsonus-red text-vsonus-red text-sm px-4 py-3 mb-6">
            {error}
          </div>
        )}

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

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:border-vsonus-red focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-vsonus-red text-white font-bold uppercase tracking-widest py-3 text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <Link
            href="/mon-compte/mot-de-passe-oublie"
            className="block text-sm text-gray-500 hover:text-vsonus-red transition-colors"
          >
            Mot de passe oublié ?
          </Link>
          <p className="text-xs text-gray-600">
            Pas encore de compte ? Un espace client est créé automatiquement après votre première réservation.
          </p>
        </div>
      </div>
    </div>
  )
}
