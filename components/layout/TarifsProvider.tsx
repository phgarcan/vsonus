'use client'

import { useEffect } from 'react'
import { useStore } from '@/lib/store'
import type { TarifAnnexe } from '@/lib/directus'

export function TarifsProvider({ tarifs }: { tarifs: TarifAnnexe[] }) {
  const setTarifsAnnexes = useStore((s) => s.setTarifsAnnexes)
  useEffect(() => {
    if (tarifs.length > 0) setTarifsAnnexes(tarifs)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
