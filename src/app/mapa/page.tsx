import { getCentrosAcopio } from '@/lib/data'
import { extractCoordenadas } from '@/lib/coordenadas'
import MapaClient from './MapaClient'
import type { CentroConCoordenadas } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mapa de centros — donaciones.ve',
}

export const revalidate = 15

export default async function MapaPage() {
  const centros = await getCentrosAcopio()

  const centrosConCoordenadas: CentroConCoordenadas[] = centros
    .map(c => {
      const coords = extractCoordenadas(c.ubicacion_url)
      if (!coords) return null
      return { ...c, lat: coords.lat, lng: coords.lng }
    })
    .filter((c): c is CentroConCoordenadas => c !== null)

  return (
    <main>
      <MapaClient centros={centrosConCoordenadas} />
    </main>
  )
}
