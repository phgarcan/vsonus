'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, User } from 'lucide-react'

function MaxAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex-shrink-0 bg-vsonus-red flex items-center justify-center font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.45 }}
    >
      V
    </div>
  )
}

const MAX_MESSAGES = 20
const WELCOME_MESSAGE =
  "Salut ! Moi c'est Max, l'assistant V-Sonus. Comment puis-je t'aider ? Tu organises un événement ?"

type Message = { role: 'user' | 'assistant'; content: string }

// ── Query analysis ────────────────────────────────────────────────────────────

type QueryCategory =
  | 'sonorisation'
  | 'eclairage'
  | 'scenes'
  | 'dj'
  | 'concerts'
  | 'mapping'
  | 'evenement_prive'
  | 'evenement_entreprise'
  | 'festival'
  | 'general'

const CATEGORY_MAP: { keywords: string[]; category: QueryCategory }[] = [
  { keywords: ['sono', 'sonorisation', 'son', 'audio', 'enceinte', 'l-acoustics', 'acoustics'], category: 'sonorisation' },
  { keywords: ['lumière', 'lumiere', 'éclairage', 'eclairage', 'light', 'led', 'lyre'], category: 'eclairage' },
  { keywords: ['scène', 'scene', 'structure', 'podium'], category: 'scenes' },
  { keywords: ['dj', 'platine', 'pioneer', 'mixage'], category: 'dj' },
  { keywords: ['concert', 'live', 'micro', 'instrument'], category: 'concerts' },
  { keywords: ['mapping', 'projection', 'vidéo', 'video'], category: 'mapping' },
  { keywords: ['mariage', 'anniversaire', 'privé', 'prive'], category: 'evenement_prive' },
  { keywords: ['entreprise', 'corporate', 'séminaire', 'seminaire'], category: 'evenement_entreprise' },
  { keywords: ['festival'], category: 'festival' },
  { keywords: ['location', 'louer', 'prix', 'tarif', 'devis'], category: 'general' },
]

function analyzeQuery(term: string): QueryCategory {
  const lower = term.toLowerCase()
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some((k) => lower.includes(k))) return category
  }
  return 'general'
}

const CATEGORY_CONFIG: Record<
  QueryCategory,
  { message: string; suggestions: string[] }
> = {
  sonorisation: {
    message:
      'Vous cherchez une sonorisation ? Nos systèmes L-Acoustics couvrent de 50 à 2000 personnes. Quel est votre événement ?',
    suggestions: ['Pack Sono pour mariage', 'Pack Sono pour festival', 'Voir les prix sono'],
  },
  eclairage: {
    message:
      "Besoin d'éclairage pour votre événement ? Nos packs Light vont de 120 à 780 CHF. Quelle est la taille de votre salle ?",
    suggestions: ['Pack Light pour soirée', 'Éclairage mariage', 'Voir les prix éclairage'],
  },
  scenes: {
    message:
      "Vous cherchez une scène ? Notre Pack Scène 6x6 est idéal pour les festivals et concerts. Dites-m'en plus !",
    suggestions: ['Pack Scène 6x6', 'Structure Line Array', 'Scène + sono'],
  },
  dj: {
    message:
      'Vous avez besoin de matériel DJ ? Nos packs incluent platines Pioneer et table de mixage. Pour combien de personnes ?',
    suggestions: ['DJ Pack mariage', 'DJ Pack festival', 'Voir les prix DJ'],
  },
  concerts: {
    message:
      'Vous organisez un concert ? Nos packs concert incluent sono, retours et micros. Quelle est la capacité du lieu ?',
    suggestions: ['Pack Concert M', 'Pack Concert L', 'Concert en plein air'],
  },
  mapping: {
    message:
      'Vous cherchez du mapping vidéo ? Notre Pack Mapping à 300 CHF est parfait pour des projections événementielles. Dites-moi votre projet !',
    suggestions: ['Pack Mapping 300 CHF', 'Mapping + sono', 'Contacter V-Sonus'],
  },
  evenement_prive: {
    message:
      'Vous organisez un événement privé ? Mariage, anniversaire… je peux vous recommander le pack idéal selon vos besoins.',
    suggestions: ['Pack mariage', 'Anniversaire 100 pers.', 'Soirée privée'],
  },
  evenement_entreprise: {
    message:
      'Vous planifiez un événement corporate ? Séminaire, team-building… nos packs sont adaptés à tous les formats pro.',
    suggestions: ['Séminaire 200 pers.', 'Soirée entreprise', 'Demander un devis'],
  },
  festival: {
    message:
      "Vous organisez un festival ? On a les scènes, la sono L-Acoustics et l'éclairage qu'il vous faut !",
    suggestions: ['Pack Festival sono', 'Scène + sono + light', 'Contacter V-Sonus'],
  },
  general: {
    message:
      'Bienvenue chez V-Sonus ! Je peux vous aider à trouver le matériel idéal pour votre événement. Que cherchez-vous ?',
    suggestions: ['Je cherche un pack sono', 'Combien pour un mariage ?', 'Comment ça marche ?'],
  },
}

const DEFAULT_SUGGESTIONS = [
  'Pack sono 🔊',
  'Prix pour un mariage',
  'Comment ça marche ?',
  'Parler à l\'équipe',
]

// ── Google provenance detection ───────────────────────────────────────────────

type GoogleSource =
  | { type: 'ads_with_term'; term: string; category: QueryCategory }
  | { type: 'ads_no_term' }
  | { type: 'organic' }
  | null

