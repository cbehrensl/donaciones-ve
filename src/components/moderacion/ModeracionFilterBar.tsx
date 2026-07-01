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
  totalCount: number | null;
  hasNextPage: boolean;
  activeFilterSummary?: string;
  clearHref: string;
  prevHref: string;
  nextHref: string;
  hasPrevPage: boolean;
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
  totalCount,
  hasNextPage,
  activeFilterSummary,
  clearHref,
  prevHref,
  nextHref,
  hasPrevPage,
}: ModeracionFilterBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isCentros = tab === "centros";

  const countLabel =
    totalCount != null
      ? `${resultsCount} de ${totalCount} ${resultsLabel}`
      : `${resultsCount} en esta página`;

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
          className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
        />

        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="min-h-11 rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-left text-sm font-bold text-zinc-700 sm:hidden"
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
            className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
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
                className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
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
                className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
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
                className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
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
                className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
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
                className="min-h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
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
            className="min-h-11 rounded-lg bg-blue-800 px-4 text-sm font-bold text-white shadow-sm hover:bg-blue-900"
          >
            Filtrar
          </button>
        </div>
      </div>

      {activeFilterSummary ? (
        <p className="mt-2 text-xs text-zinc-600">{activeFilterSummary}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            <strong className="text-zinc-700">{countLabel}</strong> · pág.{" "}
            <strong className="text-zinc-700">{page}</strong>
            {hasNextPage ? " · hay más resultados" : ""}
          </span>
          <Link
            href={clearHref}
            className="min-h-11 inline-flex items-center font-semibold text-blue-700"
          >
            Limpiar
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={prevHref}
            aria-disabled={!hasPrevPage}
            className={`inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-bold ${
              hasPrevPage
                ? "border-zinc-300 bg-white text-zinc-700"
                : "pointer-events-none border-zinc-100 text-zinc-300"
            }`}
          >
            Anterior
          </Link>
          <Link
            href={nextHref}
            aria-disabled={!hasNextPage}
            className={`inline-flex min-h-11 items-center rounded-lg border px-4 text-sm font-bold ${
              hasNextPage
                ? "border-zinc-300 bg-white text-zinc-700"
                : "pointer-events-none border-zinc-100 text-zinc-300"
            }`}
          >
            Siguiente
          </Link>
        </div>
      </div>
    </form>
  );
}
