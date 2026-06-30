'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { haversineDistancia } from '@/lib/distancia'
import type { CentroConCoordenadas, DonationConCoordenadas, RefugioConCoordenadas } from '@/lib/types'

const MapaLeaflet = dynamic(() => import('./MapaLeaflet'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-zinc-100 text-zinc-500 text-sm">
      Cargando mapa…
    </div>
  ),
})

type CentroConDistancia = CentroConCoordenadas & { distancia?: number }

function getStatusColor(estatus: string | undefined): string {
  switch (estatus) {
    case 'activo': return '#22c55e'
    case 'saturado': return '#c2410c'
    default: return '#6b7280'
  }
}

type FilterMode = 'todos' | 'centros' | 'donaciones' | 'refugios'

interface MapaClientProps {
  centros: CentroConCoordenadas[]
  donaciones: DonationConCoordenadas[]
  refugios: RefugioConCoordenadas[]
}

export default function MapaClient({ centros, donaciones, refugios }: MapaClientProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<FilterMode>('todos')

  function handleEnableLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocationError(null)
        setSheetOpen(true)
      },
      () => setLocationError('No se pudo obtener tu ubicación. Verifica los permisos.'),
    )
  }

  function handleSelectCentro(id: string) {
    setActiveId(id)
    setSheetOpen(false)
  }

  const centrosOrdenados = useMemo<CentroConDistancia[]>(() => {
    const withDist: CentroConDistancia[] = centros.map((c) => ({
      ...c,
      distancia: userLocation
        ? haversineDistancia(userLocation.lat, userLocation.lng, c.lat, c.lng)
        : undefined,
    }))
    const filtered =
      selectedRadius != null
        ? withDist.filter((c) => c.distancia != null && c.distancia <= selectedRadius)
        : withDist

    const textFiltered = searchQuery.trim()
      ? filtered.filter((c) => {
          const q = searchQuery.toLowerCase()
          return (
            c.nombre.toLowerCase().includes(q) ||
            (c.municipios?.nombre || '').toLowerCase().includes(q) ||
            (c.direccion || '').toLowerCase().includes(q)
          )
        })
      : filtered

    return userLocation
      ? [...textFiltered].sort((a, b) => (a.distancia ?? Infinity) - (b.distancia ?? Infinity))
      : [...textFiltered].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  }, [centros, userLocation, selectedRadius, searchQuery])

  const donacionesFiltradas = useMemo(() => {
    if (!searchQuery.trim()) return donaciones
    const q = searchQuery.toLowerCase()
    return donaciones.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.country ?? '').toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q),
    )
  }, [donaciones, searchQuery])

  const refugiosFiltrados = useMemo(() => {
    if (!searchQuery.trim()) return refugios
    const q = searchQuery.toLowerCase()
    return refugios.filter((r) =>
      [r.nombre, r.direccion, r.referencia_lugar, r.municipio, r.zona, r.necesidades]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [refugios, searchQuery])

  const centrosVisibles = filterMode === 'donaciones' || filterMode === 'refugios' ? [] : centrosOrdenados
  const donacionesVisibles = filterMode === 'centros' || filterMode === 'refugios' ? [] : donacionesFiltradas
  const refugiosVisibles = filterMode === 'centros' || filterMode === 'donaciones' ? [] : refugiosFiltrados

  const totalVisibles = centrosVisibles.length + donacionesVisibles.length + refugiosVisibles.length

  // Shared list items — same rendering on both mobile sheet and desktop sidebar
  const centroItems = centrosVisibles.map((centro) => {
    const isActive = activeId === centro.id
    const color = getStatusColor(centro.estatus)
    const municipio = centro.municipios?.nombre ?? ''
    return (
      <li key={centro.id}>
        <button
          onClick={() => handleSelectCentro(centro.id)}
          className={`w-full text-left px-4 py-3 border-b border-zinc-100 transition-colors ${
            isActive ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-zinc-50 active:bg-zinc-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
              <div className="min-w-0">
                <p className="font-semibold text-sm text-zinc-900 truncate">{centro.nombre}</p>
                {municipio && (
                  <p className="text-xs text-zinc-500 truncate">{municipio}</p>
                )}
              </div>
            </div>
            {centro.distancia != null && (
              <span className="flex-shrink-0 text-xs font-semibold text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">
                {centro.distancia.toFixed(1)} km
              </span>
            )}
          </div>
        </button>
      </li>
    )
  })

  const donacionItems = donacionesVisibles.map((don) => (
    <li key={don.id}>
      <a
        href={don.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-100 hover:bg-amber-50 active:bg-amber-100 transition-colors"
      >
        <span className="flex-shrink-0 text-base leading-none">💵</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-zinc-900 truncate">{don.title}</p>
          {don.country && (
            <p className="text-xs font-semibold truncate" style={{ color: '#16a34a' }}>
              {don.country}
            </p>
          )}
        </div>
        <span className="flex-shrink-0 text-xs font-bold text-white bg-green-700 rounded-full px-2 py-0.5">
          Donar
        </span>
      </a>
    </li>
  ))

  const refugioItems = refugiosVisibles.map((refugio) => (
    <li key={refugio.id}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-100">
        <span className="flex-shrink-0 text-base leading-none">🏠</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-zinc-900 truncate">{refugio.nombre}</p>
          {(refugio.zona || refugio.municipio) && (
            <p className="text-xs font-semibold truncate" style={{ color: '#7c3aed' }}>
              {refugio.zona ?? refugio.municipio}
            </p>
          )}
        </div>
        {refugio.confirmado && (
          <span className="flex-shrink-0 text-xs font-bold text-white bg-purple-600 rounded-full px-2 py-0.5">
            Confirmado
          </span>
        )}
      </div>
    </li>
  ))

  const listItems = [...centroItems, ...donacionItems, ...refugioItems]

  const emptyState = (
    <p className="text-center text-zinc-400 text-sm py-10">
      No hay resultados.
    </p>
  )

  return (
    <div
      className="relative md:flex md:flex-row overflow-hidden"
      style={{ height: '100dvh' }}
    >
      {/* Map: absolute fullscreen on mobile, flex-1 on desktop */}
      <div className="absolute inset-0 z-[500] md:relative md:inset-auto md:flex-1">
        <MapaLeaflet
          centros={centrosVisibles}
          donaciones={donacionesVisibles}
          refugios={refugiosVisibles}
          userLocation={userLocation}
          activeId={activeId}
          onSelectCentro={handleSelectCentro}
        />
      </div>

      {/* ── MOBILE ONLY ─────────────────────────────────────────── */}

      {/* Floating header: back button + counter */}
      <div className="md:hidden absolute top-3 left-3 z-[1001] flex items-center gap-2">
        <Link
          href="/"
          className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-zinc-900 font-bold text-sm px-3 py-2 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          ← Inicio
        </Link>
        <span className="bg-white/90 backdrop-blur-sm text-zinc-700 text-xs font-semibold px-2.5 py-2 rounded-full shadow-lg">
          {totalVisibles} en mapa
        </span>
      </div>

      {/* FAB: geolocation — only when location not enabled AND sheet is collapsed */}
      {!userLocation && !sheetOpen && (
        <div className="md:hidden absolute z-[1001] flex flex-col items-center gap-2"
             style={{ bottom: 'calc(96px + 20px)', left: '50%', transform: 'translateX(-50%)' }}>
          <button
            onClick={handleEnableLocation}
            className="flex items-center gap-2 bg-blue-700 text-white font-bold text-sm px-5 py-3.5 rounded-full shadow-xl active:scale-95 transition-transform whitespace-nowrap"
          >
            <span>📍</span> Ver centros cerca de mí
          </button>
          {locationError && (
            <p className="bg-white text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl shadow text-center max-w-[280px] leading-snug">
              {locationError}
            </p>
          )}
        </div>
      )}

      {/* Bottom sheet */}
      <div
        className="md:hidden absolute left-0 right-0 bottom-0 z-[600] bg-white rounded-t-2xl shadow-2xl flex flex-col transition-transform duration-300 ease-out"
        style={{
          height: '65dvh',
          transform: sheetOpen ? 'translateY(0)' : 'translateY(calc(100% - 96px))',
        }}
      >
        {/* Handle row — tap toggles the sheet */}
        <button
          onClick={() => setSheetOpen((v) => !v)}
          className="flex-shrink-0 w-full px-4 pt-3 pb-3 text-left focus:outline-none"
          aria-label={sheetOpen ? 'Colapsar lista de centros' : 'Expandir lista de centros'}
        >
          <div className="mx-auto mb-2.5 w-10 h-1 bg-zinc-300 rounded-full" />
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-zinc-900 text-base">Mapa de Ayuda</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 bg-zinc-100 rounded-full px-2.5 py-0.5 font-semibold">
                {totalVisibles} mostrados
              </span>
              <span className="text-zinc-400 text-xs select-none">
                {sheetOpen ? '▼' : '▲'}
              </span>
            </div>
          </div>
          {/* Legend — always visible in peek */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <span className="text-sm leading-none">📦</span>
              Centro acopio
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <span className="text-sm leading-none">💵</span>
              Donación
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
              <span className="text-sm leading-none">🏠</span>
              Refugio
            </span>
          </div>
        </button>

        {/* Filter controls — only when sheet is expanded */}
        {sheetOpen && (
        <div className="flex-shrink-0 px-4 pb-3 border-b border-zinc-100 flex flex-col gap-3">
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg">
            {(['todos', 'centros', 'donaciones', 'refugios'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors capitalize ${
                  filterMode === mode
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {mode === 'todos' ? 'Todos' : mode === 'centros' ? '📦 Centros' : mode === 'donaciones' ? '💵 Dinero' : '🏠 Refugios'}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Buscar centro, municipio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {userLocation ? (
            <div className="flex items-center gap-2">
              <label htmlFor="radius-mobile" className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                Distancia:
              </label>
              <select
                id="radius-mobile"
                value={selectedRadius ?? ''}
                onChange={(e) =>
                  setSelectedRadius(e.target.value === '' ? null : Number(e.target.value))
                }
                className="flex-1 px-3 py-1.5 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
              </select>
            </div>
          ) : (
            <button
              onClick={handleEnableLocation}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl font-bold text-sm active:scale-[0.98] transition-transform"
            >
              📍 Habilitar mi ubicación
            </button>
          )}
          {locationError && (
            <p className="mt-1.5 text-red-600 text-xs font-medium">{locationError}</p>
          )}
        </div>
        )}

        {/* List */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {listItems.length === 0 ? emptyState : <ul>{listItems}</ul>}
        </div>
        {/* Legal attribution (replaces Leaflet control) */}
        <p className="flex-shrink-0 py-1.5 text-center text-[9px] text-zinc-300">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400">OpenStreetMap</a>{' '}· <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400">CARTO</a>
        </p>
      </div>

      {/* ── DESKTOP ONLY ────────────────────────────────────────── */}
      <div className="hidden md:flex flex-col w-80 lg:w-96 border-l border-zinc-200 bg-white z-[500]">
        {/* Header */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-200">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/"
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1"
            >
              ← Inicio
            </Link>
            <span className="text-xs text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full font-semibold">
              {totalVisibles} mostrados
            </span>
          </div>
          <h2 className="font-bold text-zinc-900">Mapa de Ayuda</h2>
        </div>

        {/* Filter controls */}
        <div className="flex-shrink-0 px-4 py-3 border-b border-zinc-200 flex flex-col gap-3">
          <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg">
            {(['todos', 'centros', 'donaciones', 'refugios'] as FilterMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  filterMode === mode
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {mode === 'todos' ? 'Todos' : mode === 'centros' ? '📦 Centros' : mode === 'donaciones' ? '💵 Dinero' : '🏠 Refugios'}
              </button>
            ))}
          </div>
          <input
            type="search"
            placeholder="Buscar centro, municipio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {!userLocation ? (
            <div className="space-y-2">
              <button
                onClick={handleEnableLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-colors text-sm font-bold"
              >
                📍 Ver centros cerca de mí
              </button>
              {locationError && (
                <p className="text-red-600 text-xs font-medium">{locationError}</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <label htmlFor="radius-desktop" className="text-xs text-zinc-500 font-medium">
                Filtrar por distancia
              </label>
              <select
                id="radius-desktop"
                value={selectedRadius ?? ''}
                onChange={(e) =>
                  setSelectedRadius(e.target.value === '' ? null : Number(e.target.value))
                }
                className="w-full px-3 py-1.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {listItems.length === 0 ? emptyState : <ul>{listItems}</ul>}
        </div>
        <p className="flex-shrink-0 py-1.5 text-center text-[9px] text-zinc-300 border-t border-zinc-100">
          © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400">OpenStreetMap</a>{' '}· <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400">CARTO</a>
        </p>
      </div>
    </div>
  )
}
