import Link from "next/link";
import { ActionFeedback } from "@/components/ActionFeedback";
import { ModeracionFormContext } from "@/components/ModeracionFormContext";
import {
  getCategoriasInsumo,
  getCentrosParaModeracion,
  getResumenModeracion,
} from "@/lib/data";
import {
  getModeratorAccessToken,
  isModeratorTokenValid,
} from "@/lib/moderacion-auth";
import {
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/supabase";
import {
  SEMAFORO_DOT,
  SEMAFORO_LABELS,
  calcularSemafaro,
} from "@/lib/semaforo";
import type { SemafaroEstado } from "@/lib/types";
import {
  agregarNecesidadModeracion,
  actualizarDetallesCentroModeracion,
  actualizarUrgencia,
  actualizarVerificacion,
  eliminarNecesidadModeracion,
  mostrarCentro,
  ocultarCentro,
} from "@/app/moderacion/actions";

export const revalidate = 15;

interface ModeracionPageProps {
  searchParams: Promise<{
    token?: string;
    q?: string;
    estatus?: string;
    verificacion?: string;
    page?: string;
    ok?: string;
    error?: string;
  }>;
}

const ESTATUS_OPTIONS = [
  { value: "todos", label: "Todos los estatus" },
  { value: "sin_verificar", label: "Sin verificar" },
  { value: "activo", label: "Activos" },
  { value: "saturado", label: "Saturados" },
  { value: "cerrado", label: "Ocultos" },
];

const VERIFICACION_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "pendientes", label: "Pendientes" },
  { value: "verificados", label: "Verificados" },
];

function getEstatusLabel(estatus?: string): string {
  if (estatus === "cerrado") return "Oculto";
  if (estatus === "sin_verificar") return "Sin verificar";
  if (estatus === "saturado") return "Saturado";
  return "Activo";
}

function getEstatusClass(estatus?: string): string {
  if (estatus === "cerrado") return "bg-zinc-200 text-zinc-800";
  if (estatus === "sin_verificar") return "bg-amber-100 text-amber-900";
  if (estatus === "saturado") return "bg-emerald-100 text-emerald-900";
  return "bg-blue-100 text-blue-800";
}

