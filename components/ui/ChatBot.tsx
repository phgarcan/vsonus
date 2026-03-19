'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MessageCircle, X, Send, User } from 'lucide-react'
import { useChatStore } from '@/lib/store'
import type { ChatMessage } from '@/lib/store'

function MaxAvatar({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/images/max-avatar.png"
      alt="Max"
      className="flex-shrink-0 rounded-full object-cover ring-2 ring-vsonus-red shadow-lg shadow-vsonus-red/20"
      style={{ width: size, height: size }}
    />
  )
}

const MAX_MESSAGES = 20
const WELCOME_MESSAGE =
  "Salut ! Moi c'est Max, l'assistant V-Sonus. Comment puis-je t'aider ? Tu organises un événement ?"

type Message = ChatMessage

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  // Split on links [text](url) or bold **text**
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    if (match[1] && match[2]) {
      // Link
      const href = match[2]
      const isInternal = href.startsWith('/')
      parts.push(
        <a
          key={match.index}
          href={href}
          {...(isInternal ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          className="text-vsonus-red underline hover:text-white transition-colors"
        >
          {match[1]}
        </a>
      )
    } else if (match[3]) {
      // Bold
      parts.push(<strong key={match.index} className="font-bold text-white">{match[3]}</strong>)
    }
    last = match.index + match[0].length
  }

  if (last < text.length) {
    parts.push(text.slice(last))
  }

  return parts
}

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
  { message: string; suggestions: string[]; notification?: string }
> = {
  sonorisation: {
    message:
      'Vous cherchez une sonorisation ? Nos systèmes L-Acoustics couvrent de 50 à 2000 personnes. Quel est votre événement ?',
    suggestions: ['Pack Sono pour mariage', 'Pack Sono pour festival', 'Voir les prix sono'],
    notification: 'Tu cherches une sono ? Je peux t\'aider !',
  },
  eclairage: {
    message:
      "Besoin d'éclairage pour votre événement ? Nos packs Light vont de 120 à 780 CHF. Quelle est la taille de votre salle ?",
    suggestions: ['Pack Light pour soirée', 'Éclairage mariage', 'Voir les prix éclairage'],
    notification: 'Besoin d\'éclairage ? Je suis là !',
  },
  scenes: {
    message:
      "Vous cherchez une scène ? Notre Pack Scène 6x6 est idéal pour les festivals et concerts. Dites-m'en plus !",
    suggestions: ['Pack Scène 6x6', 'Structure Line Array', 'Scène + sono'],
    notification: 'Tu cherches une scène ? Je peux t\'aider !',
  },
  dj: {
    message:
      'Vous avez besoin de matériel DJ ? Nos packs incluent platines Pioneer et table de mixage. Pour combien de personnes ?',
    suggestions: ['DJ Pack mariage', 'DJ Pack festival', 'Voir les prix DJ'],
    notification: 'Besoin de matos DJ ? On a tout !',
  },
  concerts: {
    message:
      'Vous organisez un concert ? Nos packs concert incluent sono, retours et micros. Quelle est la capacité du lieu ?',
    suggestions: ['Pack Concert M', 'Pack Concert L', 'Concert en plein air'],
    notification: 'Tu organises un concert ? Je peux t\'aider !',
  },
  mapping: {
    message:
      'Vous cherchez du mapping vidéo ? Notre Pack Mapping à 300 CHF est parfait pour des projections événementielles. Dites-moi votre projet !',
    suggestions: ['Pack Mapping 300 CHF', 'Mapping + sono', 'Contacter V-Sonus'],
    notification: 'Intéressé par le mapping vidéo ? Parlons-en !',
  },
  evenement_prive: {
    message:
      'Vous organisez un événement privé ? Mariage, anniversaire… je peux vous recommander le pack idéal selon vos besoins.',
    suggestions: ['Pack mariage', 'Anniversaire 100 pers.', 'Soirée privée'],
    notification: 'Tu organises un événement ? Je peux t\'aider !',
  },
  evenement_entreprise: {
    message:
      'Vous planifiez un événement corporate ? Séminaire, team-building… nos packs sont adaptés à tous les formats pro.',
    suggestions: ['Séminaire 200 pers.', 'Soirée entreprise', 'Demander un devis'],
    notification: 'Un événement d\'entreprise ? On s\'en occupe !',
  },
  festival: {
    message:
      "Vous organisez un festival ? On a les scènes, la sono L-Acoustics et l'éclairage qu'il vous faut !",
    suggestions: ['Pack Festival sono', 'Scène + sono + light', 'Contacter V-Sonus'],
    notification: 'Tu organises un festival ? Parlons-en !',
  },
  general: {
    message:
      'Bienvenue chez V-Sonus ! Je peux vous aider à trouver le matériel idéal pour votre événement. Que cherchez-vous ?',
    suggestions: ['Je cherche un pack sono', 'Combien pour un mariage ?', 'Comment ça marche ?'],
  },
}

