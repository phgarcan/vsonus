'use client'

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
      className={className}
    >
      Gérer mes cookies
    </button>
  )
}
