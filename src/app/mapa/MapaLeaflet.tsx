'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import type { CentroConCoordenadas, DonationConCoordenadas, RefugioConCoordenadas } from '@/lib/types';

// Workaround para el bug de iconos Leaflet con webpack/Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

interface MapaLeafletProps {
  centros: (CentroConCoordenadas & { distancia?: number })[];
  donaciones: DonationConCoordenadas[];
  refugios: RefugioConCoordenadas[];
  userLocation: { lat: number; lng: number } | null;
  activeId: string | null;
  onSelectCentro: (id: string) => void;
}

function getMarkerColor(estatus: string | undefined): string {
  switch (estatus) {
    case 'activo': return '#22c55e';
    case 'saturado': return '#c2410c';
    default: return '#6b7280';
  }
}

function getStatusLabel(estatus: string | undefined): string {
  switch (estatus) {
    case 'activo': return 'Activo';
    case 'saturado': return 'Saturado';
    default: return 'Sin verificar';
  }
}

/**
 * CSS bubble pin: circle + triangle pointer + emoji.
 * Pure HTML/CSS — no SVG layering, renders at native device resolution.
 */
function makeBubblePin(color: string, emoji: string, active = false): string {
  const ring = active
    ? `box-shadow:0 0 0 3px ${color}55,0 3px 12px rgba(0,0,0,0.32);`
    : `box-shadow:0 2px 10px rgba(0,0,0,0.28);`
  // Two stacked triangles fake a white border on the pointer
  const pointer = `
    <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);
      width:0;height:0;
      border-left:10px solid transparent;border-right:10px solid transparent;
      border-top:12px solid white;"></div>
    <div style="position:absolute;bottom:2px;left:50%;transform:translateX(-50%);
      width:0;height:0;
      border-left:8px solid transparent;border-right:8px solid transparent;
      border-top:10px solid ${color};"></div>`
  return `<div style="position:relative;width:44px;height:56px">
    <div style="
      width:44px;height:44px;
      background:${color};
      border:3px solid white;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:22px;line-height:1;
      ${ring}
    ">${emoji}</div>
    ${pointer}
  </div>`
}

const CENTRO_COLOR = '#1d4ed8'
const DONATION_COLOR = '#16a34a'
const REFUGIO_COLOR = '#7c3aed'

function createCentroIcon(active = false): L.DivIcon {
  return L.divIcon({
    className: '',
    html: makeBubblePin(CENTRO_COLOR, '📦', active),
    iconSize: [44, 56],
    iconAnchor: [22, 56],
    popupAnchor: [0, -58],
  })
}

const donationIcon = L.divIcon({
  className: '',
  html: makeBubblePin(DONATION_COLOR, '💵'),
  iconSize: [44, 56],
  iconAnchor: [22, 56],
  popupAnchor: [0, -58],
})

const refugioIcon = L.divIcon({
  className: '',
  html: makeBubblePin(REFUGIO_COLOR, '🏠'),
  iconSize: [44, 56],
  iconAnchor: [22, 56],
  popupAnchor: [0, -58],
})

const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:36px;height:36px">
    <div class="user-marker-pulse"></div>
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 10px rgba(59,130,246,0.5)"></div>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

interface MapControllerProps {
  centros: CentroConCoordenadas[];
  userLocation: { lat: number; lng: number } | null;
  activeId: string | null;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
}

function MapController({ centros, userLocation, activeId, markerRefs }: MapControllerProps) {
  const map = useMap();

  // Move zoom control to top-right so it doesn't overlap the back button
  useEffect(() => {
    const zoom = L.control.zoom({ position: 'topright' });
    zoom.addTo(map);
    return () => { zoom.remove(); };
  }, [map]);

  useEffect(() => {
    if (activeId === null) return;
    const centro = centros.find((c) => c.id === activeId);
    if (centro) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        const zoom = map.getZoom();
        const h = map.getSize().y;
        const pt = map.project([centro.lat, centro.lng], zoom);
        pt.y += h * 0.25;
        map.panTo(map.unproject(pt, zoom));
      } else {
        map.panTo([centro.lat, centro.lng]);
      }
      const marker = markerRefs.current.get(activeId);
      if (marker) marker.openPopup();
    }
  }, [activeId, centros, map, markerRefs]);

  useEffect(() => {
    if (userLocation === null) return;
    const zoom = 13;
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // ponytail: offset center south so user marker appears above the bottom sheet
      const h = map.getSize().y;
      const pt = map.project([userLocation.lat, userLocation.lng], zoom);
      pt.y += h * 0.25;
      map.flyTo(map.unproject(pt, zoom), zoom);
    } else {
      map.flyTo([userLocation.lat, userLocation.lng], zoom);
    }
  }, [userLocation, map]);

  return null;
}

