// ---------------------------------------------------------------------------
// Helpers d'adresse — partagés entre profil utilisateur et checkout
// ---------------------------------------------------------------------------
//
// Le champ Directus `directus_users.location` est un text simple. On y stocke
// désormais une adresse structurée sous forme de JSON pour pouvoir la
// pré-remplir dans le checkout. Rétro-compatible : si le contenu n'est pas du
// JSON valide (cas des anciens utilisateurs avec une adresse en texte libre),
// on le traite comme la valeur du champ "rue".

export interface ParsedAddress {
  rue: string
  npa: string
  ville: string
  pays: string
}

export const EMPTY_ADDRESS: ParsedAddress = {
  rue: '',
  npa: '',
  ville: '',
  pays: 'Suisse',
}

/** Parse le champ location de Directus. Format JSON moderne ou string legacy. */
export function parseAddress(location: string | null | undefined): ParsedAddress {
  if (!location) return { ...EMPTY_ADDRESS }
  try {
    const parsed = JSON.parse(location)
    if (parsed && typeof parsed === 'object' && 'rue' in parsed) {
      return {
        rue: String(parsed.rue ?? ''),
        npa: String(parsed.npa ?? ''),
        ville: String(parsed.ville ?? ''),
        pays: String(parsed.pays ?? 'Suisse'),
      }
    }
  } catch {
    /* Pas du JSON — traité comme string legacy : on met dans le champ rue */
  }
  return { ...EMPTY_ADDRESS, rue: location }
}

/** Sérialise une adresse structurée en JSON pour stockage Directus. */
export function serializeAddress(address: ParsedAddress): string {
  return JSON.stringify(address)
}

/** Format texte humain (pour affichage liste, breadcrumbs, etc.). */
export function formatAddress(address: ParsedAddress): string {
  if (!address.rue) return ''
  return `${address.rue}, ${address.npa} ${address.ville}, ${address.pays}`.trim()
}
