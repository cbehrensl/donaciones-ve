'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import type { CentroConCoordenadas } from '@/lib/types';

// Workaround para el bug de iconos Leaflet con webpack/Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

interface MapaLeafletProps {
  centros: (CentroConCoordenadas & { distancia?: number })[];
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

function createPinIcon(color: string, active = false): L.DivIcon {
  // SVG teardrop pin (20×28 viewport, tip at bottom center)
  const svg = `<svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0C4.5 0 0 4.5 0 10C0 17.5 10 28 10 28C10 28 20 17.5 20 10C20 4.5 15.5 0 10 0Z"
          fill="${color}" stroke="white" stroke-width="1.5"/>
    <circle cx="10" cy="9.5" r="4" fill="white" opacity="0.9"/>
  </svg>`

  if (active) {
    return L.divIcon({
      className: '',
      html: `<div style="position:relative;width:20px;height:28px">
               <div class="marker-pulse" style="width:20px;height:20px;top:-2px;left:0;background:${color}"></div>
               <div style="position:relative;filter:drop-shadow(0 3px 8px rgba(0,0,0,0.45))">${svg}</div>
             </div>`,
      iconSize: [20, 28],
      iconAnchor: [10, 28],
      popupAnchor: [0, -30],
    })
  }

  return L.divIcon({
    className: '',
    html: `<div style="filter:drop-shadow(0 2px 5px rgba(0,0,0,0.3))">${svg}</div>`,
    iconSize: [20, 28],
    iconAnchor: [10, 28],
    popupAnchor: [0, -30],
  })
}

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

      {centros.map((centro) => {
        const isActive = activeId === centro.id;
        const color = getMarkerColor(centro.estatus);
        return (
          <Marker
            key={centro.id}
            position={[centro.lat, centro.lng]}
            icon={createPinIcon(color, isActive)}
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
