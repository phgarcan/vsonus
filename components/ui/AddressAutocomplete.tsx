'use client'

import { useEffect, useRef } from 'react'
import Script from 'next/script'

export interface PlaceComponents {
  rue: string
  npa: string
  ville: string
  pays: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelect: (components: PlaceComponents) => void
  /** Pays autorisés pour l'autocomplétion (défaut: Suisse uniquement) */
  countries?: string[]
}

export function AddressAutocomplete({ value, onChange, onPlaceSelect, countries = ['ch'] }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  // Stable ref to callback to avoid stale closures
  const onPlaceSelectRef = useRef(onPlaceSelect)
  onPlaceSelectRef.current = onPlaceSelect

  function initAutocomplete() {
    if (!inputRef.current || typeof google === 'undefined') return
    if (autocompleteRef.current) return // already initialized

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: countries },
      fields: ['address_components'],
    })

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current!.getPlace()
      if (!place.address_components) return

      let streetNumber = ''
      let route = ''
      let npa = ''
      let ville = ''
      let pays = 'Suisse'

      for (const component of place.address_components) {
        const type = component.types[0]
        switch (type) {
          case 'street_number': streetNumber = component.long_name; break
          case 'route':         route = component.long_name; break
          case 'postal_code':   npa = component.long_name; break
          case 'locality':      ville = component.long_name; break
          case 'country':       pays = component.short_name === 'FR' ? 'France' : 'Suisse'; break
        }
      }

      // Format CH/FR : rue + numéro (ex: "Rue des Bosquets 17")
      const rue = route ? `${route}${streetNumber ? ' ' + streetNumber : ''}` : ''
      onPlaceSelectRef.current({ rue, npa, ville, pays })
    })
  }

  // Fallback : si Google Maps est déjà chargé au moment du montage (script cached)
  useEffect(() => {
    if (typeof google !== 'undefined') {
      initAutocomplete()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

  return (
    <>
      {apiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
          strategy="afterInteractive"
          onLoad={initAutocomplete}
        />
      )}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        placeholder="Rue des Bosquets 17"
        required
        className="w-full bg-vsonus-dark border border-gray-700 text-white px-4 py-3 text-sm focus:outline-none focus:border-vsonus-red transition-colors placeholder-gray-600"
      />
    </>
  )
}
