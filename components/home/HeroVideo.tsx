'use client'

import { useEffect, useRef, useState } from 'react'

interface HeroVideoProps {
  videoUrl?: string | null
  posterUrl?: string | null
}

export function HeroVideo({ videoUrl, posterUrl }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoReady, setVideoReady] = useState(false)
  const [videoFailed, setVideoFailed] = useState(false)

  // Parallax
  useEffect(() => {
    const onScroll = () => {
      if (videoRef.current) {
        videoRef.current.style.transform = `translateY(${window.scrollY * 0.3}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fallback : si la vidéo ne charge pas en 15s, afficher le poster
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!videoReady) setVideoFailed(true)
    }, 15000)
    return () => clearTimeout(timer)
  }, [videoReady])

  // Boucle custom : démarre à 3s et reboucle 3s avant la fin
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 3
    }
  }

  const handleCanPlay = () => {
    setVideoReady(true)
    setVideoFailed(false)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= videoRef.current.duration - 3) {
      videoRef.current.currentTime = 3
    }
  }

  // Fallback : vidéo locale si aucune vidéo Directus configurée
  const src = videoUrl ?? '/videos/hero-bg.mp4'
  const fallbackPoster = posterUrl ?? undefined

  return (
    <>
      {/* Image poster en fallback (visible tant que la vidéo n'est pas prête) */}
      {fallbackPoster && (!videoReady || videoFailed) && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center scale-110 origin-top"
          style={{ backgroundImage: `url(${fallbackPoster})` }}
          aria-hidden
        />
      )}

      {/* Vidéo (masquée si fallback actif après timeout) */}
      {!videoFailed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          poster={fallbackPoster}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={handleCanPlay}
          onTimeUpdate={handleTimeUpdate}
          className={[
            'absolute inset-0 w-full h-full object-cover scale-110 origin-top transition-opacity duration-700',
            videoReady ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </>
  )
}
