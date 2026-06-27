import type { CentroAcopio, Necesidad, SemafaroEstado, Urgencia } from "@/lib/types";

const URGENCIA_PRIORITY: Record<Urgencia, number> = {
  URGENTE: 3,
  MEDIA: 2,
  SATURADO: 1,
};

export function calcularSemafaro(necesidades: Necesidad[] = []): SemafaroEstado {
  if (necesidades.length === 0) {
    return "SIN_DATOS";
  }

  const maxPriority = Math.max(
    ...necesidades.map((item) => URGENCIA_PRIORITY[item.urgencia]),
  );

  if (maxPriority >= URGENCIA_PRIORITY.URGENTE) return "URGENTE";
  if (maxPriority >= URGENCIA_PRIORITY.MEDIA) return "MEDIA";
  return "SATURADO";
}

export const SEMAFORO_LABELS: Record<SemafaroEstado, string> = {
  URGENTE: "Urgente",
  MEDIA: "Atención media",
  SATURADO: "Saturado",
  SIN_DATOS: "Sin reporte",
};

export const SEMAFORO_STYLES: Record<SemafaroEstado, string> = {
  URGENTE: "border-red-600 bg-red-50 text-red-900",
  MEDIA: "border-amber-500 bg-amber-50 text-amber-900",
  SATURADO: "border-green-600 bg-green-50 text-green-900",
  SIN_DATOS: "border-zinc-400 bg-zinc-50 text-zinc-700",
};

export const SEMAFORO_DOT: Record<SemafaroEstado, string> = {
  URGENTE: "bg-red-600",
  MEDIA: "bg-amber-500",
  SATURADO: "bg-green-600",
  SIN_DATOS: "bg-zinc-400",
};

export const URGENCIA_STYLES: Record<Urgencia, string> = {
  URGENTE: "bg-red-100 text-red-800 border-red-200",
  MEDIA: "bg-amber-100 text-amber-800 border-amber-200",
  SATURADO: "bg-green-100 text-green-800 border-green-200",
};

const SEMAFORO_PRIORITY: Record<SemafaroEstado, number> = {
  URGENTE: 4,
  MEDIA: 3,
  SATURADO: 2,
  SIN_DATOS: 1,
};

export function calcularSemafaroGrupo(centros: CentroAcopio[]): SemafaroEstado {
  return centros.reduce<SemafaroEstado>((max, centro) => {
    const s = calcularSemafaro(centro.necesidades ?? []);
    return SEMAFORO_PRIORITY[s] > SEMAFORO_PRIORITY[max] ? s : max;
  }, "SIN_DATOS");
}
