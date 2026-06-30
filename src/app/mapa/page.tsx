import { getCentrosAcopio, getRefugios } from '@/lib/data'
import { extractCoordenadas, COUNTRY_CENTROIDS } from '@/lib/coordenadas'
import { getActiveDonationLinks } from '@/app/admin/donations/actions'
import MapaClient from './MapaClient'
import type { CentroConCoordenadas, DonationConCoordenadas, RefugioConCoordenadas } from '@/lib/types'
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
  const [centros, donationLinks, refugios] = await Promise.all([
    getCentrosAcopio(),
    getActiveDonationLinks(),
    getRefugios(),
  ])

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

  // Track how many donations land on each country centroid so we can offset
  const countryCount: Record<string, number> = {}
  const donacionesConCoordenadas: DonationConCoordenadas[] = donationLinks
    .filter((d) => d.country && COUNTRY_CENTROIDS[d.country.toUpperCase()])
    .map((d) => {
      const code = d.country!.toUpperCase()
      const base = COUNTRY_CENTROIDS[code]
      const idx = countryCount[code] ?? 0
      countryCount[code] = idx + 1
      // Spiral offset: each additional pin shifts slightly so they don't stack
      const angle = (idx * 137.5 * Math.PI) / 180
      const radius = idx === 0 ? 0 : 0.6 + idx * 0.3
      return {
        ...d,
        lat: base.lat + radius * Math.sin(angle),
        lng: base.lng + radius * Math.cos(angle),
      }
    })

  const refugiosConCoordenadas: RefugioConCoordenadas[] = (
    await Promise.all(
      refugios.map(async (r) => {
        let url = r.google_maps_url
        if (isShortUrl(url)) {
          url = await resolveUrl(url!)
        }
        const coords = extractCoordenadas(url)
        if (!coords) return null
        return { ...r, lat: coords.lat, lng: coords.lng }
      })
    )
  ).filter((r): r is RefugioConCoordenadas => r !== null)

  return (
    <main>
      <MapaClient
        centros={centrosConCoordenadas}
        donaciones={donacionesConCoordenadas}
        refugios={refugiosConCoordenadas}
      />
    </main>
  )
}
