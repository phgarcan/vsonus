'use client'

import { useEffect, useRef } from 'react'

interface HeroVideoProps {
  videoUrl?: string | null
  posterUrl?: string | null
}

export function HeroVideo({ videoUrl, posterUrl }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const onScroll = () => {
      if (videoRef.current) {
        videoRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Boucle custom : démarre à 3s et reboucle 3s avant la fin
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 3
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= videoRef.current.duration - 3) {
      videoRef.current.currentTime = 3
    }
  }

  // Fallback : vidéo locale si aucune vidéo Directus configurée
  const src = videoUrl ?? '/videos/hero-bg.mp4'

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      poster={posterUrl ?? undefined}
      onLoadedMetadata={handleLoadedMetadata}
      onTimeUpdate={handleTimeUpdate}
      className="absolute inset-0 w-full h-full object-cover scale-110 origin-top"
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