export default async function ModeracionPage({
  searchParams,
}: ModeracionPageProps) {
  const PAGE_SIZE = 60;
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const textoFiltro = params.q?.trim().toLowerCase() ?? "";
  const estatusFiltro = params.estatus ?? "todos";
  const verificacionFiltro = params.verificacion ?? "todos";
  const page =
    Number.isFinite(Number(params.page)) && Number(params.page) > 0
      ? Math.floor(Number(params.page))
      : 1;
  const hasToken = Boolean(getModeratorAccessToken());
  const hasSupabaseService = isSupabaseServiceConfigured();
  const isAuthorized = isModeratorTokenValid(token);
  const [centrosResponse, resumen, categoriasInsumo] =
    isAuthorized && hasSupabaseService
      ? await Promise.all([
          getCentrosParaModeracion({
            q: textoFiltro,
            estatus: estatusFiltro,
            verificacion: verificacionFiltro,
            page: page - 1,
            pageSize: PAGE_SIZE,
          }),
          getResumenModeracion(),
          getCategoriasInsumo(),
        ])
      : [
          {
            centros: [],
            meta: {
              page: 0,
              pageSize: PAGE_SIZE,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          {
            total: 0,
            visibles: 0,
            pendientes: 0,
            verificados: 0,
            ocultos: 0,
            urgencias: 0,
          },
          [],
        ];
  const centros = centrosResponse.centros;
  const meta = centrosResponse.meta;
  const centrosVisibles = centros.filter((centro) => centro.estatus !== "cerrado");
  const centrosPendientes = centrosVisibles.filter((centro) => !centro.verificado);
  const centrosConNecesidades = centrosVisibles.filter(
    (centro) => (centro.necesidades ?? []).length > 0,
  );
  const necesidadesUrgentes = centrosVisibles.reduce(
    (total, centro) =>
      total +
      (centro.necesidades ?? []).filter(
        (necesidad) => necesidad.urgencia === "URGENTE",
      ).length,
    0,
  );
  const centrosSinNecesidades = centrosVisibles.filter(
    (centro) => (centro.necesidades ?? []).length === 0,
  ).length;
  const tasaVerificacion =
    resumen.visibles > 0
      ? Math.round((resumen.verificados / resumen.visibles) * 100)
      : 0;
  const municipiosPendientes = Array.from(
    centrosPendientes
      .reduce((map, centro) => {
        const nombre = centro.municipios?.nombre ?? "Sin municipio";
        map.set(nombre, (map.get(nombre) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
      .entries(),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const insumosUrgentes = Array.from(
    centrosVisibles
      .flatMap((centro) => centro.necesidades ?? [])
      .filter((necesidad) => necesidad.urgencia === "URGENTE")
      .reduce((map, necesidad) => {
        map.set(necesidad.tipo_insumo, (map.get(necesidad.tipo_insumo) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
      .entries(),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const centrosFiltrados = centros;
  const paginationParams = new URLSearchParams();
  paginationParams.set("token", token);
  if (textoFiltro) paginationParams.set("q", textoFiltro);
  if (estatusFiltro && estatusFiltro !== "todos") {
    paginationParams.set("estatus", estatusFiltro);
  }
  if (verificacionFiltro && verificacionFiltro !== "todos") {
    paginationParams.set("verificacion", verificacionFiltro);
  }
  const prevHref = `/moderacion?${new URLSearchParams({
    ...Object.fromEntries(paginationParams.entries()),
    page: String(Math.max(1, page - 1)),
  }).toString()}`;
  const nextHref = `/moderacion?${new URLSearchParams({
    ...Object.fromEntries(paginationParams.entries()),
    page: String(page + 1),
  }).toString()}`;
  const clearHref = `/moderacion?${new URLSearchParams({ token }).toString()}`;
  const formContext = {
    token,
    q: textoFiltro,
    estatus: estatusFiltro,
    verificacion: verificacionFiltro,
    page,
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6">
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <p className="text-sm font-bold uppercase tracking-wide text-blue-800">
          Panel de moderación
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-900">
          Dashboard de centros de acopio
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Revisa centros nuevos, verifica información y ajusta necesidades
          reportadas.
        </p>
        <Link href="/" className="cta-secondary mt-3 inline-block text-sm font-semibold">
          Volver a la vista pública
        </Link>
      </header>

      {!isSupabaseConfigured() ? (
        <section className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Configura Supabase antes de usar moderación.
        </section>
      ) : null}

      {!hasSupabaseService ? (
        <section className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Falta <code>SUPABASE_SERVICE_ROLE_KEY</code>. Es necesaria para ver y
          verificar centros pendientes.
        </section>
      ) : null}

      {!hasToken ? (
        <section className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          Define <code>MODERADOR_ACCESS_TOKEN</code> en el servidor. También se
          acepta <code>MODERADOR_ACCES_TOKEN</code> por compatibilidad.
        </section>
      ) : null}

      {!isAuthorized ? (
        <section className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-black text-zinc-900">
            Acceso de moderador
          </h2>
          <p className="mb-5 text-sm leading-relaxed text-zinc-600">
            Ingresa la clave para entrar al dashboard.
          </p>
          <form method="get" className="space-y-3">
            <label htmlFor="token" className="block text-sm font-bold">
              Clave de acceso
            </label>
            <input
              id="token"
              type="password"
              name="token"
              placeholder="Clave privada"
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-3 text-base"
              required
            />
            <button
              type="submit"
              className="cta-primary w-full rounded-lg bg-blue-800 px-4 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-900"
            >
              Entrar al dashboard
            </button>
          </form>
        </section>
      ) : (
        <section className="space-y-6">
          <ActionFeedback ok={params.ok} error={params.error} />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">
                Total
              </p>
              <p className="mt-2 text-3xl font-black text-zinc-900">
                {resumen.total}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                Visibles
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-900">
                {resumen.visibles}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Pendientes
              </p>
              <p className="mt-2 text-3xl font-black text-amber-900">
                {resumen.pendientes}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-800">
                Verificados
              </p>
              <p className="mt-2 text-3xl font-black text-blue-900">
                {resumen.verificados}
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-red-800">
                Urgencias
              </p>
              <p className="mt-2 text-3xl font-black text-red-900">
                {resumen.urgencias}
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-300 bg-zinc-100 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-600">
                Ocultos
              </p>
              <p className="mt-2 text-3xl font-black text-zinc-900">
                {resumen.ocultos}
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wide text-zinc-700">
                Salud del directorio
              </h2>
              <p className="mt-3 text-3xl font-black text-zinc-900">
                {tasaVerificacion}%
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                de centros visibles están verificados.
              </p>
              <p className="mt-3 text-sm text-zinc-600">
                Centros con necesidades reportadas:{" "}
                <strong>{centrosConNecesidades.length}</strong>. Sin necesidades:
                {" "}
                <strong>{centrosSinNecesidades}</strong>.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wide text-zinc-700">
                Foco territorial
              </h2>
              {municipiosPendientes.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                  {municipiosPendientes.map(([municipio, total]) => (
                    <li key={municipio} className="flex justify-between gap-3">
                      <span>{municipio}</span>
                      <strong>{total} pendiente{total === 1 ? "" : "s"}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">
                  No hay centros pendientes por municipio.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wide text-zinc-700">
                Insumos críticos
              </h2>
              {insumosUrgentes.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                  {insumosUrgentes.map(([insumo, total]) => (
                    <li key={insumo} className="flex justify-between gap-3">
                      <span>{insumo}</span>
                      <strong>{total} urgente{total === 1 ? "" : "s"}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">
                  No hay insumos marcados como urgentes.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950 shadow-sm">
            <h2 className="mb-2 font-black uppercase tracking-wide">
              Conclusión rápida
            </h2>
            <p>
              Prioriza verificar los <strong>{centrosPendientes.length}</strong>{" "}
              centros pendientes, revisar los <strong>{necesidadesUrgentes}</strong>{" "}
              insumos urgentes y completar información de los{" "}
              <strong>{centrosSinNecesidades}</strong> centros sin necesidades
              reportadas en esta página de resultados.
            </p>
          </div>

          <form
            method="get"
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="page" value="1" />
            <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-700">
              Filtrar centros
            </h2>
            <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
              <label className="text-sm font-bold text-zinc-700">
                Buscar
                <input
                  name="q"
                  type="search"
                  defaultValue={params.q ?? ""}
                  placeholder="Nombre, dirección, responsable, horario..."
                  className="mt-1 w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2 text-base"
                />
              </label>

              <label className="text-sm font-bold text-zinc-700">
                Estatus
                <select
                  name="estatus"
                  defaultValue={estatusFiltro}
                  className="mt-1 w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2 text-base"
                >
                  {ESTATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-bold text-zinc-700">
                Verificación
                <select
                  name="verificacion"
                  defaultValue={verificacionFiltro}
                  className="mt-1 w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2 text-base"
                >
                  {VERIFICACION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="submit"
                className="self-end rounded-lg bg-blue-800 px-4 py-2.5 text-base font-bold text-white shadow-sm hover:bg-blue-900"
              >
                Aplicar
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-600">
              <p>
                Mostrando <strong>{centrosFiltrados.length}</strong> centros en la
                página <strong>{page}</strong>.
              </p>
              <Link href={clearHref} className="text-sm font-bold text-zinc-700 underline">
                Limpiar filtros
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Link
                href={prevHref}
                aria-disabled={!meta.hasPrevPage}
                className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${
                  meta.hasPrevPage
                    ? "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
                    : "pointer-events-none border-zinc-200 bg-zinc-100 text-zinc-400"
                }`}
              >
                ← Anterior
              </Link>
              <Link
                href={nextHref}
                aria-disabled={!meta.hasNextPage}
                className={`rounded-lg border px-3 py-1.5 text-sm font-bold ${
                  meta.hasNextPage
                    ? "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
                    : "pointer-events-none border-zinc-200 bg-zinc-100 text-zinc-400"
                }`}
              >
                Siguiente →
              </Link>
              {meta.hasNextPage ? (
                <span className="text-xs text-zinc-500">
                  Hay más resultados disponibles.
                </span>
              ) : null}
            </div>
          </form>

          {centrosFiltrados.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm">
              No hay centros que coincidan con este filtro.
            </p>
          ) : (
            centrosFiltrados.map((centro) => {
              const semaforo: SemafaroEstado = calcularSemafaro(
                centro.necesidades ?? [],
              );
              const estaOculto = centro.estatus === "cerrado";

              return (
                <article
                  key={centro.id}
                  className={`rounded-2xl border bg-white p-4 shadow-sm ${
                    estaOculto
                      ? "border-zinc-300 bg-zinc-50 opacity-90"
                      : centro.verificado
                      ? "border-blue-200"
                      : "border-amber-300 ring-1 ring-amber-100"
                  }`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-zinc-900">
                          {centro.nombre}
                        </h2>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            centro.verificado
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-900"
                          }`}
                        >
                          {centro.verificado ? "Verificado" : "Pendiente"}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-bold ${getEstatusClass(centro.estatus)}`}
                        >
                          {getEstatusLabel(centro.estatus)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-600">
                        {centro.municipios?.nombre ?? "Sin municipio"} ·{" "}
                        {centro.direccion}
                      </p>
                      {centro.fecha_inicio_recepcion ||
                      centro.fecha_fin_recepcion ||
                      centro.horario_recepcion ? (
                        <p className="mt-1 text-xs font-semibold text-zinc-700">
                          {centro.fecha_inicio_recepcion || centro.fecha_fin_recepcion
                            ? `Recepción: ${centro.fecha_inicio_recepcion ?? "..."} a ${centro.fecha_fin_recepcion ?? "..."}`
                            : null}
                          {centro.horario_recepcion
                            ? `${centro.fecha_inicio_recepcion || centro.fecha_fin_recepcion ? " · " : ""}Horario: ${centro.horario_recepcion}`
                            : null}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span
                        aria-hidden
                        className={`inline-block h-3 w-3 rounded-full ${SEMAFORO_DOT[semaforo]}`}
                      />
                      {SEMAFORO_LABELS[semaforo]}
                    </div>
                  </div>

                  {!estaOculto ? (
                    <details className="mb-4 rounded-xl border border-zinc-200 bg-zinc-50">
                      <summary className="cursor-pointer px-3 py-2 text-sm font-black uppercase tracking-wide text-zinc-700">
                        Administrar datos del centro
                      </summary>
                      <form
                        action={actualizarDetallesCentroModeracion}
                        className="grid gap-3 border-t border-zinc-200 p-3"
                      >
                        <ModeracionFormContext {...formContext} />
                        <input type="hidden" name="centroId" value={centro.id} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-sm font-bold text-zinc-700">
                            Nombre
                            <input
                              name="nombre"
                              defaultValue={centro.nombre}
                              required
                              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="text-sm font-bold text-zinc-700">
                            Contacto público
                            <input
                              name="contacto"
                              defaultValue={centro.contacto ?? ""}
                              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                        </div>
                        <label className="text-sm font-bold text-zinc-700">
                          Dirección
                          <input
                            name="direccion"
                            defaultValue={centro.direccion}
                            required
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-sm font-bold text-zinc-700">
                          Link de ubicación en Maps
                          <input
                            name="ubicacion_url"
                            type="url"
                            defaultValue={centro.ubicacion_url ?? ""}
                            placeholder="https://maps.google.com/..."
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                          />
                        </label>
                        <label className="text-sm font-bold text-zinc-700">
                          Estado de vialidad
                          <input
                            name="vialidad"
                            defaultValue={centro.estado_vialidad ?? ""}
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                          />
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-sm font-bold text-zinc-700">
                            Fecha inicio de recepción
                            <input
                              name="fecha_inicio_recepcion"
                              type="date"
                              defaultValue={centro.fecha_inicio_recepcion ?? ""}
                              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="text-sm font-bold text-zinc-700">
                            Fecha fin de recepción
                            <input
                              name="fecha_fin_recepcion"
                              type="date"
                              defaultValue={centro.fecha_fin_recepcion ?? ""}
                              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                        </div>
                        <label className="text-sm font-bold text-zinc-700">
                          Horario de recepción
                          <input
                            name="horario_recepcion"
                            defaultValue={centro.horario_recepcion ?? ""}
                            placeholder="Ej. Lunes a sábado 8:00 a.m. a 5:00 p.m."
                            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                          />
                        </label>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-sm font-bold text-zinc-700">
                            Responsable
                            <input
                              name="responsable_nombre"
                              defaultValue={centro.responsable_nombre ?? ""}
                              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="text-sm font-bold text-zinc-700">
                            Tel. responsable
                            <input
                              name="responsable_telefono"
                              defaultValue={centro.responsable_telefono ?? ""}
                              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                        </div>
                        <button
                          type="submit"
                          className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-bold text-white sm:w-auto"
                        >
                          Guardar datos del centro
                        </button>
                      </form>
                    </details>
                  ) : null}

                  <div className="mb-4 flex flex-wrap gap-2">
                    {!estaOculto ? (
                      <>
                        <form action={actualizarVerificacion}>
                          <ModeracionFormContext {...formContext} />
                          <input type="hidden" name="centroId" value={centro.id} />
                          <input
                            type="hidden"
                            name="verificado"
                            value={centro.verificado ? "false" : "true"}
                          />
                          <button
                            type="submit"
                            className={`rounded-lg px-3 py-2 text-sm font-bold ${
                              centro.verificado
                                ? "border border-zinc-300 bg-white text-zinc-800"
                                : "bg-blue-800 text-white shadow-sm hover:bg-blue-900"
                            }`}
                          >
                            {centro.verificado
                              ? "Marcar como pendiente"
                              : "Aprobar centro"}
                          </button>
                        </form>

                        <form action={ocultarCentro}>
                          <ModeracionFormContext {...formContext} />
                          <input type="hidden" name="centroId" value={centro.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-800 hover:bg-red-100"
                          >
                            Ocultar centro
                          </button>
                        </form>
                      </>
                    ) : (
                      <form action={mostrarCentro}>
                        <ModeracionFormContext {...formContext} />
                        <input type="hidden" name="centroId" value={centro.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
                        >
                          Volver a mostrar
                        </button>
                      </form>
                    )}
                  </div>

                  {!estaOculto ? (
                    <form
                      action={agregarNecesidadModeracion}
                      className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-3"
                    >
                      <ModeracionFormContext {...formContext} />
                      <input type="hidden" name="centroId" value={centro.id} />
                      <p className="mb-3 text-sm font-black uppercase tracking-wide text-blue-900">
                        Agregar insumo
                      </p>
                      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                        <select
                          name="categoriaId"
                          className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold"
                          required
                        >
                          <option value="">Selecciona insumo</option>
                          {categoriasInsumo.map((categoria) => (
                            <option key={categoria.id} value={categoria.id}>
                              {categoria.nombre}
                            </option>
                          ))}
                        </select>
                        <select
                          name="urgencia"
                          defaultValue="MEDIA"
                          className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold"
                        >
                          <option value="URGENTE">Urgente</option>
                          <option value="MEDIA">Media</option>
                          <option value="SATURADO">Saturado</option>
                        </select>
                        <button
                          type="submit"
                          className="rounded-lg bg-blue-800 px-3 py-2 text-sm font-bold text-white"
                        >
                          Agregar
                        </button>
                      </div>
                      <input
                        name="detalle"
                        placeholder="Detalle opcional: cantidad, presentación, prioridad..."
                        className="mt-2 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm"
                      />
                    </form>
                  ) : null}

                  {(centro.necesidades ?? []).length === 0 ? (
                    <p className="text-sm text-zinc-600">
                      Sin necesidades registradas.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {(centro.necesidades ?? []).map((necesidad) => (
                        <li
                          key={necesidad.id}
                          className="rounded border border-zinc-100 bg-zinc-50 p-3"
                        >
                          <p className="mb-2 text-sm">
                            <strong>{necesidad.tipo_insumo}</strong>
                            {necesidad.detalle ? `: ${necesidad.detalle}` : ""}
                          </p>
                          <form
                            action={actualizarUrgencia}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <ModeracionFormContext {...formContext} />
                            <input
                              type="hidden"
                              name="necesidadId"
                              value={necesidad.id}
                            />
                            <label htmlFor={`urgencia-${necesidad.id}`} className="text-sm">
                              Urgencia
                            </label>
                            <select
                              id={`urgencia-${necesidad.id}`}
                              name="urgencia"
                              defaultValue={necesidad.urgencia}
                              className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm"
                            >
                              <option value="URGENTE">URGENTE</option>
                              <option value="MEDIA">MEDIA</option>
                              <option value="SATURADO">SATURADO</option>
                            </select>
                            <button
                              type="submit"
                              className="rounded bg-zinc-900 px-3 py-1 text-sm text-white"
                            >
                              Guardar
                            </button>
                          </form>
                          <form action={eliminarNecesidadModeracion}>
                            <ModeracionFormContext {...formContext} />
                            <input type="hidden" name="centroId" value={centro.id} />
                            <input
                              type="hidden"
                              name="necesidadId"
                              value={necesidad.id}
                            />
                            <button
                              type="submit"
                              className="rounded border border-red-200 bg-red-50 px-3 py-1 text-sm font-bold text-red-800"
                            >
                              Quitar
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
