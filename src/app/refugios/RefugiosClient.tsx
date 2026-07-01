"use client";

import { useState } from "react";
import { RefugioCard } from "@/components/refugios/RefugioCard";
import type { Refugio } from "@/lib/types";

interface RefugiosClientProps {
  refugios: Refugio[];
}

interface GrupoZona {
  zona: string;
  refugios: Refugio[];
  conNecesidades: number;
}

function agruparPorZona(refugios: Refugio[]): GrupoZona[] {
  const map = new Map<string, Refugio[]>();
  for (const r of refugios) {
    const key = r.zona || "Sin zona";
    const arr = map.get(key) ?? [];
    arr.push(r);
    map.set(key, arr);
  }
  return [...map.entries()]
    .map(([zona, items]) => ({
      zona,
      refugios: items,
      conNecesidades: items.filter((r) => r.necesidades).length,
    }))
    .sort((a, b) => b.refugios.length - a.refugios.length);
}

export function RefugiosClient({ refugios }: RefugiosClientProps) {
  const [busqueda, setBusqueda] = useState("");

  const filtered = busqueda.trim()
    ? refugios.filter((r) => {
        const term = busqueda.toLowerCase();
        return [r.nombre, r.direccion, r.referencia_lugar, r.municipio, r.zona, r.necesidades]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
    : refugios;

  const grupos = agruparPorZona(filtered);

  return (
    <>
      {/* Buscador */}
      <div className="mb-5">
        <input
          type="text"
          placeholder="Buscar por nombre, zona, dirección o necesidad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm placeholder:text-zinc-400 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-100"
        />
      </div>

      {/* Índice rápido de zonas */}
      <nav className="mb-5 flex flex-wrap gap-2">
        {grupos.map((g) => (
          <a
            key={g.zona}
            href={`#zona-${g.zona.replace(/\s/g, "-")}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 shadow-sm transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
          >
            {g.zona}
            <span className="rounded-full bg-zinc-100 px-1.5 py-0.5 text-[10px] font-black text-zinc-500">
              {g.refugios.length}
            </span>
            {g.conNecesidades > 0 && (
              <span className="h-2 w-2 rounded-full bg-amber-400" title="Tiene necesidades" />
            )}
          </a>
        ))}
      </nav>

      {/* Grupos por zona */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-center text-sm text-zinc-500">
          No se encontraron refugios con esa búsqueda.
        </div>
      ) : (
        <div className="space-y-3">
          {grupos.map((grupo) => (
            <details
              key={grupo.zona}
              id={`zona-${grupo.zona.replace(/\s/g, "-")}`}
              className="group rounded-2xl border border-zinc-200 bg-white shadow-sm open:border-purple-200 open:bg-purple-50/30 open:shadow-md"
              open={grupos.length <= 3 || grupo.refugios.length <= 5}
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 hover:bg-zinc-50 group-open:border-b group-open:border-purple-100 group-open:bg-white/80">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-sm font-black text-purple-700">
                  {grupo.refugios.length}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-black text-zinc-900">{grupo.zona}</h2>
                  <p className="text-xs text-zinc-500">
                    {grupo.refugios.length} refugio{grupo.refugios.length !== 1 ? "s" : ""}
                    {grupo.conNecesidades > 0 && (
                      <span className="ml-2 font-semibold text-amber-600">
                        · {grupo.conNecesidades} con necesidades
                      </span>
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-zinc-300 transition group-open:rotate-180">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </summary>
              <div className="border-t border-zinc-100 p-3 sm:p-4">
                <div className="grid gap-4">
                  {grupo.refugios.map((refugio) => (
                    <RefugioCard key={refugio.id} refugio={refugio} />
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