function detectGoogleSource(): GoogleSource {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const utmTerm = params.get('utm_term')
  const gclid = params.get('gclid')
  const isGoogle =
    gclid ||
    document.referrer.includes('google.') ||
    params.get('utm_source')?.toLowerCase().includes('google')

  if (!isGoogle) return null
  if (utmTerm) return { type: 'ads_with_term', term: utmTerm, category: analyzeQuery(utmTerm) }
  if (gclid) return { type: 'ads_no_term' }
  return { type: 'organic' }
}

function buildProactiveMessage(source: GoogleSource): string {
  if (!source) return WELCOME_MESSAGE
  if (source.type === 'ads_with_term') {
    const cat = CATEGORY_CONFIG[source.category]
    return cat.message
  }
  if (source.type === 'ads_no_term') return "Hey ! Moi c'est Max 👋 Besoin d'un coup de main ?"
  return "Hey ! Moi c'est Max 👋 Besoin d'un coup de main ?"
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME_MESSAGE },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [notification, setNotification] = useState<string | null>(null)
  const [showPulse, setShowPulse] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messageCount = useRef(0)

  // Google provenance detection + proactive message
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('vsonus_chat_notif_shown')
    if (alreadyShown) return

    const source = detectGoogleSource()
    if (!source) return

    const proactiveMsg = buildProactiveMessage(source)

    // Update welcome message and suggestions based on source
    if (source.type === 'ads_with_term') {
      const config = CATEGORY_CONFIG[source.category]
      setMessages([{ role: 'assistant', content: proactiveMsg }])
      setSuggestions(config.suggestions)
    } else {
      setMessages([{ role: 'assistant', content: proactiveMsg }])
    }

    // Show notification bubble after 5s
    const timer = setTimeout(() => {
      setNotification("Hey ! Moi c'est Max 👋 Besoin d'un coup de main ?")
      sessionStorage.setItem('vsonus_chat_notif_shown', '1')

      // Auto-hide after 10s
      setTimeout(() => setNotification(null), 10000)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  // Stop pulse after first interaction
  useEffect(() => {
    if (open) setShowPulse(false)
  }, [open])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input on open
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  async function sendMessage(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    if (messageCount.current >= MAX_MESSAGES) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Vous avez atteint la limite de messages. Pour continuer, contactez-nous directement au +41 79 651 21 14',
        },
      ])
      return
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(newMessages)
    setInput('')
    setShowSuggestions(false)
    setLoading(true)
    messageCount.current += 1

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      const reply = data.reply ?? "Désolé, une erreur s'est produite. Réessayez ou contactez-nous directement."
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Erreur de connexion. Contactez-nous au +41 79 651 21 14" },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSuggestion(s: string) {
    sendMessage(s)
  }

  function handleNotificationClick() {
    setNotification(null)
    setOpen(true)
  }

  return (
    <>
      {/* Notification bubble */}
      {notification && !open && (
        <div
          className="fixed bottom-24 right-6 z-50 max-w-[240px] animate-slide-in-right cursor-pointer"
          onClick={handleNotificationClick}
        >
          <div className="relative bg-vsonus-dark border border-vsonus-red p-3 shadow-glow-red">
            {/* Arrow pointing down */}
            <div className="absolute -bottom-2 right-6 w-3 h-3 bg-vsonus-dark border-r border-b border-vsonus-red rotate-45" />
            <button
              className="absolute top-1 right-1 text-gray-400 hover:text-white p-0.5"
              onClick={(e) => { e.stopPropagation(); setNotification(null) }}
              aria-label="Fermer"
            >
              <X size={12} />
            </button>
            <p className="text-xs text-white pr-4 leading-snug">{notification}</p>
          </div>
        </div>
      )}

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`fixed bottom-6 right-6 z-50 w-14 h-14 bg-vsonus-red text-white flex items-center justify-center shadow-glow-red hover:shadow-glow-red-hover transition-all duration-200 hover:scale-105 ${showPulse ? 'animate-pulse-once' : ''}`}
          aria-label="Ouvrir le chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-80 h-[500px] max-sm:inset-4 max-sm:w-auto max-sm:h-auto bg-black border border-gray-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-vsonus-red">
            <div className="flex items-center gap-2.5">
              <MaxAvatar size={30} />
              <div className="flex flex-col leading-none">
                <span className="font-semibold text-sm">Max</span>
                <span className="text-xs text-red-200">Assistant V-Sonus</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="hover:opacity-80 transition-opacity">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <MaxAvatar size={24} />}
                <div
                  className={`max-w-[78%] text-sm px-3 py-2 leading-snug whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-vsonus-red/20 border border-vsonus-red/30 text-white'
                      : 'bg-vsonus-dark text-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-6 h-6 bg-gray-700 flex items-center justify-center">
                    <User size={12} className="text-gray-400" />
                  </div>
                )}
              </div>
            ))}

            {/* Quick suggestions */}
            {showSuggestions && messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="text-xs px-3 py-1.5 border border-gray-700 text-gray-300 hover:border-vsonus-red hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2 justify-start">
                <MaxAvatar size={24} />
                <div className="bg-vsonus-dark px-3 py-2 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            className="flex border-t border-gray-800"
            onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              placeholder="Votre message…"
              className="flex-1 bg-vsonus-dark text-white text-sm px-3 py-3 outline-none placeholder-gray-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 py-3 bg-vsonus-red text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
              aria-label="Envoyer"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
