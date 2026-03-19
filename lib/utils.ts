/**
 * Formate un numéro de téléphone suisse ou français au fur et à mesure de la saisie.
 *
 * - "0791234567"   → "+41 79 123 45 67"
 * - "+41791234567" → "+41 79 123 45 67"
 * - "+33612345678" → "+33 6 12 34 56 78"
 *
 * Accepte les préfixes +41 (Suisse) et +33 (France).
 */
export function formatSwissPhone(value: string): string {
  // Ne garder que les chiffres et le +
  let digits = value.replace(/[^\d+]/g, '')

  // Si commence par 0 → remplacer par +41
  if (digits.startsWith('0041')) {
    digits = '+41' + digits.slice(4)
  } else if (digits.startsWith('0')) {
    digits = '+41' + digits.slice(1)
  }

  // Extraire seulement les chiffres après le +
  if (digits.startsWith('+41')) {
    const nums = digits.slice(3).replace(/\D/g, '')
    // Format : +41 XX XXX XX XX
    let result = '+41'
    if (nums.length > 0) result += ' ' + nums.slice(0, 2)
    if (nums.length > 2) result += ' ' + nums.slice(2, 5)
    if (nums.length > 5) result += ' ' + nums.slice(5, 7)
    if (nums.length > 7) result += ' ' + nums.slice(7, 9)
    return result
  }

  if (digits.startsWith('+33')) {
    const nums = digits.slice(3).replace(/\D/g, '')
    // Format : +33 X XX XX XX XX
    let result = '+33'
    if (nums.length > 0) result += ' ' + nums.slice(0, 1)
    if (nums.length > 1) result += ' ' + nums.slice(1, 3)
    if (nums.length > 3) result += ' ' + nums.slice(3, 5)
    if (nums.length > 5) result += ' ' + nums.slice(5, 7)
    if (nums.length > 7) result += ' ' + nums.slice(7, 9)
    return result
  }

  // Si commence par + mais pas 41 ni 33, laisser tel quel
  if (digits.startsWith('+')) return digits

  return value
}
