'use client'

import { useState, useRef, useEffect } from 'react'

interface DatePickerProps {
  value: string | null        // YYYY-MM-DD
  onChange: (date: string) => void
  min?: string                // YYYY-MM-DD — dates avant désactivées
  label: string
}

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS = ['Lu','Ma','Me','Je','Ve','Sa','Di']

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function formatDisplay(s: string | null): string {
  if (!s) return '–'
  const d = parseDate(s)
  return `${d.getDate()} ${MOIS[d.getMonth()]} ${d.getFullYear()}`
}

export function DatePicker({ value, onChange, min, label }: DatePickerProps) {
  const today = formatDate(new Date())
  const effective_min = min ?? today

  // Calendrier ouvert/fermé
  const [open, setOpen] = useState(false)

  // Mois affiché dans le calendrier
  const initialDate = value ? parseDate(value) : parseDate(effective_min)
  const [viewYear, setViewYear]   = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())

  const containerRef = useRef<HTMLDivElement>(null)

  // Ferme si clic extérieur
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Synchronise la vue quand la valeur change depuis l'extérieur
  useEffect(() => {
    if (value) {
      const d = parseDate(value)
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  function handleDayClick(dateStr: string) {
    onChange(dateStr)
    setOpen(false)
  }

  // Calcule les cases de la grille (lundi en premier)
  function buildGrid(): (string | null)[] {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    // 0=dim → on veut 0=lun : (day + 6) % 7
    const startOffset = (firstDay.getDay() + 6) % 7
    const cells: (string | null)[] = Array(startOffset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(formatDate(new Date(viewYear, viewMonth, d)))
    }
    // Compléter jusqu'à multiple de 7
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }

  const grid = buildGrid()
  const minDate = parseDate(effective_min)

  return (
    <div ref={containerRef} className="relative">
      {/* Bouton déclencheur */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 border text-sm transition-colors ${
          open
            ? 'border-vsonus-red bg-vsonus-black text-white'
            : 'border-gray-700 bg-vsonus-black text-white hover:border-gray-500'
        }`}
      >
        <span className="text-xs text-gray-500 uppercase tracking-wider mr-2">{label}</span>
        <span className={value ? 'text-white font-semibold' : 'text-gray-600'}>
          {formatDisplay(value)}
        </span>
        <svg
          className={`w-3 h-3 ml-2 text-gray-500 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="square" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Calendrier déroulant */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-[60] mt-1 bg-vsonus-dark border border-gray-700 shadow-xl">
          {/* Navigation mois */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Mois précédent"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              {MOIS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              aria-label="Mois suivant"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="square" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Grille */}
          <div className="p-2">
            {/* En-têtes jours */}
            <div className="grid grid-cols-7 mb-1">
              {JOURS.map(j => (
                <div key={j} className="text-center text-xs text-gray-600 font-bold py-1">{j}</div>
              ))}
            </div>

            {/* Cases jours */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {grid.map((dateStr, i) => {
                if (!dateStr) return <div key={i} />

                const d = parseDate(dateStr)
                const isSelected = dateStr === value
                const isToday    = dateStr === today
                const isDisabled = d < minDate

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDayClick(dateStr)}
                    className={`
                      w-full aspect-square flex items-center justify-center text-xs font-medium transition-colors
                      ${isSelected
                        ? 'bg-vsonus-red text-white font-bold'
                        : isDisabled
                          ? 'text-gray-700 cursor-not-allowed'
                          : isToday
                            ? 'text-vsonus-red hover:bg-gray-800'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    {d.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
