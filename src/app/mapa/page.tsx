import { getCentrosAcopio } from '@/lib/data'
import { extractCoordenadas } from '@/lib/coordenadas'
import MapaClient from './MapaClient'
import type { CentroConCoordenadas } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mapa de centros — donaciones.ve',
}

export const revalidate = 15

function isShortUrl(url: string | null): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return hostname.includes('goo.gl') || hostname.includes('share.google')
  } catch {
    return false
  }
}

async function resolveUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 4000)
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
    })
    clearTimeout(timer)
    return res.url || url
  } catch {
    return url
  }
}

export default async function MapaPage() {
  const centros = await getCentrosAcopio()

  const centrosConCoordenadas: CentroConCoordenadas[] = (
    await Promise.all(
      centros.map(async (c) => {
        let url = c.ubicacion_url
        if (isShortUrl(url)) {
          url = await resolveUrl(url!)
        }
        const coords = extractCoordenadas(url)
        if (!coords) return null
        return { ...c, lat: coords.lat, lng: coords.lng }
      })
    )
  ).filter((c): c is CentroConCoordenadas => c !== null)

  return (
    <main>
      <MapaClient centros={centrosConCoordenadas} />
    </main>
  )
}
