"use client";

import Link from "next/link";
import { useState } from "react";
import { CentroGrupoEstado } from "@/components/CentroGrupoEstado";
import { FiltroGeografico } from "@/components/FiltroGeografico";
import { PublicSearchChatbot } from "@/components/chatbots/PublicSearchChatbot";
import {
  ALERTA_UI_CONFIG,
  agruparAlertasActivasPorCentro,
  agruparAlertasPorCentro,
  calcularSemaforoDesdeAlertas,
  filtrarAlertasActivas,
  splitVisibleAlertasByTipo,
} from "@/lib/alertas";
import { formatWhatsappHref } from "@/lib/contact-links";
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

function getUniqueAlertMessages(alertas: AlertaCentro[]): string[] {
  const seen = new Set<string>();
  const messages: string[] = [];
  for (const alerta of alertas) {
    const key = alerta.mensaje.trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    messages.push(alerta.mensaje);
  }
  return messages;
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

const ALERTAS_INICIALES = 4;

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
  const [mostrarTodasUrgentes, setMostrarTodasUrgentes] = useState(false);
  const [mostrarTodasSaturadas, setMostrarTodasSaturadas] = useState(false);
  const [alertasColapsadas, setAlertasColapsadas] = useState(false);

  const alertasActivas = filtrarAlertasActivas(alertas);
  const alertasPorCentro = agruparAlertasActivasPorCentro(alertasActivas);

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

  // With an active filter: only show alerts for the centers in view.
  // Without a filter: show all recent active alerts so nothing is hidden.
  const centroIdsEnVista = new Set(centros.map((c) => c.id));
  const alertasFiltradas = hayFiltroActivo
    ? alertasActivas.filter((a) => centroIdsEnVista.has(a.centro_id))
    : alertasActivas;
  const { urgentes: alertasUrgentesFiltradas, saturadas: alertasSaturadasFiltradas } =
    splitVisibleAlertasByTipo(alertasFiltradas);
  const urgentesAgrupadas = agruparAlertasPorCentro(alertasUrgentesFiltradas);
  const saturadasAgrupadas = agruparAlertasPorCentro(alertasSaturadasFiltradas);
  const urgentesVisibles = mostrarTodasUrgentes
    ? urgentesAgrupadas
    : urgentesAgrupadas.slice(0, ALERTAS_INICIALES);
  const saturadasVisibles = mostrarTodasSaturadas
    ? saturadasAgrupadas
    : saturadasAgrupadas.slice(0, ALERTAS_INICIALES);
  const hayMasUrgentes = urgentesAgrupadas.length > ALERTAS_INICIALES;
  const hayMasSaturadas = saturadasAgrupadas.length > ALERTAS_INICIALES;
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
        className="mb-8"
      >
        {/* Header — siempre visible, toca para colapsar */}
        <button
          type="button"
          onClick={() => setAlertasColapsadas((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-1 py-1.5 text-left"
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
          <div id="alertas-body" className="mt-3">
            {alertasFiltradas.length === 0 ? (
              <p className="rounded-lg border border-zinc-100 bg-zinc-50 p-3 text-center text-sm text-zinc-500">
                {hayFiltroActivo
                  ? "No hay alertas activas para los centros de esta zona."
                  : "No hay alertas activas en este momento."}
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                <article className="rounded-xl border-2 border-red-300 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wide text-red-900">
                      Solicitudes urgentes
                    </h3>
                    <span className="rounded-full border-2 border-red-300 bg-white px-2 py-0.5 text-xs font-bold text-red-800">
                      {alertasUrgentesFiltradas.length}
                    </span>
                  </div>
                  {alertasUrgentesFiltradas.length === 0 ? (
                    <p className="rounded-lg border border-red-200 p-3 text-xs text-zinc-600">
                      No hay solicitudes urgentes ahora.
                    </p>
                  ) : (
                    <>
                      <ul className="divide-y divide-zinc-200">
                        {urgentesVisibles.map((grupo) => {
                          const ui = ALERTA_UI_CONFIG["NECESIDAD_URGENTE"];
                          const centro = grupo.centro;
                          const mensajes = getUniqueAlertMessages(grupo.alertas);
                          return (
                            <li key={grupo.centroId} className="py-2 first:pt-0 last:pb-0">
                              <div className="flex items-center gap-2">
                                <span aria-hidden className="shrink-0 text-sm">
                                  {ui.icon}
                                </span>
                                <p className="min-w-0 truncate text-xs font-bold">
                                  {centro?.nombre ?? "Centro sin nombre"}
                                </p>
                                <span className="rounded-full border border-red-300 px-1.5 py-0.5 text-[10px] font-bold text-red-800">
                                  {grupo.alertas.length}
                                </span>
                                <span className="ml-auto shrink-0 text-[11px] font-semibold opacity-60">
                                  {formatAlertTime(grupo.latestCreatedAt)}
                                </span>
                              </div>
                              <ul className="mt-1 space-y-0.5">
                                {mensajes.map((mensaje) => (
                                  <li key={mensaje} className="text-xs leading-snug text-zinc-700">
                                    - {mensaje}
                                  </li>
                                ))}
                              </ul>
                              {centro?.contacto || centro?.ubicacion_url ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {centro.contacto ? (
                                    <a
                                      href={formatWhatsappHref(centro.contacto)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-md border border-emerald-300 bg-white px-2 py-1 text-[11px] font-bold text-emerald-800"
                                    >
                                      WhatsApp
                                    </a>
                                  ) : null}
                                  {centro.ubicacion_url ? (
                                    <a
                                      href={centro.ubicacion_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-md border border-blue-300 bg-white px-2 py-1 text-[11px] font-bold text-blue-800"
                                    >
                                      Ver mapa
                                    </a>
                                  ) : null}
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                      {hayMasUrgentes ? (
                        <button
                          type="button"
                          onClick={() => setMostrarTodasUrgentes((v) => !v)}
                          className="mt-2 w-full rounded-lg border border-red-200 bg-white py-2 text-xs font-bold text-red-800"
                        >
                          {mostrarTodasUrgentes
                            ? "Mostrar menos"
                            : `Mostrar ${urgentesAgrupadas.length - ALERTAS_INICIALES} más`}
                        </button>
                      ) : null}
                    </>
                  )}
                </article>

                <article className="rounded-xl border-2 border-emerald-300 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-xs font-black uppercase tracking-wide text-emerald-900">
                      Centros saturados
                    </h3>
                    <span className="rounded-full border-2 border-emerald-300 bg-white px-2 py-0.5 text-xs font-bold text-emerald-800">
                      {alertasSaturadasFiltradas.length}
                    </span>
                  </div>
                  {alertasSaturadasFiltradas.length === 0 ? (
                    <p className="rounded-lg border border-emerald-200 p-3 text-xs text-zinc-600">
                      Ningún centro reporta saturación en este momento.
                    </p>
                  ) : (
                    <>
                      <ul className="divide-y divide-zinc-200">
                        {saturadasVisibles.map((grupo) => {
                          const ui = ALERTA_UI_CONFIG["INSUMO_SATURADO"];
                          const centro = grupo.centro;
                          const mensajes = getUniqueAlertMessages(grupo.alertas);
                          return (
                            <li key={grupo.centroId} className="py-2 first:pt-0 last:pb-0">
                              <div className="flex items-center gap-2">
                                <span aria-hidden className="shrink-0 text-sm">
                                  {ui.icon}
                                </span>
                                <p className="min-w-0 truncate text-xs font-bold">
                                  {centro?.nombre ?? "Centro sin nombre"}
                                </p>
                                <span className="rounded-full border border-emerald-300 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                  {grupo.alertas.length}
                                </span>
                                <span className="ml-auto shrink-0 text-[11px] font-semibold opacity-60">
                                  {formatAlertTime(grupo.latestCreatedAt)}
                                </span>
                              </div>
                              <ul className="mt-1 space-y-0.5">
                                {mensajes.map((mensaje) => (
                                  <li key={mensaje} className="text-xs leading-snug text-zinc-700">
                                    - {mensaje}
                                  </li>
                                ))}
                              </ul>
                              {centro?.contacto || centro?.ubicacion_url ? (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {centro.contacto ? (
                                    <a
                                      href={formatWhatsappHref(centro.contacto)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-md border border-emerald-300 bg-white px-2 py-1 text-[11px] font-bold text-emerald-800"
                                    >
                                      WhatsApp
                                    </a>
                                  ) : null}
                                  {centro.ubicacion_url ? (
                                    <a
                                      href={centro.ubicacion_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded-md border border-blue-300 bg-white px-2 py-1 text-[11px] font-bold text-blue-800"
                                    >
                                      Ver mapa
                                    </a>
                                  ) : null}
                                </div>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                      {hayMasSaturadas ? (
                        <button
                          type="button"
                          onClick={() => setMostrarTodasSaturadas((v) => !v)}
                          className="mt-2 w-full rounded-lg border border-emerald-200 bg-white py-2 text-xs font-bold text-emerald-800"
                        >
                          {mostrarTodasSaturadas
                            ? "Mostrar menos"
                            : `Mostrar ${saturadasAgrupadas.length - ALERTAS_INICIALES} más`}
                        </button>
                      ) : null}
                    </>
                  )}
                </article>
              </div>
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
              {hayFiltroActivo ? (
                <Link
                  href="/centros"
                  className="cta-secondary rounded-lg border border-zinc-300 px-4 py-2 text-sm font-bold text-zinc-700"
                >
                  Limpiar
                </Link>
              ) : null}
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
