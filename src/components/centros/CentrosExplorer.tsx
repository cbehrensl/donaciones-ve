"use client";

import Link from "next/link";
import { useState } from "react";
import { CentroGrupoEstado } from "@/components/CentroGrupoEstado";
import { FiltroGeografico } from "@/components/FiltroGeografico";
import { PublicSearchChatbot } from "@/components/chatbots/PublicSearchChatbot";
import {
  agruparAlertasActivasPorCentro,
  calcularSemaforoDesdeAlertas,
  filtrarAlertasActivas,
} from "@/lib/alertas";
import { SEMAFORO_PRIORITY } from "@/lib/semaforo";
import type {
  AlertaCentro,
  CentroAcopio,
  DataLoadError,
  Estado,
  HomeSearchFilters,
  HomeSearchMeta,
  Municipio,
  SemafaroEstado,
} from "@/lib/types";

interface GrupoEstado {
  estadoId: string;
  nombre: string;
  centros: CentroAcopio[];
  semaforo: SemafaroEstado;
  defaultOpen: boolean;
}

const ALERTA_UI: Record<
  AlertaCentro["tipo"],
  { label: string; icon: string; classes: string }
> = {
  NECESIDAD_URGENTE: {
    label: "Solicitud urgente",
    icon: "🚨",
    classes: "border-red-200 bg-red-50 text-red-900",
  },
  INSUMO_SATURADO: {
    label: "Alerta de saturación",
    icon: "✅",
    classes: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  ACTUALIZACION_CENTRO: {
    label: "Actualización de centro",
    icon: "ℹ️",
    classes: "border-blue-200 bg-blue-50 text-blue-900",
  },
};

function formatAlertTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Hace instantes";
  }
  return date.toLocaleTimeString("es-VE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function agruparCentrosPorEstado(
  centros: CentroAcopio[],
  estados: Estado[],
  alertasPorCentro: Map<string, AlertaCentro[]>,
  hayFiltroActivo: boolean,
): GrupoEstado[] {
  const estadosMap = new Map(estados.map((e) => [e.id, e.nombre]));
  const mapaGrupos = new Map<string, CentroAcopio[]>();

  for (const centro of centros) {
    const key = centro.estado_id ?? "__sin_estado__";
    if (!mapaGrupos.has(key)) mapaGrupos.set(key, []);
    mapaGrupos.get(key)!.push(centro);
  }

  const grupos: GrupoEstado[] = [];
  for (const [estadoId, centrosGrupo] of mapaGrupos) {
    const nombre =
      estadoId === "__sin_estado__"
        ? "Sin estado"
        : (estadosMap.get(estadoId) ?? "Desconocido");
    const semaforo = calcularSemaforoDesdeAlertas(
      centrosGrupo.flatMap((centro) => alertasPorCentro.get(centro.id) ?? []),
      {
        hasInsumos: centrosGrupo.some(
          (centro) => (centro.necesidades ?? []).length > 0,
        ),
      },
    );
    grupos.push({
      estadoId,
      nombre,
      centros: centrosGrupo,
      semaforo,
      defaultOpen: hayFiltroActivo,
    });
  }

  grupos.sort((a, b) => {
    if (a.estadoId === "__sin_estado__") return 1;
    if (b.estadoId === "__sin_estado__") return -1;
    return SEMAFORO_PRIORITY[b.semaforo] - SEMAFORO_PRIORITY[a.semaforo];
  });

  return grupos;
}

export interface CentrosExplorerProps {
  estados: Estado[];
  municipios: Municipio[];
  centros: CentroAcopio[];
  alertas: AlertaCentro[];
  initialFilters: HomeSearchFilters;
  searchMeta: HomeSearchMeta;
  errors: DataLoadError[];
}

const ALERTAS_INICIALES = 5;

