'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
  className?: string
  /** Contrôle externe de la visibilité (prioritaire sur l'état interne) */
  visible?: boolean
  /** Callback quand l'utilisateur clique sur l'icône œil */
  onToggleVisible?: () => void
  /** Message d'erreur affiché sous le champ */
  error?: string
  /** Bordure verte quand true */
  success?: boolean
}

export function PasswordInput({
  value,
  onChange,
  placeholder = '••••••••',
  required,
  minLength,
  autoComplete,
  className,
  visible: externalVisible,
  onToggleVisible,
  error,
  success,
}: PasswordInputProps) {
  const [internalVisible, setInternalVisible] = useState(false)

  const isVisible = externalVisible ?? internalVisible
  const handleToggle = onToggleVisible ?? (() => setInternalVisible((v) => !v))

  const borderCls = error
    ? 'border-2 border-red-500 focus:border-red-500'
    : success
      ? 'border-2 border-green-500 focus:border-green-500'
      : 'border border-gray-700 focus:border-vsonus-red'

  return (
    <div>
      <div className="relative">
        <input
          type={isVisible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete ?? 'off'}
          className={className ?? `w-full bg-vsonus-dark text-white px-4 py-3 text-sm pr-11 transition-colors outline-none focus:outline-none focus:ring-0 ${borderCls}`}
        />
        <button
          type="button"
          onClick={handleToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
          aria-label={isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          tabIndex={-1}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1.5">{error}</p>
      )}
    </div>
  )
}
