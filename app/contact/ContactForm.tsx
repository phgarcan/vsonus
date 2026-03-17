'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { envoyerMessage } from '@/app/actions/contact'
import { PrivacyModal } from '@/components/ui/PrivacyModal'

type Status = 'idle' | 'sending' | 'success' | 'error'

const SUBJECT_DEVIS = 'Demande de devis – Tarif personnalisé'

const SUBJECTS = [
  SUBJECT_DEVIS,
  'Question',
  'Autre',
]

const inputClass =
  'w-full bg-vsonus-black border border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-vsonus-red transition-colors placeholder-gray-600'
const labelClass = 'block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5'

export function ContactForm() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: searchParams.get('sujet') === 'devis' ? SUBJECT_DEVIS : '',
    message: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    const result = await envoyerMessage(form)

    if (result.success) {
      setStatus('success')
      setForm({ nom: '', email: '', telephone: '', sujet: '', message: '' })
    } else {
      setStatus('error')
      setErrorMsg(result.error)
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-gray-700 bg-vsonus-dark p-10 text-center">
        <div className="w-12 h-12 border-2 border-vsonus-red flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 text-vsonus-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">
          Message envoyé !
        </h3>
        <p className="text-gray-400 text-sm">Nous vous répondrons dans les meilleurs délais.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-xs font-bold uppercase tracking-widest text-vsonus-red hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nom" className={labelClass}>Nom *</label>
          <input
            id="nom"
            type="text"
            required
            value={form.nom}
            onChange={(e) => set('nom', e.target.value)}
            placeholder="Jean Dupont"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="telephone" className={labelClass}>Téléphone</label>
          <input
            id="telephone"
            type="tel"
            value={form.telephone}
            onChange={(e) => set('telephone', e.target.value)}
            placeholder="+41 79 000 00 00"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email *</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="vous@exemple.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="sujet" className={labelClass}>Sujet</label>
        <select
          id="sujet"
          value={form.sujet}
          onChange={(e) => set('sujet', e.target.value)}
          className={`${inputClass} cursor-pointer`}
        >
          <option value="">Choisir un sujet…</option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>Message *</label>
        <textarea
          id="message"
          required
          rows={6}
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder="Décrivez votre événement : type, date, lieu, nombre de personnes…"
          className={`${inputClass} resize-none`}
        />
      </div>

      {status === 'error' && (
        <p className="text-red-400 text-xs border border-red-900 bg-red-900/10 px-4 py-3">
          {errorMsg || 'Une erreur est survenue.'}{' '}
          <a
            href="mailto:info@vsonus.ch"
            className="underline hover:text-red-300"
          >
            Contactez-nous directement
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full bg-vsonus-red text-white font-bold uppercase tracking-widest py-4 hover:shadow-glow-red-hover transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Envoi en cours…' : 'Envoyer →'}
      </button>

      <p className="text-xs text-gray-700 leading-relaxed">
        En envoyant ce message, je confirme avoir lu et accepté la{' '}
        <button
          type="button"
          onClick={() => setPrivacyOpen(true)}
          className="text-gray-500 hover:text-vsonus-red transition-colors underline"
        >
          politique de confidentialité
        </button>
        .
      </p>

      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
    </form>
  )
}