export function CentrosExplorer({
  estados,
  municipios,
  centros,
  alertas,
  initialFilters,
  searchMeta,
  errors,
}: CentrosExplorerProps) {
  const [estadoId, setEstadoId] = useState(initialFilters.estadoId);
  const [municipioId, setMunicipioId] = useState(initialFilters.municipioId);
  const [mostrarTodasAlertas, setMostrarTodasAlertas] = useState(false);
  const [alertasColapsadas, setAlertasColapsadas] = useState(false);

  const alertasActivas = filtrarAlertasActivas(alertas);
  const alertasPorCentro = agruparAlertasActivasPorCentro(alertasActivas);

  // Only show alerts for centers currently visible (respects server filter)
  const centroIdsEnVista = new Set(centros.map((c) => c.id));
  const alertasFiltradas = alertasActivas.filter((a) =>
    centroIdsEnVista.has(a.centro_id),
  );
  const alertasVisibles = mostrarTodasAlertas
    ? alertasFiltradas
    : alertasFiltradas.slice(0, ALERTAS_INICIALES);
  const hayMasAlertas = alertasFiltradas.length > ALERTAS_INICIALES;

  const handleEstadoChange = (newEstadoId: string) => {
    setEstadoId(newEstadoId);
    setMunicipioId("");
  };

  const municipioNombre = municipioId
    ? municipios.find((item) => item.id === municipioId)?.nombre
    : null;
  const estadoNombre = estadoId
    ? estados.find((item) => item.id === estadoId)?.nombre
    : null;

  let textoResultados = " en total";
  if (municipioNombre) {
    textoResultados = ` en ${municipioNombre}`;
  } else if (estadoNombre) {
    textoResultados = ` en ${estadoNombre}`;
  }

  const hayFiltroActivo = Boolean(
    initialFilters.estadoId || initialFilters.municipioId || initialFilters.q,
  );
  const grupos = agruparCentrosPorEstado(
    centros,
    estados,
    alertasPorCentro,
    hayFiltroActivo,
  );

  return (
    <>
      {errors.length > 0 ? (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-950">
          <h2 className="mb-2 text-base font-black">
            No pudimos cargar todos los datos de centros
          </h2>
          <ul className="space-y-1">
            {errors.map((error) => (
              <li key={`${error.scope}-${error.message}`}>
                <strong>{error.scope}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        id="seccion-alertas"
        className="mb-8 overflow-hidden rounded-2xl border-2 border-red-200 bg-white shadow-sm"
      >
        {/* Header — siempre visible, toca para colapsar */}
        <button
          type="button"
          onClick={() => setAlertasColapsadas((v) => !v)}
          className="flex w-full items-center justify-between gap-3 border-b border-red-100 bg-red-50 px-4 py-3 text-left transition hover:bg-red-100"
          aria-expanded={!alertasColapsadas}
          aria-controls="alertas-body"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
            </span>
            <h2 className="text-sm font-black uppercase tracking-widest text-red-900">
              Alertas activas
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {alertasFiltradas.length > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                {alertasFiltradas.length}{" "}
                {alertasFiltradas.length === 1 ? "alerta" : "alertas"}
              </span>
            )}
            <svg
              className={`h-4 w-4 shrink-0 text-red-400 transition-transform ${alertasColapsadas ? "" : "rotate-180"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {!alertasColapsadas && (
          <div id="alertas-body" className="p-3 sm:p-4">
            {alertasFiltradas.length === 0 ? (
              <p className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-center text-sm text-zinc-500">
                {hayFiltroActivo
                  ? "No hay alertas activas para los centros de esta zona."
                  : "No hay alertas activas en este momento."}
              </p>
            ) : (
              <>
                <ul className="space-y-1.5">
                  {alertasVisibles.map((alerta) => {
                    const ui = ALERTA_UI[alerta.tipo];
                    return (
                      <li
                        key={alerta.id}
                        className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${ui.classes}`}
                      >
                        <span aria-hidden className="mt-0.5 shrink-0 text-sm">
                          {ui.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                            <span className="text-[11px] font-black uppercase tracking-wide">
                              {ui.label}
                            </span>
                            <span className="truncate text-xs font-bold">
                              {alerta.centros_acopio?.nombre ?? "Centro sin nombre"}
                            </span>
                            <span className="ml-auto shrink-0 text-[11px] font-semibold opacity-50">
                              {formatAlertTime(alerta.created_at)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs leading-snug opacity-90">
                            {alerta.mensaje}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {hayMasAlertas && !mostrarTodasAlertas && (
                  <button
                    type="button"
                    onClick={() => setMostrarTodasAlertas(true)}
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 text-xs font-bold text-zinc-600 transition hover:bg-zinc-100"
                  >
                    Mostrar {alertasFiltradas.length - ALERTAS_INICIALES} más
                  </button>
                )}
                {mostrarTodasAlertas && alertasFiltradas.length > ALERTAS_INICIALES && (
                  <button
                    type="button"
                    onClick={() => setMostrarTodasAlertas(false)}
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 text-xs font-bold text-zinc-600 transition hover:bg-zinc-100"
                  >
                    Mostrar menos
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </section>

      <PublicSearchChatbot />

      <div
        id="tour-filters"
        className="-mx-4 mb-8 bg-zinc-50 px-4 py-4 sm:mx-0 sm:rounded-2xl sm:border sm:border-zinc-200 sm:bg-white sm:p-6 sm:shadow-xl sm:shadow-zinc-200/50"
      >
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-500 sm:text-xs">
          Buscar centros registrados
        </h2>
        {errors.length === 0 && estados.length === 0 ? (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            No se recibieron estados desde Supabase. Verifica que la tabla tenga
            datos y que las políticas de lectura permitan consultar la data
            geográfica.
          </p>
        ) : null}
        <form action="/centros" method="get">
          <label
            htmlFor="busqueda-centros"
            className="mb-1.5 block text-sm font-bold uppercase tracking-wider text-zinc-800"
          >
            Buscar por texto
          </label>
          <input
            id="busqueda-centros"
            name="q"
            type="search"
            defaultValue={initialFilters.q}
            placeholder="Nombre, dirección o teléfono"
            className="mb-4 w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-base font-medium text-zinc-900 shadow-sm focus:border-zinc-900 focus:outline-none"
          />
          <FiltroGeografico
            estados={estados}
            municipios={municipios}
            estadoId={estadoId}
            municipioId={municipioId}
            estadoName="estado"
            municipioName="municipio"
            onEstadoChange={handleEstadoChange}
            onMunicipioChange={setMunicipioId}
          />
          <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-zinc-900">
              {centros.length}{" "}
              <span className="font-medium text-zinc-500">
                {centros.length === 1 ? "centro encontrado" : "centros encontrados"}
                {textoResultados}
              </span>
            </p>
            <div className="flex gap-2">
              <Link
                href="/centros"
                className="cta-secondary rounded-lg border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-700"
              >
                Limpiar
              </Link>
              <button
                type="submit"
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-900"
              >
                Buscar
              </button>
            </div>
          </div>
          {searchMeta.reachedLimit ? (
            <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Hay más de {searchMeta.limit} resultados. Refina la búsqueda por
              texto, estado o municipio para cargar menos datos.
            </p>
          ) : null}
        </form>
      </div>

      <section id="tour-results" aria-live="polite" className="space-y-2">
        {grupos.length === 0 ? (
          <p className="rounded border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            No hay centros registrados en Supabase para esta ubicación.
          </p>
        ) : (
          grupos.map((grupo) => (
            <CentroGrupoEstado
              key={grupo.estadoId}
              nombreEstado={grupo.nombre}
              centros={grupo.centros}
              semaforo={grupo.semaforo}
              alertasPorCentro={alertasPorCentro}
              defaultOpen={grupo.defaultOpen}
            />
          ))
        )}
      </section>

      <footer
        id="tour-share"
        className="mt-8 space-y-2 border-t border-zinc-200 pt-4 text-xs leading-relaxed text-zinc-500"
      >
        <p>
          Comparte centros por SMS/WhatsApp con el botón de copiar en cada
          tarjeta.
        </p>
        <p>
          La información mostrada es suministrada por usuarios de la aplicación.
          Verifica los datos directamente con cada centro antes de movilizar
          donaciones o tomar decisiones críticas.
        </p>
      </footer>
    </>
  );
}
