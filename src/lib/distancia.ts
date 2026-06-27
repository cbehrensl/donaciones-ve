/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine.
 *
 * @param lat1 - Latitud del primer punto en grados
 * @param lng1 - Longitud del primer punto en grados
 * @param lat2 - Latitud del segundo punto en grados
 * @param lng2 - Longitud del segundo punto en grados
 * @returns Distancia en kilómetros
 */
export function haversineDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Radio de la Tierra en km

  // Convertir grados a radianes
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  // Fórmula de Haversine
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
