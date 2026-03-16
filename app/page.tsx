import Image from 'next/image'

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <Image
        src="/logo-vsonus.png"
        alt="V-Sonus"
        width={280}
        height={96}
        className="h-24 w-auto object-contain mb-4"
        priority
      />
      <p className="mt-4 text-lg text-gray-400 max-w-xl">
        Location de matériel événementiel professionnel en Suisse Romande.
      </p>
      <a
        href="/catalogue"
        className="mt-8 inline-block bg-vsonus-red text-white font-bold uppercase tracking-widest px-8 py-4 hover:shadow-glow-red-hover transition-shadow duration-200"
      >
        Voir le catalogue
      </a>
    </section>
  )
}
