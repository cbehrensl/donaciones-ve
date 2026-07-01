import type { AlertaCentro, SemafaroEstado } from "@/lib/types";

export const ALERTA_TIPOS_VISIBLES = [
  "NECESIDAD_URGENTE",
  "INSUMO_SATURADO",
] as const;
export type AlertaTipoVisible = (typeof ALERTA_TIPOS_VISIBLES)[number];

interface AlertaUIConfig {
  label: string;
  shortLabel: string;
  icon: string;
  badgeClasses: string;
  itemClasses: string;
}

export const ALERTA_UI_CONFIG: Record<AlertaCentro["tipo"], AlertaUIConfig> = {
  NECESIDAD_URGENTE: {
    label: "Solicitud urgente",
    shortLabel: "Necesita ayuda ahora",
    icon: "🚨",
    badgeClasses: "border-red-200 bg-red-50 text-red-900",
    itemClasses: "border-red-200 bg-red-50 text-red-900",
  },
  INSUMO_SATURADO: {
    label: "Alerta de saturación",
    shortLabel: "No llevar por ahora",
    icon: "✅",
    badgeClasses: "border-emerald-200 bg-emerald-50 text-emerald-900",
    itemClasses: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  ACTUALIZACION_CENTRO: {
    label: "Actualización de centro",
    shortLabel: "Actualización",
    icon: "ℹ️",
    badgeClasses: "border-blue-200 bg-blue-50 text-blue-900",
    itemClasses: "border-blue-200 bg-blue-50 text-blue-900",
  },
};

export function splitVisibleAlertasByTipo(alertas: AlertaCentro[]): {
  urgentes: AlertaCentro[];
  saturadas: AlertaCentro[];
} {
  const urgentes: AlertaCentro[] = [];
  const saturadas: AlertaCentro[] = [];

  for (const alerta of alertas) {
    if (alerta.tipo === "NECESIDAD_URGENTE") {
      urgentes.push(alerta);
    }
    if (alerta.tipo === "INSUMO_SATURADO") {
      saturadas.push(alerta);
    }
  }

  return { urgentes, saturadas };
}

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

export interface AlertasAgrupadasCentro {
  centroId: string;
  centro: AlertaCentro["centros_acopio"] | null;
  alertas: AlertaCentro[];
  latestCreatedAt: string;
}

export function agruparAlertasPorCentro(
  alertas: AlertaCentro[],
): AlertasAgrupadasCentro[] {
  const map = new Map<string, AlertasAgrupadasCentro>();

  for (const alerta of alertas) {
    const current = map.get(alerta.centro_id);
    if (!current) {
      map.set(alerta.centro_id, {
        centroId: alerta.centro_id,
        centro: alerta.centros_acopio ?? null,
        alertas: [alerta],
        latestCreatedAt: alerta.created_at,
      });
      continue;
    }

    current.alertas.push(alerta);
    if (new Date(alerta.created_at).getTime() > new Date(current.latestCreatedAt).getTime()) {
      current.latestCreatedAt = alerta.created_at;
    }
    if (!current.centro && alerta.centros_acopio) {
      current.centro = alerta.centros_acopio;
    }
  }

  return [...map.values()]
    .map((entry) => ({
      ...entry,
      alertas: entry.alertas.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    }))
    .sort(
      (a, b) =>
        new Date(b.latestCreatedAt).getTime() - new Date(a.latestCreatedAt).getTime(),
    );
}

export function calcularSemaforoDesdeAlertas(
  alertas: AlertaCentro[],
  options?: { hasInsumos?: boolean },
): SemafaroEstado {
  if (alertas.some((a) => a.tipo === "NECESIDAD_URGENTE")) {
    return "URGENTE";
  }

  if (alertas.some((a) => a.tipo === "INSUMO_SATURADO")) {
    return "SATURADO";
  }

  if (options?.hasInsumos) {
    return "MEDIA";
  }

  return "SIN_DATOS";
}
