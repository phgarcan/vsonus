'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Pencil, X, AlertTriangle } from 'lucide-react'
import { getSession, updateProfile, changePassword, type SessionUser } from '@/lib/auth'
import { deleteAccount } from '@/app/actions/account'
import { formatSwissPhone } from '@/lib/utils'
import { PasswordInput } from '@/components/ui/PasswordInput'

const inputCls = 'w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:border-vsonus-red focus:outline-none transition-colors'

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwTouched, setPwTouched] = useState(false)
  const [pwMsg, setPwMsg] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const pwTooShort = newPw.length > 0 && newPw.length < 8
  const pwMismatch = confirmPw.length > 0 && newPw !== confirmPw
  const pwCanSubmit = currentPw.length > 0 && newPw.length >= 8 && newPw === confirmPw && !pwLoading

  // État suppression compte
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePw, setDeletePw] = useState('')
  const [deleteMsg, setDeleteMsg] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)

  // État modification email
  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailMsgType, setEmailMsgType] = useState<'success' | 'error' | ''>('')
  const [emailLoading, setEmailLoading] = useState(false)

  useEffect(() => {
    getSession().then((s) => {
      if (!s) { router.push('/mon-compte/connexion'); return }
      setUser(s)
      setFirstName(s.first_name ?? '')
      setLastName(s.last_name ?? '')
      setPhone(s.phone ?? '')
      setLocation(s.location ?? '')
    })
  }, [router])

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const result = await updateProfile({ first_name: firstName, last_name: lastName, phone, location })
    setMsg(result.success ? 'Profil mis à jour.' : (result.error ?? 'Erreur.'))
    setLoading(false)
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwLoading(true)
    setPwMsg('')
    setPwTouched(true)
    if (newPw.length < 8) { setPwMsg('Le mot de passe doit contenir au moins 8 caractères.'); setPwLoading(false); return }
    if (newPw !== confirmPw) { setPwMsg('Les mots de passe ne correspondent pas.'); setPwLoading(false); return }
    const result = await changePassword(currentPw, newPw)
    setPwMsg(result.success ? 'Mot de passe modifié.' : (result.error ?? 'Erreur.'))
    setPwLoading(false)
    if (result.success) { setCurrentPw(''); setNewPw(''); setConfirmPw('') }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setEmailMsg('')
    setEmailMsgType('')

    // Validation côté client
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!newEmail || !emailRegex.test(newEmail)) {
      setEmailMsg('Adresse email invalide.')
      setEmailMsgType('error')
      setEmailLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      })
      const data = await res.json()

      if (data.success) {
        setEmailMsg(`Un email de confirmation a été envoyé à ${newEmail}`)
        setEmailMsgType('success')
        setEditingEmail(false)
        setNewEmail('')
      } else {
        setEmailMsg(data.error ?? 'Erreur.')
        setEmailMsgType('error')
      }
    } catch {
      setEmailMsg('Erreur de connexion.')
      setEmailMsgType('error')
    }

    setEmailLoading(false)
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
              className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nom</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
              className={inputCls} />
          </div>
        </div>

        {/* Email avec bouton Modifier */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Email</label>
          {!editingEmail ? (
            <div className="flex gap-2">
              <input type="email" value={user.email} disabled
                className="flex-1 bg-vsonus-black border border-gray-800 text-gray-500 px-4 py-3 text-sm cursor-not-allowed" />
              <button
                type="button"
                onClick={() => { setEditingEmail(true); setNewEmail(''); setEmailMsg(''); setEmailMsgType('') }}
                className="flex items-center gap-1.5 px-4 py-3 border border-gray-700 text-gray-400 text-xs font-bold uppercase tracking-widest hover:border-vsonus-red hover:text-white transition-colors"
              >
                <Pencil size={14} />
                Modifier
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">
                Adresse actuelle : <span className="text-gray-300">{user.email}</span>
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Nouvelle adresse email"
                  autoFocus
                  className={`flex-1 ${inputCls}`}
                />
                <button
                  type="button"
                  onClick={() => { setEditingEmail(false); setNewEmail(''); setEmailMsg(''); setEmailMsgType('') }}
                  className="px-3 py-3 border border-gray-700 text-gray-500 hover:border-red-500 hover:text-red-400 transition-colors"
                  aria-label="Annuler"
                >
                  <X size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={handleEmailChange}
                disabled={emailLoading || !newEmail}
                className="bg-vsonus-red text-white font-bold uppercase tracking-widest px-6 py-2.5 text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {emailLoading ? 'Envoi...' : 'Envoyer la confirmation'}
              </button>
            </div>
          )}
          {emailMsg && (
            <p className={`text-sm mt-2 ${emailMsgType === 'error' ? 'text-red-500' : 'text-green-500'}`}>
              {emailMsg}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Téléphone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(formatSwissPhone(e.target.value))} placeholder="+41 79 XXX XX XX"
            className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Adresse</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Rue, NPA Ville"
            className={inputCls} />
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
          <PasswordInput value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required visible={showPw} onToggleVisible={() => setShowPw((v) => !v)} />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Nouveau mot de passe</label>
          <PasswordInput
            value={newPw}
            onChange={(e) => { setNewPw(e.target.value); setPwTouched(true) }}
            required
            minLength={8}
            visible={showPw}
            onToggleVisible={() => setShowPw((v) => !v)}
            error={pwTouched && pwTooShort ? 'Le mot de passe doit contenir au moins 8 caractères.' : undefined}
            success={pwTouched && newPw.length >= 8 && confirmPw.length > 0 && newPw === confirmPw}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Confirmer le nouveau mot de passe</label>
          <PasswordInput
            value={confirmPw}
            onChange={(e) => { setConfirmPw(e.target.value); setPwTouched(true) }}
            required
            minLength={8}
            visible={showPw}
            onToggleVisible={() => setShowPw((v) => !v)}
            error={pwTouched && pwMismatch ? 'Les mots de passe ne correspondent pas.' : undefined}
            success={pwTouched && confirmPw.length > 0 && newPw === confirmPw}
          />
        </div>

        {pwMsg && <p className={`text-sm ${pwMsg.includes('modifié') ? 'text-green-500' : 'text-red-500'}`}>{pwMsg}</p>}

        <button type="submit" disabled={!pwCanSubmit}
          className="border border-gray-700 text-white font-bold uppercase tracking-widest px-8 py-3 text-sm hover:border-vsonus-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {pwLoading ? 'Modification...' : 'Changer le mot de passe'}
        </button>
      </form>

      {/* Zone de danger — Suppression de compte */}
      <div className="mt-16 border-2 border-vsonus-red p-6 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-vsonus-red flex-shrink-0" />
          <h2 className="text-sm font-black uppercase tracking-widest text-vsonus-red">Zone de danger</h2>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">
          La suppression de votre compte est irréversible. Toutes vos données personnelles seront effacées conformément à la nLPD.
          L&apos;historique de vos réservations sera anonymisé (obligation comptable).
        </p>
        <button
          type="button"
          onClick={() => { setShowDeleteModal(true); setDeletePw(''); setDeleteMsg('') }}
          className="border border-vsonus-red text-vsonus-red font-bold uppercase tracking-widest px-6 py-2.5 text-xs hover:bg-vsonus-red hover:text-white transition-colors"
        >
          Supprimer mon compte
        </button>
      </div>

      {/* Modal de confirmation suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-vsonus-dark border border-gray-700 max-w-md w-full p-6 space-y-5" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-vsonus-red flex-shrink-0" aria-hidden="true" />
              <h3 id="delete-modal-title" className="text-lg font-black uppercase tracking-widest text-white">Confirmer la suppression</h3>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              Cette action est irréversible. Toutes vos données personnelles seront supprimées.
              Pour confirmer, saisissez votre mot de passe.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Mot de passe</label>
              <PasswordInput
                value={deletePw}
                onChange={(e) => setDeletePw(e.target.value)}
                placeholder="Saisissez votre mot de passe"
              />
            </div>

            {deleteMsg && <p className="text-sm text-red-500" aria-live="polite">{deleteMsg}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-gray-700 text-white font-bold uppercase tracking-widest px-4 py-3 text-xs hover:border-gray-500 transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={deleteLoading || !deletePw}
                onClick={async () => {
                  setDeleteLoading(true)
                  setDeleteMsg('')
                  const result = await deleteAccount(deletePw)
                  if (result.success) {
                    router.push('/?compte=supprime')
                  } else {
                    setDeleteMsg(result.error)
                    setDeleteLoading(false)
                  }
                }}
                className="flex-1 bg-vsonus-red text-white font-bold uppercase tracking-widest px-4 py-3 text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
