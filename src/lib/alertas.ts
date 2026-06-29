import type { AlertaCentro, SemafaroEstado } from "@/lib/types";

export const ALERTA_TIPOS_VISIBLES = [
  "NECESIDAD_URGENTE",
  "INSUMO_SATURADO",
] as const;

function normalizeExpiresAt(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function resolveAlertExpiresAt(alerta: AlertaCentro): string | null {
  if (alerta.expires_at) {
    return normalizeExpiresAt(alerta.expires_at);
  }

  if (!alerta.metadata || typeof alerta.metadata !== "object") {
    return null;
  }

  const metadata = alerta.metadata as Record<string, unknown>;
  return normalizeExpiresAt(metadata.expiresAt);
}

export function isAlertaActiva(
  alerta: AlertaCentro,
  now = new Date(),
): boolean {
  if (
    alerta.tipo !== "NECESIDAD_URGENTE" &&
    alerta.tipo !== "INSUMO_SATURADO"
  ) {
    return false;
  }

  if (!alerta.visible_publico) {
    return false;
  }

  const expiresAt = resolveAlertExpiresAt(alerta);
  if (!expiresAt) {
    return true;
  }

  return new Date(expiresAt).getTime() > now.getTime();
}

export function filtrarAlertasActivas(
  alertas: AlertaCentro[],
  now = new Date(),
): AlertaCentro[] {
  return alertas.filter((alerta) => isAlertaActiva(alerta, now));
}

export function agruparAlertasActivasPorCentro(
  alertas: AlertaCentro[],
): Map<string, AlertaCentro[]> {
  const map = new Map<string, AlertaCentro[]>();
  for (const alerta of alertas) {
    const list = map.get(alerta.centro_id) ?? [];
    list.push(alerta);
    map.set(alerta.centro_id, list);
  }
  return map;
}

export function calcularSemaforoDesdeAlertas(
  alertas: AlertaCentro[],
): SemafaroEstado {
  if (alertas.some((a) => a.tipo === "NECESIDAD_URGENTE")) {
    return "URGENTE";
  }

  if (alertas.some((a) => a.tipo === "INSUMO_SATURADO")) {
    return "SATURADO";
  }

  return "SIN_DATOS";
}
