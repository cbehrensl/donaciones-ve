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
