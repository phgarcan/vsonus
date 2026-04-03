import { Volume2, Lightbulb, Disc3, MonitorPlay, Mic2, Landmark, LucideIcon } from 'lucide-react'

export interface Prestation {
  slug: string
  titre: string
  sousTitre: string
  intro: string
  descriptionComplete: string
  categorieSlug: string
  Icon: LucideIcon
  packsLabel: string
  image: string
  animation: 'wave' | 'glow-pulse' | 'spin-slow' | 'gradient-x' | null
}

// Contenu extrait de wp-content-export.json > custom_post_types.prestations
export const PRESTATIONS: Prestation[] = [
  {
    slug: 'sonorisation-l-acoustics',
    titre: 'Sonorisation L-Acoustics',
    sousTitre: 'Découvrez notre assortiment en sonorisation',
    intro: 'Sonorisation professionnelle pour vos événements',
    descriptionComplete:
      "Nous proposons des systèmes de sonorisation complets et personnalisés, adaptés à la taille et à la nature de votre événement. Que ce soit pour un événement privé, une conférence, un mariage ou une soirée d'entreprise, notre matériel de sonorisation L-Acoustics professionnel assure une diffusion sonore claire et homogène. L-Acoustics s'appuie sur une démarche scientifique pour révolutionner la conception sonore et anticiper les performances. Des études approfondies dans tous les domaines contribuent à une combinaison unique et étendue d'expertises qui façonnent le futur du son.",
    categorieSlug: 'sonorisation',
    Icon: Volume2,
    packsLabel: 'Packs Sonorisation',
    image: '/images/packs/photo_2024-12-04-13.01.55.jpeg',
    animation: 'wave',
  },
  {
    slug: 'eclairage',
    titre: 'Éclairage',
    sousTitre: 'Créez le scénario idéal',
    intro: 'Une ambiance unique pour votre événement',
    descriptionComplete:
      "Nous utilisons des équipements d'éclairage performants pour créer des ambiances adaptées à l'atmosphère de chaque événement. De l'éclairage discret aux effets lumineux pour la scène ou la piste de danse, chaque installation est pensée selon vos besoins et les spécificités du lieu.",
    categorieSlug: 'eclairage',
    Icon: Lightbulb,
    packsLabel: 'Packs Éclairage',
    image: '/images/packs/DSC01638.jpg',
    animation: 'glow-pulse',
  },
  {
    slug: 'dj',
    titre: 'DJ',
    sousTitre: 'Une animation musicale sur-mesure',
    intro: 'DJ et matériel professionnel pour vos événements',
    descriptionComplete:
      "Nous mettons à disposition des régies DJ professionnelles (platines, contrôleurs, tables de mixage) prêtes à l'emploi. Vous pouvez faire appel à votre propre DJ ou collaborer avec l'un des nôtres. Chaque installation est intégrée dans l'environnement de votre événement, qu'il soit privé ou corporate.",
    categorieSlug: 'dj',
    Icon: Disc3,
    packsLabel: 'Packs DJ',
    image: '/images/packs/image-7.jpeg',
    animation: 'spin-slow',
  },
  {
    slug: 'concerts',
    titre: 'Concerts',
    sousTitre: 'Du matériel fiable pour une performance optimale',
    intro: 'Sonorisation et équipements pour concerts live',
    descriptionComplete:
      "Nous fournissons des systèmes de sonorisation et d'éclairage adaptés aux concerts live, en intérieur comme en extérieur. Nos équipements couvrent les besoins des artistes solo, groupes et orchestres pour des jauges de 50 à 2000 personnes. La scène, les retours, les micros, la régie et les lumières sont installés et testés par nos techniciens pour assurer un déroulement fluide du concert.",
    categorieSlug: 'concerts',
    Icon: Mic2,
    packsLabel: 'Packs Concert',
    image: '/images/packs/compressed_DSC09742.jpg',
    animation: null,
  },
  {
    slug: 'scenes',
    titre: 'Scènes',
    sousTitre: 'Des structures solides, esthétiques et adaptables',
    intro: 'Location de scènes pour présentations, concerts ou installations DJ',
    descriptionComplete:
      "Nous proposons des scènes modulables, adaptées à tout type d'événement : discours, concerts, défilés ou installations techniques. Les structures sont conformes aux normes de sécurité, faciles à habiller (moquette, jupes, rampes, etc.), et disponibles en plusieurs hauteurs et dimensions. Montage, démontage et stabilisation sont inclus dans chaque prestation.",
    categorieSlug: 'scenes',
    Icon: Landmark,
    packsLabel: 'Pack Scène',
    image: '/images/packs/compressed_DSC09688.jpg',
    animation: null,
  },
  {
    slug: 'mapping',
    titre: 'Mapping',
    sousTitre: 'Mise en valeur de façades, objets ou scènes',
    intro: 'Création de contenu et diffusion synchronisée',
    descriptionComplete:
      "Nous réalisons des mappings vidéo sur mesure, de la conception du contenu à sa projection. Que ce soit pour animer une façade, une scène ou un objet, le mapping vidéo permet de créer des effets visuels immersifs et impactants. Nos prestations incluent la création, la modélisation et la diffusion des projections.",
    categorieSlug: 'mapping',
    Icon: MonitorPlay,
    packsLabel: 'Pack Mapping',
    image: '/images/packs/mapping.jpg',
    animation: 'gradient-x',
  },
]

export const SERVICES_COMMUNS = [
  {
    label: 'Livraison incluse',
    desc: "Pas besoin de vous déplacer : nous apportons et ramassons tout le matériel sur le lieu de votre événement, dans toute la Suisse et à l'heure convenue.",
  },
  {
    label: 'Installation professionnelle',
    desc: "Chaque système est installé et configuré par nos soins. Vous n'avez rien à gérer, tout fonctionne dès le début.",
  },
  {
    label: 'Assistance technique',
    desc: 'En cas de besoin, un technicien peut intervenir rapidement pour vous garantir une prestation sans souci.',
  },
]
