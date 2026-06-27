'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { haversineDistancia } from '@/lib/distancia'
import type { CentroConCoordenadas } from '@/lib/types'

const MapaLeaflet = dynamic(() => import('./MapaLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500">
      Cargando mapa...
    </div>
  ),
})

type CentroConDistancia = CentroConCoordenadas & { distancia?: number }

function getStatusColor(estatus: string | undefined): string {
  switch (estatus) {
    case 'activo':
      return '#22c55e'
    case 'saturado':
      return '#c2410c'
    default:
      return '#6b7280'
  }
}

interface MapaClientProps {
  centros: CentroConCoordenadas[]
}

export default function MapaClient({ centros }: MapaClientProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  function handleEnableLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationError(null)
      },
      () => {
        setLocationError('No se pudo obtener tu ubicación. Verifica los permisos.')
      },
    )
  }

  const centrosOrdenados = useMemo<CentroConDistancia[]>(() => {
    const centrosConDistancia: CentroConDistancia[] = centros.map((c) => ({
      ...c,
      distancia: userLocation
        ? haversineDistancia(userLocation.lat, userLocation.lng, c.lat, c.lng)
        : undefined,
    }))

    const centrosFiltrados =
      selectedRadius != null
        ? centrosConDistancia.filter(
            (c) => c.distancia != null && c.distancia <= selectedRadius,
          )
        : centrosConDistancia

    return userLocation
      ? [...centrosFiltrados].sort(
          (a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity),
        )
      : [...centrosFiltrados].sort((a, b) =>
          a.nombre.localeCompare(b.nombre, 'es'),
        )
  }, [centros, userLocation, selectedRadius])

  return (
    <div
      className="flex flex-col md:flex-row"
      style={{ height: 'calc(100vh - 4rem)' }}
    >
      {/* Map area */}
      <div className="flex-1 min-h-[300px] md:min-h-0">
        <MapaLeaflet
          centros={centrosOrdenados}
          userLocation={userLocation}
          activeId={activeId}
          onSelectCentro={setActiveId}
        />
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex flex-col border-t md:border-t-0 md:border-l border-gray-200 overflow-hidden bg-white">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Centros de Acopio</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {centrosOrdenados.length} mostrados
            </span>
          </div>
        </div>

        {/* Location / Filter controls */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200">
          {!userLocation ? (
            <div className="space-y-2">
              <button
                onClick={handleEnableLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                📍 Habilitar mi ubicación
              </button>
              {locationError && (
                <p className="text-red-600 text-xs">{locationError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="radio-filter" className="text-xs text-gray-500 font-medium">
                Filtrar por distancia
              </label>
              <select
                id="radio-filter"
                value={selectedRadius ?? ''}
                onChange={(e) =>
                  setSelectedRadius(e.target.value === '' ? null : Number(e.target.value))
                }
                className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
              </select>
            </div>
          )}
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto flex-1">
          {centrosOrdenados.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              No hay centros en este radio.
            </p>
          ) : (
            <ul>
              {centrosOrdenados.map((centro) => {
                const isActive = activeId === centro.id
                const color = getStatusColor(centro.estatus)
                const municipioNombre = centro.municipios?.nombre
                const estadoNombre = centro.municipios?.estado?.nombre

                return (
                  <li key={centro.id}>
                    <button
                      onClick={() => setActiveId(centro.id)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <span
                            className="mt-1 flex-shrink-0 w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">
                              {centro.nombre}
                            </p>
                            {(municipioNombre || estadoNombre) && (
                              <p className="text-xs text-gray-500 truncate">
                                {[municipioNombre, estadoNombre]
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                        {centro.distancia != null && (
                          <span className="flex-shrink-0 text-xs text-gray-500 mt-0.5">
                            {centro.distancia.toFixed(1)} km
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
