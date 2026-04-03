'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function ConfirmerEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Lien invalide — aucun token fourni.')
      return
    }

    fetch('/api/auth/confirm-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (data.success) {
          setStatus('success')
          setMessage('Votre adresse email a été mise à jour avec succès.')
        } else {
          setStatus('error')
          setMessage(data.error ?? 'Erreur lors de la confirmation.')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Erreur de connexion au serveur.')
      })
  }, [token])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-vsonus-red mx-auto animate-spin" />
            <p className="text-gray-400">Confirmation en cours...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">{message}</h1>
            <p className="text-sm text-gray-400">
              Vous devrez vous reconnecter avec votre nouvelle adresse email.
            </p>
            <Link
              href="/mon-compte/connexion"
              className="inline-block bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:bg-red-700 transition-colors"
            >
              Se reconnecter →
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-black uppercase tracking-widest text-white">Erreur</h1>
            <p className="text-sm text-gray-400">{message}</p>
            <Link
              href="/mon-compte/profil"
              className="inline-block border border-gray-700 text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:border-vsonus-red transition-colors"
            >
              Retour au profil →
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