export default function MapaLeaflet({
  centros,
  donaciones,
  refugios,
  userLocation,
  activeId,
  onSelectCentro,
}: MapaLeafletProps) {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  // ponytail: delay MapContainer render to avoid "container reused" error in strict mode / HMR
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
    return () => { setReady(false); };
  }, []);

  if (!ready) return <div style={{ height: '100%', width: '100%' }} />;

  return (
      <MapContainer
      center={[8, -66]}
      zoom={6}
      zoomControl={false}
      attributionControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <MapController
        centros={centros}
        userLocation={userLocation}
        activeId={activeId}
        markerRefs={markerRefs}
      />

      {donaciones.map((don) => (
        <Marker
          key={don.id}
          position={[don.lat, don.lng]}
          icon={donationIcon}
          zIndexOffset={500}
        >
          <Popup>
            <div style={{ minWidth: 200, fontFamily: 'system-ui, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>💵</span>
                <div>
                  <strong style={{ fontSize: 14, lineHeight: 1.3, display: 'block' }}>
                    {don.title}
                  </strong>
                  {don.country && (
                    <span style={{ fontSize: 11, color: DONATION_COLOR, fontWeight: 700, textTransform: 'uppercase' }}>
                      {don.country}
                    </span>
                  )}
                </div>
              </div>
              {don.description && (
                <p style={{ margin: '0 0 10px', fontSize: 12, color: '#4b5563', lineHeight: 1.4 }}>
                  {don.description}
                </p>
              )}
              <a
                href={don.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  background: DONATION_COLOR,
                  color: '#fff',
                  textAlign: 'center',
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                💵 Donar
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      {centros.map((centro) => {
        const isActive = activeId === centro.id;
        const color = getMarkerColor(centro.estatus);
        return (
          <Marker
            key={centro.id}
            position={[centro.lat, centro.lng]}
            icon={createCentroIcon(isActive)}
            zIndexOffset={isActive ? 1000 : 0}
            ref={(marker) => {
              if (marker) markerRefs.current.set(centro.id, marker);
              else markerRefs.current.delete(centro.id);
            }}
            eventHandlers={{ click: () => onSelectCentro(centro.id) }}
          >
            <Popup>
              <div style={{ minWidth: 200, fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span
                    style={{
                      marginTop: 4,
                      flexShrink: 0,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: color,
                      display: 'inline-block',
                    }}
                  />
                  <div>
                    <strong style={{ fontSize: 14, lineHeight: 1.3, display: 'block' }}>
                      {centro.nombre}
                    </strong>
                    <span style={{ fontSize: 11, color, fontWeight: 700, textTransform: 'uppercase' }}>
                      {getStatusLabel(centro.estatus)}
                    </span>
                  </div>
                </div>

                {centro.direccion && (
                  <p style={{ margin: '0 0 6px', fontSize: 12, color: '#4b5563', lineHeight: 1.4 }}>
                    {centro.direccion}
                  </p>
                )}

                {centro.contacto && (
                  <a
                    href={`tel:${centro.contacto.replace(/[^\d+]/g, '')}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      marginBottom: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#1d4ed8',
                      textDecoration: 'none',
                    }}
                  >
                    📞 {centro.contacto}
                  </a>
                )}

                {centro.distancia != null && (
                  <p style={{ margin: '0 0 8px', fontSize: 11, color: '#9ca3af' }}>
                    {centro.distancia.toFixed(1)} km de tu ubicación
                  </p>
                )}

                {centro.ubicacion_url && (
                  <a
                    href={centro.ubicacion_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'block',
                      background: '#1d4ed8',
                      color: '#fff',
                      textAlign: 'center',
                      padding: '7px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none',
                      marginTop: 4,
                    }}
                  >
                    Cómo llegar →
                  </a>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

      {refugios.map((refugio) => (
        <Marker
          key={refugio.id}
          position={[refugio.lat, refugio.lng]}
          icon={refugioIcon}
          zIndexOffset={300}
        >
          <Popup>
            <div style={{ minWidth: 200, fontFamily: 'system-ui, sans-serif' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>🏠</span>
                <div>
                  <strong style={{ fontSize: 14, lineHeight: 1.3, display: 'block' }}>
                    {refugio.nombre}
                  </strong>
                  {(refugio.zona || refugio.municipio) && (
                    <span style={{ fontSize: 11, color: REFUGIO_COLOR, fontWeight: 700, textTransform: 'uppercase' }}>
                      {refugio.zona ?? refugio.municipio}
                    </span>
                  )}
                </div>
              </div>
              {(refugio.direccion || refugio.referencia_lugar) && (
                <p style={{ margin: '0 0 6px', fontSize: 12, color: '#4b5563', lineHeight: 1.4 }}>
                  {refugio.direccion ?? refugio.referencia_lugar}
                </p>
              )}
              {refugio.necesidades && (
                <p style={{ margin: '0 0 6px', fontSize: 11, color: '#92400e', background: '#fef3c7', borderRadius: 6, padding: '4px 8px', lineHeight: 1.4 }}>
                  <strong>Necesidades:</strong> {refugio.necesidades}
                </p>
              )}
              {refugio.contacto_telefono && (
                <a
                  href={`tel:${refugio.contacto_telefono.replace(/[^\d+]/g, '')}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginBottom: 6,
                    fontSize: 13,
                    fontWeight: 700,
                    color: REFUGIO_COLOR,
                    textDecoration: 'none',
                  }}
                >
                  📞 {refugio.contacto_telefono}
                </a>
              )}
              {refugio.num_personas != null && (
                <p style={{ margin: '0 0 6px', fontSize: 11, color: '#6b7280' }}>
                  {refugio.num_personas} personas
                </p>
              )}
              {refugio.google_maps_url && (
                <a
                  href={refugio.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block',
                    background: REFUGIO_COLOR,
                    color: '#fff',
                    textAlign: 'center',
                    padding: '7px 12px',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    textDecoration: 'none',
                    marginTop: 4,
                  }}
                >
                  Cómo llegar →
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <strong style={{ fontSize: 13 }}>Tu ubicación</strong>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
