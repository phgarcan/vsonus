'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

type Status = 'idle' | 'sending' | 'success' | 'error'

const SUBJECTS = [
  'Demande de devis – Sonorisation',
  'Demande de devis – Éclairage',
  'Demande de devis – Scène / Structure',
  'Demande de devis – Pack complet',
  'Question technique',
  'Autre',
]

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: '',
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')

    // Envoi via formsubmit.co (aucun backend requis) ou adapter selon le serveur
    try {
      const res = await fetch('https://formsubmit.co/ajax/info@vsonus.ch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `[V-Sonus] ${form.sujet || 'Nouveau message'}`,
          _replyto: form.email,
          _template: 'table',
          ...form,
        }),
      })
      if (res.ok) {
        setStatus('success')
        setForm({ nom: '', email: '', telephone: '', sujet: '', message: '' })
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-green-800 bg-green-900/20 p-8 text-center">
        <div className="text-4xl mb-4">✓</div>
        <h3 className="text-lg font-black uppercase tracking-widest text-white mb-2">Message envoyé !</h3>
        <p className="text-gray-400 text-sm">Nous vous répondrons dans les meilleurs délais.</p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm text-vsonus-red hover:underline"
        >
          Envoyer un autre message
        </button>
      </div>
    )
  }

  const inputClass = 'w-full bg-vsonus-black border border-gray-700 text-white text-sm px-4 py-3 focus:outline-none focus:border-vsonus-red transition-colors placeholder-gray-600'
  const labelClass = 'block text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5'

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
            placeholder="+41 00 000 00 00"
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
        <p className="text-red-500 text-sm border border-red-800 bg-red-900/20 px-4 py-3">
          Une erreur s'est produite. Veuillez réessayer ou nous contacter directement par email.
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Envoi en cours…' : 'Envoyer le message →'}
      </Button>

      <p className="text-xs text-gray-700 text-center">
        Nous répondons généralement sous 24h ouvrées.
      </p>
    </form>
  )
}
