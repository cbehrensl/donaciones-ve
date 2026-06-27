'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import type { CentroConCoordenadas } from '@/lib/types';

// Workaround para el bug de iconos Leaflet con webpack/Next.js
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' });

interface MapaLeafletProps {
  centros: CentroConCoordenadas[];
  userLocation: { lat: number; lng: number } | null;
  activeId: string | null;
  onSelectCentro: (id: string) => void;
}

function getMarkerColor(estatus: string | undefined): string {
  switch (estatus) {
    case 'activo':
      return '#22c55e';
    case 'saturado':
      return '#c2410c';
    case 'sin_verificar':
      return '#6b7280';
    default:
      return '#6b7280';
  }
}

function createCircleIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: ${color};
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}

const userIcon = createCircleIcon('#3b82f6');

interface MapControllerProps {
  centros: CentroConCoordenadas[];
  userLocation: { lat: number; lng: number } | null;
  activeId: string | null;
  markerRefs: React.MutableRefObject<Map<string, L.Marker>>;
}

function MapController({ centros, userLocation, activeId, markerRefs }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (activeId === null) return;
    const centro = centros.find((c) => c.id === activeId);
    if (centro) {
      map.panTo([centro.lat, centro.lng]);
      const marker = markerRefs.current.get(activeId);
      if (marker) marker.openPopup();
    }
  }, [activeId, centros, map, markerRefs]);

  useEffect(() => {
    if (userLocation === null) return;
    map.flyTo([userLocation.lat, userLocation.lng], 12);
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

  return (
    <MapContainer
      center={[8, -66]}
      zoom={6}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapController centros={centros} userLocation={userLocation} activeId={activeId} markerRefs={markerRefs} />

      {centros.map((centro) => (
        <Marker
          key={centro.id}
          position={[centro.lat, centro.lng]}
          icon={createCircleIcon(getMarkerColor(centro.estatus))}
          ref={(marker) => {
            if (marker) markerRefs.current.set(centro.id, marker);
            else markerRefs.current.delete(centro.id);
          }}
          eventHandlers={{
            click: () => onSelectCentro(centro.id),
          }}
        >
          <Popup>
            <div>
              <strong>{centro.nombre}</strong>
              <br />
              {centro.direccion}
              {centro.contacto && (
                <>
                  <br />
                  {centro.contacto}
                </>
              )}
              {centro.ubicacion_url && (
                <>
                  <br />
                  <a href={centro.ubicacion_url} target="_blank" rel="noopener noreferrer">
                    Abrir en Maps
                  </a>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Tu ubicación</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
