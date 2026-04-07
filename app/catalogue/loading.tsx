/** Skeleton affiché pendant le chargement des pages catalogue.
 *  Force Next.js à commiter la navigation immédiatement (Suspense boundary)
 *  au lieu de garder l'ancien contenu visible pendant le startTransition. */
export default function CatalogueLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
      <div className="h-10 w-56 bg-vsonus-dark mb-2" />
      <div className="h-5 w-80 bg-vsonus-dark/60 mb-8" />

      {/* Skeleton filtres */}
      <div className="flex gap-2 mb-10 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 w-28 bg-vsonus-dark flex-shrink-0" />
        ))}
      </div>

      {/* Skeleton grille produits */}
      <div className="h-6 w-48 bg-vsonus-dark mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-vsonus-dark border border-gray-800">
            <div className="w-full h-48 bg-gray-800" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-gray-800" />
              <div className="h-3 w-1/2 bg-gray-800" />
              <div className="h-6 w-24 bg-gray-800 mt-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
