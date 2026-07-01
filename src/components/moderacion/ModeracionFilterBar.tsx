"use client";

import Link from "next/link";
import { useState } from "react";
import type { ModeracionTab } from "@/lib/types";

interface FilterOption {
  value: string;
  label: string;
}

interface EstadoOption {
  id: string;
  nombre: string;
}

interface ModeracionFilterBarProps {
  tab: ModeracionTab;
  token: string;
  defaultQuery: string;
  defaultEstado: string;
  defaultEstatus?: string;
  defaultVerificacion?: string;
  defaultActividad?: string;
  defaultConfirmacion?: string;
  defaultSaturacion?: string;
  estados: EstadoOption[];
  estatusOptions?: FilterOption[];
  verificacionOptions?: FilterOption[];
  actividadOptions?: FilterOption[];
  confirmacionOptions?: FilterOption[];
  saturacionOptions?: FilterOption[];
  resultsCount: number;
  resultsLabel: string;
  page: number;
  clearHref: string;
  prevHref: string;
  nextHref: string;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export function ModeracionFilterBar({
  tab,
  token,
  defaultQuery,
  defaultEstado,
  defaultEstatus = "todos",
  defaultVerificacion = "todos",
  defaultActividad = "todos",
  defaultConfirmacion = "todos",
  defaultSaturacion = "todos",
  estados,
  estatusOptions = [],
  verificacionOptions = [],
  actividadOptions = [],
  confirmacionOptions = [],
  saturacionOptions = [],
  resultsCount,
  resultsLabel,
  page,
  clearHref,
  prevHref,
  nextHref,
  hasPrevPage,
  hasNextPage,
}: ModeracionFilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isCentros = tab === "centros";

  return (
    <form
      method="get"
      className="sticky top-0 z-10 rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-sm backdrop-blur-sm"
    >
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="tab" value={tab} />
      <input type="hidden" name="page" value="1" />

      <div className="flex flex-col gap-2">
        <input
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder={
            isCentros
              ? "Buscar nombre, dirección, responsable..."
              : "Buscar nombre, zona, contacto, necesidades..."
          }
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
        />

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-left text-sm font-bold text-zinc-700 sm:hidden"
          aria-expanded={filtersOpen}
        >
          {filtersOpen ? "Ocultar filtros" : "Mostrar filtros"}
        </button>

        <div
          className={`grid gap-2 ${
            isCentros
              ? "sm:grid-cols-[1fr_1fr_1fr_auto]"
              : "sm:grid-cols-[1fr_1fr_1fr_1fr_auto]"
          } ${filtersOpen ? "grid" : "hidden sm:grid"}`}
        >
          <select
            name="estado"
            defaultValue={defaultEstado}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">Todos los estados</option>
            {estados.map((estado) => (
              <option key={estado.id} value={estado.id}>
                {estado.nombre}
              </option>
            ))}
          </select>

          {isCentros ? (
            <>
              <select
                name="estatus"
                defaultValue={defaultEstatus}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
              >
                {estatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="verificacion"
                defaultValue={defaultVerificacion}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
              >
                {verificacionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <select
                name="actividad"
                defaultValue={defaultActividad}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
              >
                {actividadOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="confirmacion"
                defaultValue={defaultConfirmacion}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
              >
                {confirmacionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="saturacion"
                defaultValue={defaultSaturacion}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
              >
                {saturacionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </>
          )}

          <button
            type="submit"
            className="rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-900"
          >
            Filtrar
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <div className="flex items-center gap-3">
          <span>
            <strong className="text-zinc-700">{resultsCount}</strong> {resultsLabel} · pág.{" "}
            <strong className="text-zinc-700">{page}</strong>
          </span>
          <Link
            href={clearHref}
            className="font-semibold text-blue-700 transition hover:text-blue-900"
          >
            Limpiar
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={prevHref}
            aria-disabled={!hasPrevPage}
            className={`rounded-md border px-2.5 py-1 text-xs font-bold ${
              hasPrevPage
                ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                : "pointer-events-none border-zinc-100 text-zinc-300"
            }`}
          >
            ←
          </Link>
          <Link
            href={nextHref}
            aria-disabled={!hasNextPage}
            className={`rounded-md border px-2.5 py-1 text-xs font-bold ${
              hasNextPage
                ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                : "pointer-events-none border-zinc-100 text-zinc-300"
            }`}
          >
            →
          </Link>
        </div>
      </div>
    </form>
  );
}
