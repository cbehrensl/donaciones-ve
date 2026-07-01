import Link from "next/link";
import type { RefugiosModeracionResumen } from "@/lib/types";

interface ModeracionRefugiosResumenPanelProps {
  resumen: RefugiosModeracionResumen;
  nuevoRefugioHref: string;
}

export function ModeracionRefugiosResumenPanel({
  resumen,
  nuevoRefugioHref,
}: ModeracionRefugiosResumenPanelProps) {
  return (
    <details className="rounded-xl border border-zinc-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-zinc-800">
        Resumen de refugios
        <span className="mt-0.5 block text-xs font-normal text-zinc-500">
          {resumen.activos} activos · {resumen.pendientes} pendientes ·{" "}
          {resumen.saturados} saturados
        </span>
      </summary>
      <div className="border-t border-zinc-100 p-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-zinc-400">Total</p>
            <p className="text-xl font-black">{resumen.total}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Activos</p>
            <p className="text-xl font-black text-emerald-900">{resumen.activos}</p>
          </div>
          <div className="rounded-lg border border-amber-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-amber-700">Pendientes</p>
            <p className="text-xl font-black text-amber-900">{resumen.pendientes}</p>
          </div>
          <div className="rounded-lg border border-red-200 px-3 py-2">
            <p className="text-[10px] font-bold uppercase text-red-700">Saturados</p>
            <p className="text-xl font-black text-red-900">{resumen.saturados}</p>
          </div>
        </div>
        <Link
          href={nuevoRefugioHref}
          className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-purple-300 bg-purple-50 px-4 text-sm font-bold text-purple-900"
        >
          + Crear refugio
        </Link>
      </div>
    </details>
  );
}
