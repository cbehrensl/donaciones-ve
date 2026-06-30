/**
 * Approximate country centroids for donation link pins.
 * Keyed by ISO 3166-1 alpha-2 code (uppercase).
 */
export const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  VE: { lat: 8.0,    lng: -66.0  },
  US: { lat: 39.5,   lng: -98.35 },
  ES: { lat: 40.4,   lng: -3.7   },
  DE: { lat: 51.2,   lng: 10.4   },
  AR: { lat: -38.4,  lng: -63.6  },
  CO: { lat: 4.6,    lng: -74.1  },
  MX: { lat: 23.6,   lng: -102.5 },
  CL: { lat: -35.7,  lng: -71.5  },
  PE: { lat: -9.2,   lng: -75.0  },
  EC: { lat: -1.8,   lng: -78.2  },
  BR: { lat: -14.2,  lng: -51.9  },
  PA: { lat: 8.5,    lng: -80.8  },
  BO: { lat: -16.3,  lng: -63.6  },
  UY: { lat: -32.5,  lng: -55.8  },
  PY: { lat: -23.4,  lng: -58.4  },
  CA: { lat: 56.1,   lng: -106.3 },
  GB: { lat: 55.4,   lng: -3.4   },
  FR: { lat: 46.2,   lng: 2.2    },
  IT: { lat: 41.9,   lng: 12.6   },
  PT: { lat: 39.4,   lng: -8.2   },
};

/**
 * Extrae coordenadas de una URL de Google Maps o similar.
 * Soporta múltiples formatos de URLs de mapas.
 *
 * @param url - URL a parsear. Si es null o vacío, retorna null.
 * @returns Objeto con lat y lng si se extraen coordenadas válidas en Venezuela, null en caso contrario.
 */
export function extractCoordenadas(url: string | null): { lat: number; lng: number } | null {
  // Si url es null o vacío, retornar null
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null;
  }

  // Detectar si es URL acortada (goo.gl o maps.app.goo.gl) — retornar null silenciosamente
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname || '';
    if (hostname.includes('goo.gl') || hostname.includes('maps.app.goo.gl')) {
      return null;
    }
  } catch {
    // Si no es una URL válida, continuar intentando parsear patterns
  }

  let lat: number | null = null;
  let lng: number | null = null;

  // Patrón 1: /@LAT,LNG (Google Maps)
  // Ejemplo: https://www.google.com/maps/@10.4696,-66.9039,15z
  const pattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
  const match1 = url.match(pattern1);
  if (match1) {
    lat = parseFloat(match1[1]);
    lng = parseFloat(match1[2]);
  }

  // Patrón 2: ?q=LAT,LNG o ?ll=LAT,LNG (Google Maps, Waze, Apple Maps)
  // Ejemplo: https://www.google.com/maps/?q=10.4696,-66.9039
  // Ejemplo: https://waze.com/ul?ll=10.4696,-66.9039
  // Ejemplo: https://maps.apple.com/?ll=10.4696,-66.9039
  if (lat === null || lng === null) {
    const pattern2 = /[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match2 = url.match(pattern2);
    if (match2) {
      lat = parseFloat(match2[1]);
      lng = parseFloat(match2[2]);
    }
  }

  // Si no se encontraron coordenadas, retornar null
  if (lat === null || lng === null) {
    return null;
  }

  // Validar bounding box Venezuela: lat ∈ [-2, 15], lng ∈ [-75, -58]
  if (lat < -2 || lat > 15 || lng < -75 || lng > -58) {
    return null;
  }

  return { lat, lng };
}