// Build contextual messages from utm_term keywords
function buildUtmMessage(term: string, category: QueryCategory): string {
  const lower = term.toLowerCase().replace(/\+/g, ' ')
  const config = CATEGORY_CONFIG[category]

  // Detect event type
  const isMariage = lower.includes('mariage')
  const isAnniversaire = lower.includes('anniversaire')
  const isFestival = lower.includes('festival')
  const isConcert = lower.includes('concert')

  // Detect canton/region
  const cantons: Record<string, string> = {
    vaud: 'le canton de Vaud',
    geneve: 'le canton de Genève', genève: 'le canton de Genève',
    valais: 'le Valais',
    fribourg: 'le canton de Fribourg',
    neuchatel: 'le canton de Neuchâtel', neuchâtel: 'le canton de Neuchâtel',
    lausanne: 'la région de Lausanne',
    montreux: 'la région de Montreux',
  }
  let region = ''
  for (const [key, label] of Object.entries(cantons)) {
    if (lower.includes(key)) { region = label; break }
  }

  const regionPart = region ? ` dans ${region}` : ''

  if (isMariage && category === 'sonorisation') {
    return `Salut ! Tu cherches une sonorisation pour un mariage${regionPart} ? J'ai exactement ce qu'il te faut. Quel est le nombre d'invités prévu ?`
  }
  if (isMariage) {
    return `Salut ! Tu prépares un mariage${regionPart} ? Je peux te recommander le pack idéal. Combien d'invités prévois-tu ?`
  }
  if (isFestival) {
    return `Salut ! Tu organises un festival${regionPart} ? On a les scènes, la sono L-Acoustics et l'éclairage qu'il te faut !`
  }
  if (isConcert) {
    return `Salut ! Tu organises un concert${regionPart} ? Nos packs concert incluent sono, retours et micros. Dis-m'en plus !`
  }
  if (isAnniversaire) {
    return `Salut ! Tu prépares un anniversaire${regionPart} ? Je peux te recommander le pack idéal selon le nombre d'invités.`
  }

  return config.message
}

