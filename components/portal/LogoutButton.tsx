'use client'

import { logout } from '@/lib/auth'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-vsonus-red border border-gray-700 hover:border-vsonus-red px-4 py-2 transition-colors"
      >
        Déconnexion
      </button>
    </form>
  )
}
