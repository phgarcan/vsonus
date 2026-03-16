import {
  Zap, Music, Lightbulb, Truck, Wrench, Star, Shield, Clock,
  Headphones, Speaker, Video, Camera, MapPin, Phone, Mail, Users,
  Package, CheckCircle, Award, Globe,
} from 'lucide-react'

// Mapping nom d'icône → composant Lucide
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap, music: Music, lightbulb: Lightbulb, truck: Truck,
  wrench: Wrench, star: Star, shield: Shield, clock: Clock,
  headphones: Headphones, speaker: Speaker, video: Video, camera: Camera,
  'map-pin': MapPin, phone: Phone, mail: Mail, users: Users,
  package: Package, check: CheckCircle, award: Award, globe: Globe,
}

export interface FeatureItem {
  icone?: string
  titre: string
  description?: string
}

export interface FeaturesGridBlockData {
  titre_section?: string
  sous_titre_section?: string
  features: FeatureItem[]
  colonnes?: 2 | 3 | 4
}

export function FeaturesGridBlock({ data }: { data: FeaturesGridBlockData }) {
  const cols = data.colonnes ?? 3
  const gridClass: Record<number, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <section className="py-16">
      {(data.titre_section || data.sous_titre_section) && (
        <div className="text-center mb-12">
          {data.titre_section && (
            <h2 className="text-3xl font-black uppercase tracking-widest text-white mb-3">
              {data.titre_section}
            </h2>
          )}
          {data.sous_titre_section && (
            <p className="text-gray-400 max-w-2xl mx-auto">{data.sous_titre_section}</p>
          )}
          <div className="mx-auto mt-4 h-0.5 w-16 bg-vsonus-red" />
        </div>
      )}

      <div className={`grid grid-cols-1 ${gridClass[cols] ?? gridClass[3]} gap-6`}>
        {data.features.map((f, i) => {
          const Icon = f.icone ? ICON_MAP[f.icone] : null
          return (
            <div
              key={i}
              className="bg-vsonus-dark border border-gray-800 hover:border-vsonus-red transition-colors duration-200 p-6 flex flex-col gap-3"
            >
              {Icon && (
                <div className="w-10 h-10 bg-vsonus-black border border-vsonus-red flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-vsonus-red" />
                </div>
              )}
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                {f.titre}
              </h3>
              {f.description && (
                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
