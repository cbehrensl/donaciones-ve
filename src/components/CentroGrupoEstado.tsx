import { CentroCard } from "@/components/CentroCard";
import { calcularSemafaroGrupo, SEMAFORO_DOT, SEMAFORO_LABELS } from "@/lib/semaforo";
import type { CentroAcopio } from "@/lib/types";

interface CentroGrupoEstadoProps {
  nombreEstado: string;
  centros: CentroAcopio[];
  defaultOpen?: boolean;
}

export function CentroGrupoEstado({
  nombreEstado,
  centros,
  defaultOpen = false,
}: CentroGrupoEstadoProps) {
  const semaforo = calcularSemafaroGrupo(centros);

  return (
    <details
      open={defaultOpen}
      className="group rounded-2xl border border-zinc-200 bg-white shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden
            className={`inline-block h-3 w-3 shrink-0 rounded-full ${SEMAFORO_DOT[semaforo]}`}
          />
          <span className="font-black text-zinc-900">{nombreEstado}</span>
          <span className="text-sm font-medium text-zinc-500">
            {centros.length}{" "}
            {centros.length === 1 ? "centro" : "centros"}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500 sm:inline">
            {SEMAFORO_LABELS[semaforo]}
          </span>
          <svg
            className="h-5 w-5 shrink-0 text-zinc-400 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </summary>
      <div className="space-y-4 border-t border-zinc-100 p-4 sm:p-5">
        {centros.map((centro) => (
          <CentroCard key={centro.id} centro={centro} />
        ))}
      </div>
    </details>
  );
}
