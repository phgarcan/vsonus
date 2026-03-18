'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSession, updateProfile, changePassword, type SessionUser } from '@/lib/auth'

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    getSession().then((s) => {
      if (!s) { router.push('/mon-compte/connexion'); return }
      setUser(s)
      setFirstName(s.first_name ?? '')
      setLastName(s.last_name ?? '')
      setPhone(s.phone ?? '')
    })
  }, [router])

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const result = await updateProfile({ first_name: firstName, last_name: lastName, phone })
    setMsg(result.success ? 'Profil mis à jour.' : (result.error ?? 'Erreur.'))
    setLoading(false)
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwLoading(true)
    setPwMsg('')
    if (newPw.length < 6) { setPwMsg('Le mot de passe doit contenir au moins 6 caractères.'); setPwLoading(false); return }
    const result = await changePassword(currentPw, newPw)
    setPwMsg(result.success ? 'Mot de passe modifié.' : (result.error ?? 'Erreur.'))
    setPwLoading(false)
    if (result.success) { setCurrentPw(''); setNewPw('') }
  }

  if (!user) return <div className="min-h-[50vh] flex items-center justify-center text-gray-600">Chargement...</div>

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/mon-compte" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-vsonus-red transition-colors mb-6 inline-block">
        ← Retour au dashboard
      </Link>

      <h1 className="text-3xl font-black uppercase tracking-widest text-white mb-8">Mon profil</h1>

      {/* Profile form */}
      <form onSubmit={handleProfile} className="space-y-5 mb-12">
        <h2 className="text-sm font-black uppercase tracking-widest text-vsonus-red mb-4">Informations personnelles</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Prénom</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:border-vsonus-red focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nom</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:border-vsonus-red focus:outline-none transition-colors" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email</label>
          <input type="email" value={user.email} disabled
            className="w-full bg-vsonus-black border border-gray-800 text-gray-500 px-4 py-3 text-sm cursor-not-allowed" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Téléphone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:border-vsonus-red focus:outline-none transition-colors" />
        </div>

        {msg && <p className={`text-sm ${msg.includes('Erreur') ? 'text-red-500' : 'text-green-500'}`}>{msg}</p>}

        <button type="submit" disabled={loading}
          className="bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:bg-red-700 transition-colors disabled:opacity-50">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={handlePassword} className="space-y-5">
        <h2 className="text-sm font-black uppercase tracking-widest text-vsonus-red mb-4 border-t border-gray-800 pt-8">Changer le mot de passe</h2>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Mot de passe actuel</label>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required
            className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:border-vsonus-red focus:outline-none transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nouveau mot de passe</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={6}
            className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:border-vsonus-red focus:outline-none transition-colors" />
        </div>

        {pwMsg && <p className={`text-sm ${pwMsg.includes('Erreur') ? 'text-red-500' : 'text-green-500'}`}>{pwMsg}</p>}

        <button type="submit" disabled={pwLoading}
          className="border border-gray-700 text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:border-vsonus-red transition-colors disabled:opacity-50">
          {pwLoading ? 'Modification...' : 'Changer le mot de passe'}
        </button>
      </form>
    </div>
  )
}
