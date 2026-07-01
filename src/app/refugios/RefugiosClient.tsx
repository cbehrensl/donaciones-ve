"use client";

import { useState } from "react";
import { formatWhatsappHref } from "@/lib/contact-links";
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
  const totalNecesidades = filtered.filter((r) => r.necesidades).length;

  return (
    <>
      {/* Stats rápidos */}
      <div className="mb-5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-purple-50 p-3 text-center">
          <div className="text-2xl font-black text-purple-700">{filtered.length}</div>
          <div className="text-[11px] font-semibold uppercase text-purple-500">Refugios</div>
        </div>
        <div className="rounded-xl bg-zinc-100 p-3 text-center">
          <div className="text-2xl font-black text-zinc-700">{grupos.length}</div>
          <div className="text-[11px] font-semibold uppercase text-zinc-500">Zonas</div>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <div className="text-2xl font-black text-amber-700">{totalNecesidades}</div>
          <div className="text-[11px] font-semibold uppercase text-amber-500">Con necesidades</div>
        </div>
      </div>

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
              className="group rounded-2xl border border-zinc-200 bg-white shadow-sm open:ring-2 open:ring-purple-500/20"
              open={grupos.length <= 3 || grupo.refugios.length <= 5}
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 hover:bg-zinc-50">
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
                <div className="grid gap-2.5">
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

function RefugioCard({ refugio }: { refugio: Refugio }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const whatsappHref = refugio.contacto_telefono
    ? formatWhatsappHref(refugio.contacto_telefono)
    : null;

  return (
    <article className="min-w-0 rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 transition hover:border-zinc-200 hover:bg-white">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold leading-tight text-zinc-900">
            {refugio.nombre}
          </h3>
          {(refugio.direccion || refugio.referencia_lugar) && (
            <div 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-0.5 cursor-pointer group"
              title={isExpanded ? "Mostrar menos" : "Mostrar dirección completa"}
            >
              <p className={`text-xs text-zinc-500 transition-colors group-hover:text-zinc-800 ${
                isExpanded ? "break-words" : "truncate"
              }`}>
                {refugio.direccion || refugio.referencia_lugar}
              </p>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {refugio.confirmado && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              Confirmado
            </span>
          )}
          {refugio.num_personas != null && (
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
              {refugio.num_personas} pers.
            </span>
          )}
        </div>
      </div>

      {refugio.necesidades && (
        <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50/70 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600">Necesidades</p>
          <p className="mt-0.5 text-xs leading-relaxed text-amber-900">{refugio.necesidades}</p>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {refugio.google_maps_url && (
          <a
            href={refugio.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 px-2.5 py-1 text-[11px] font-bold text-zinc-600 transition hover:bg-zinc-100"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Mapa
          </a>
        )}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-purple-700"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            WhatsApp {refugio.contacto_telefono}
          </a>
        )}
        {refugio.contacto_nombre && (
          <span className="text-[11px] text-zinc-400">
            · {refugio.contacto_nombre}
          </span>
        )}
      </div>
    </article>
  );
}