function buildUtmSuggestions(term: string, category: QueryCategory): string[] {
  const lower = term.toLowerCase().replace(/\+/g, ' ')
  const isMariage = lower.includes('mariage')

  if (isMariage && category === 'sonorisation') {
    return ['Pack Sono pour mariage', 'Prix pour 100-200 personnes', 'Voir les packs sono']
  }
  if (isMariage) {
    return ['Pack mariage', 'Prix pour 100-200 personnes', 'Voir les packs']
  }

  return CATEGORY_CONFIG[category].suggestions
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

// ── Disclaimer ────────────────────────────────────────────────────────────────

function Disclaimer() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="px-3 py-1.5 border-t border-gray-800 bg-black">
      {expanded ? (
        <p className="text-[10px] text-gray-500 leading-relaxed">
          Max est un assistant automatisé propulsé par l&apos;IA. Ses réponses sont indicatives et ne constituent pas un engagement contractuel. Les conversations sont stockées uniquement dans votre navigateur (sessionStorage) et ne sont ni enregistrées ni transmises à des tiers. Pour toute demande officielle, utilisez notre{' '}
          <a href="/contact" className="underline hover:text-gray-300">formulaire de contact</a>.{' '}
          <button onClick={() => setExpanded(false)} className="underline hover:text-gray-300">Réduire</button>
        </p>
      ) : (
        <p className="text-[10px] text-gray-500 text-center">
          Max est un assistant IA. Il peut faire des erreurs.{' '}
          <button onClick={() => setExpanded(true)} className="underline hover:text-gray-300">En savoir plus</button>
        </p>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChatBot() {
  const { chatMessages, chatOpen, messageCount, addChatMessage, setChatOpen, setMessageCount, clearChat } = useChatStore()
  const open = chatOpen
  const messages = chatMessages
  const [cookieBannerVisible, setCookieBannerVisible] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const [isWriting, setIsWriting] = useState(false)
  const [openCount, setOpenCount] = useState(0) // triggers fade-in on reopen
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [notification, setNotification] = useState<string | null>(null)
  const [showPulse, setShowPulse] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initRef = useRef(false)

  // Détection bannière cookies pour ajuster la position du bouton
  useEffect(() => {
    const hasCookie = document.cookie.includes('vsonus_cookies_ok=1')
    setCookieBannerVisible(!hasCookie)
    const handler = () => setCookieBannerVisible(false)
    window.addEventListener('cookieAccepted', handler)
    return () => window.removeEventListener('cookieAccepted', handler)
  }, [])

  // Init : welcome message + Google provenance (runs once)
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const source = detectGoogleSource()
    const alreadyShown = sessionStorage.getItem('vsonus_chat_notif_shown')

    // If conversation already has messages, restore suggestions but don't re-add welcome
    if (chatMessages.length > 0) {
      // Restore contextual suggestions if from Google Ads
      if (source?.type === 'ads_with_term') {
        setSuggestions(buildUtmSuggestions(source.term, source.category))
      }
      return
    }

    // Empty conversation — set welcome message
    if (source?.type === 'ads_with_term') {
      const contextualMessage = buildUtmMessage(source.term, source.category)
      addChatMessage({ role: 'assistant', content: contextualMessage })
      setSuggestions(buildUtmSuggestions(source.term, source.category))
    } else if (source?.type === 'ads_no_term' || source?.type === 'organic') {
      addChatMessage({ role: 'assistant', content: "Hey ! Moi c'est Max 👋 Besoin d'un coup de main ?" })
    } else {
      addChatMessage({ role: 'assistant', content: WELCOME_MESSAGE })
    }

    // Show notification bubble after 5s (only once per session)
    if (!alreadyShown) {
      const notifMessage = source?.type === 'ads_with_term'
        ? (CATEGORY_CONFIG[source.category].notification ?? "Hey ! Moi c'est Max 👋 Besoin d'un coup de main ?")
        : "Hey ! Moi c'est Max 👋 Besoin d'un coup de main ?"

      const timer = setTimeout(() => {
        setNotification(notifMessage)
        sessionStorage.setItem('vsonus_chat_notif_shown', '1')
        setTimeout(() => setNotification(null), 10000)
      }, 5000)

      return () => clearTimeout(timer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Stop pulse + increment openCount for fade-in effect
  useEffect(() => {
    if (open) {
      setShowPulse(false)
      setOpenCount((c) => c + 1)
    }
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

    if (messageCount >= MAX_MESSAGES) {
      addChatMessage({
        role: 'assistant',
        content: 'Tu as atteint la limite de messages. Pour continuer, contacte-nous directement au +41 79 651 21 14',
      })
      return
    }

    const userMsg: Message = { role: 'user', content: trimmed }
    const newMessages: Message[] = [...messages, userMsg]
    addChatMessage(userMsg)
    setInput('')
    setShowSuggestions(false)
    setLoading(true)
    setMessageCount(messageCount + 1)

    // Délai humain : Max "lit" le message avant d'écrire
    const delay = 500 + Math.random() * 300
    typingTimerRef.current = setTimeout(() => {
      setIsWriting(true)
      setShowTyping(true)
    }, delay)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (data.reply === null) return // duplicate message — silently ignore
      const reply = data.reply ?? "Désolé, une erreur s'est produite. Réessayez ou contacte-nous directement."
      addChatMessage({ role: 'assistant', content: reply })
    } catch {
      addChatMessage({ role: 'assistant', content: "Erreur de connexion. Contacte-nous au +41 79 651 21 14" })
    } finally {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      setLoading(false)
      setShowTyping(false)
      setIsWriting(false)
    }
  }

  function handleSuggestion(s: string) {
    sendMessage(s)
  }

  function handleNotificationClick() {
    setNotification(null)
    setChatOpen(true)
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
          onClick={() => setChatOpen(true)}
          className={`fixed right-6 z-50 w-14 h-14 rounded-full bg-vsonus-red text-white flex items-center justify-center shadow-glow-red hover:shadow-glow-red-hover transition-all duration-200 hover:scale-105 ${showPulse ? 'animate-pulse-once' : ''} ${cookieBannerVisible ? 'bottom-40 sm:bottom-4' : 'bottom-6'}`}
          aria-label="Ouvrir le chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col w-80 h-[500px] max-sm:inset-4 max-sm:w-auto max-sm:h-auto bg-black border border-gray-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 bg-vsonus-red">
            <div className="flex items-center gap-2.5">
              <MaxAvatar size={40} />
              <div className="flex flex-col leading-none gap-0.5">
                <span className="font-semibold text-sm">Max</span>
                <div key={openCount} className="flex items-center gap-1.5 animate-fade-in-up">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isWriting ? 'bg-green-400' : 'bg-green-400 animate-pulse'}`} />
                  <span className={`text-xs transition-colors duration-300 ${isWriting ? 'text-white' : 'text-green-200'}`}>
                    {isWriting ? 'écrit...' : 'En ligne'}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label="Fermer" className="hover:opacity-80 transition-opacity">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && <MaxAvatar size={36} />}
                <div
                  className={`max-w-[78%] text-sm px-3 py-2 leading-snug whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-vsonus-red/20 border border-vsonus-red/30 text-white'
                      : 'bg-vsonus-dark text-gray-100'
                  }`}
                >
                  {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
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
            {showTyping && (
              <div className="flex items-end gap-2 justify-start">
                <MaxAvatar size={36} />
                <div className="bg-vsonus-dark px-3 py-2 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Disclaimer */}
          <Disclaimer />

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
