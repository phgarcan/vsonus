export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-gray-800 border-t-vsonus-red rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Chargement…</p>
      </div>
    </div>
  )
}
