// ---------------------------------------------------------------------------
// Règles de tarification V-Sonus
// ---------------------------------------------------------------------------

/**
 * Coefficients dégressifs par durée de location.
 * Le prix catalogue est le prix pour 1 jour.
 * null = "Sur demande" (6 jours et plus)
 */
export const LOCATION_COEFFICIENTS: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 2.5,
  5: 3,
}

/**
 * Retourne le coefficient multiplicateur pour une durée donnée.
 * Retourne null si 6 jours ou plus → tarif sur demande.
 */
export function getLocationCoefficient(nbJours: number): number | null {
  if (nbJours >= 6) return null
  return LOCATION_COEFFICIENTS[nbJours] ?? 1
}

/**
 * Libellé court du coefficient : "×1", "×1.5", "×2", etc.
 */
export function getCoefficientLabel(nbJours: number): string {
  const coeff = getLocationCoefficient(nbJours)
  if (coeff === null) return 'Sur demande'
  const str = coeff % 1 === 0 ? coeff.toString() : coeff.toString()
  return `×${str}`
}

// Valeurs de fallback si Directus n'est pas disponible
export const FALLBACK_TRANSPORT_PRIX = 200
export const FALLBACK_MONTAGE_PRIX = 400
