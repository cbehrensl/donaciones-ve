import Link from "next/link";
import { SnackbarForm } from "@/components/SnackbarForm";
import { SnackbarShell } from "@/components/SnackbarShell";
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
  const PAGE_SIZE = 20;
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
        <div className="mt-3 flex gap-3">
          <Link href="/" className="cta-secondary inline-block text-sm font-semibold">
            Volver a la vista pública
          </Link>
          <Link href="/admin/donations" className="cta-secondary inline-block text-sm font-semibold">
            Gestionar Links de Donaciones
          </Link>
        </div>
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
        <SnackbarShell>
        <section className="space-y-6">
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-6 lg:gap-3">
            <div className="rounded-xl border border-zinc-200 bg-white px-3 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Total
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-zinc-900 lg:text-3xl">
                {resumen.total}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Visibles
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-emerald-900 lg:text-3xl">
                {resumen.visibles}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Pendientes
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-amber-900 lg:text-3xl">
                {resumen.pendientes}
              </p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Verificados
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-blue-900 lg:text-3xl">
                {resumen.verificados}
              </p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                Urgencias
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-red-900 lg:text-3xl">
                {resumen.urgencias}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Ocultos
              </p>
              <p className="mt-1 text-2xl font-black tabular-nums text-zinc-700 lg:text-3xl">
                {resumen.ocultos}
              </p>
            </div>
          </div>

          <details className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-black uppercase tracking-wide text-zinc-700">
              <span>Resumen e insights</span>
              <span className="text-xs font-semibold normal-case tracking-normal text-zinc-500">
                {tasaVerificacion}% verificado · {necesidadesUrgentes} urgentes · {centrosPendientes.length} pendientes
              </span>
            </summary>
            <div className="grid gap-4 border-t border-zinc-100 p-4 lg:grid-cols-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Salud del directorio
                </h3>
                <p className="mt-2 text-2xl font-black text-zinc-900">
                  {tasaVerificacion}%
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  verificados. Con necesidades:{" "}
                  <strong>{centrosConNecesidades.length}</strong>. Sin:{" "}
                  <strong>{centrosSinNecesidades}</strong>.
                </p>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Foco territorial
                </h3>
                {municipiosPendientes.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                    {municipiosPendientes.map(([municipio, total]) => (
                      <li key={municipio} className="flex justify-between gap-2">
                        <span>{municipio}</span>
                        <strong className="text-amber-800">{total}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500">Sin pendientes.</p>
                )}
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wide text-zinc-500">
                  Insumos críticos
                </h3>
                {insumosUrgentes.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                    {insumosUrgentes.map(([insumo, total]) => (
                      <li key={insumo} className="flex justify-between gap-2">
                        <span>{insumo}</span>
                        <strong className="text-red-700">{total}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-zinc-500">Sin urgentes.</p>
                )}
              </div>
            </div>
          </details>

          <form
            method="get"
            className="sticky top-0 z-10 rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-sm backdrop-blur-sm"
          >
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="page" value="1" />
            <div className="grid gap-2 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
              <input
                name="q"
                type="search"
                defaultValue={params.q ?? ""}
                placeholder="Buscar nombre, dirección, responsable..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              />
              <select
                name="estatus"
                defaultValue={estatusFiltro}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                {ESTATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                name="verificacion"
                defaultValue={verificacionFiltro}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                {VERIFICACION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg bg-blue-800 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-900"
              >
                Filtrar
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
              <div className="flex items-center gap-3">
                <span>
                  <strong className="text-zinc-700">{centrosFiltrados.length}</strong> centros · pág. <strong className="text-zinc-700">{page}</strong>
                </span>
                <Link href={clearHref} className="font-semibold text-blue-700 hover:underline">
                  Limpiar
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={prevHref}
                  aria-disabled={!meta.hasPrevPage}
                  className={`rounded-md border px-2.5 py-1 text-xs font-bold ${
                    meta.hasPrevPage
                      ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                      : "pointer-events-none border-zinc-100 text-zinc-300"
                  }`}
                >
                  ←
                </Link>
                <Link
                  href={nextHref}
                  aria-disabled={!meta.hasNextPage}
                  className={`rounded-md border px-2.5 py-1 text-xs font-bold ${
                    meta.hasNextPage
                      ? "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
                      : "pointer-events-none border-zinc-100 text-zinc-300"
                  }`}
                >
                  →
                </Link>
              </div>
            </div>
          </form>

          {centrosFiltrados.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-500">
              No hay centros que coincidan con este filtro.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-white shadow-sm">
            {centrosFiltrados.map((centro) => {
              const semaforo: SemafaroEstado = calcularSemafaro(
                centro.necesidades ?? [],
              );
              const estaOculto = centro.estatus === "cerrado";
              const necesidades = centro.necesidades ?? [];
              const urgentCount = necesidades.filter(n => n.urgencia === "URGENTE").length;

              return (
                <article
                  key={centro.id}
                  className={`${estaOculto ? "bg-zinc-50/50" : ""}`}
                >
                  {/* Compact header row — always visible */}
                  <div className="flex flex-wrap items-start gap-x-3 gap-y-1 px-4 py-3">
                    <span
                      aria-hidden
                      className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${SEMAFORO_DOT[semaforo]}`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h2 className={`text-sm font-bold ${estaOculto ? "text-zinc-400 line-through" : "text-zinc-900"}`}>
                          {centro.nombre}
                        </h2>
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                            centro.verificado
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {centro.verificado ? "Verificado" : "Pendiente"}
                        </span>
                        <span
                          className={`inline-flex rounded px-1.5 py-0.5 text-[10px] font-bold leading-none ${getEstatusClass(centro.estatus)}`}
                        >
                          {getEstatusLabel(centro.estatus)}
                        </span>
                        {urgentCount > 0 ? (
                          <span className="inline-flex rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-red-700">
                            {urgentCount} urgente{urgentCount > 1 ? "s" : ""}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {centro.municipios?.nombre ?? "Sin municipio"} · {centro.direccion}
                        {centro.horario_recepcion ? ` · ${centro.horario_recepcion}` : ""}
                      </p>
                    </div>
                    {/* Quick actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      {!estaOculto ? (
                        <>
                          <SnackbarForm action={actualizarVerificacion}>
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="centroId" value={centro.id} />
                            <input
                              type="hidden"
                              name="verificado"
                              value={centro.verificado ? "false" : "true"}
                            />
                            <button
                              type="submit"
                              className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                                centro.verificado
                                  ? "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                  : "bg-blue-700 text-white shadow-sm hover:bg-blue-800"
                              }`}
                            >
                              {centro.verificado ? "Quitar verificación" : "Aprobar"}
                            </button>
                          </SnackbarForm>
                          <SnackbarForm action={ocultarCentro}>
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="centroId" value={centro.id} />
                            <button
                              type="submit"
                              className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-50"
                            >
                              Ocultar
                            </button>
                          </SnackbarForm>
                        </>
                      ) : (
                        <SnackbarForm action={mostrarCentro}>
                          <input type="hidden" name="token" value={token} />
                          <input type="hidden" name="centroId" value={centro.id} />
                          <button
                            type="submit"
                            className="rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                          >
                            Mostrar
                          </button>
                        </SnackbarForm>
                      )}
                    </div>
                  </div>

                  {/* Expandable details */}
                  {!estaOculto ? (
                    <details className="border-t border-zinc-50">
                      <summary className="cursor-pointer px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600">
                        Gestionar · {necesidades.length} insumo{necesidades.length !== 1 ? "s" : ""}
                      </summary>
                      <div className="space-y-3 px-4 pb-4">
                        {/* Needs list */}
                        {necesidades.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-zinc-100 text-left text-xs font-bold uppercase tracking-wide text-zinc-400">
                                  <th className="pb-1.5 pr-3">Insumo</th>
                                  <th className="pb-1.5 pr-3">Urgencia</th>
                                  <th className="pb-1.5"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-50">
                                {necesidades.map((necesidad) => (
                                  <tr key={necesidad.id} className="group">
                                    <td className="py-1.5 pr-3">
                                      <span className="font-semibold text-zinc-800">{necesidad.tipo_insumo}</span>
                                      {necesidad.detalle ? (
                                        <span className="ml-1 text-xs text-zinc-400">{necesidad.detalle}</span>
                                      ) : null}
                                    </td>
                                    <td className="py-1.5 pr-3">
                                      <SnackbarForm
                                        action={actualizarUrgencia}
                                        className="flex items-center gap-1"
                                      >
                                        <input type="hidden" name="token" value={token} />
                                        <input type="hidden" name="necesidadId" value={necesidad.id} />
                                        <select
                                          name="urgencia"
                                          defaultValue={necesidad.urgencia}
                                          className={`rounded border px-1.5 py-0.5 text-xs font-bold ${
                                            necesidad.urgencia === "URGENTE"
                                              ? "border-red-200 bg-red-50 text-red-700"
                                              : necesidad.urgencia === "MEDIA"
                                              ? "border-amber-200 bg-amber-50 text-amber-700"
                                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                          }`}
                                        >
                                          <option value="URGENTE">Urgente</option>
                                          <option value="MEDIA">Media</option>
                                          <option value="SATURADO">Saturado</option>
                                        </select>
                                        <button
                                          type="submit"
                                          className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100"
                                        >
                                          OK
                                        </button>
                                      </SnackbarForm>
                                    </td>
                                    <td className="py-1.5 text-right">
                                      <SnackbarForm action={eliminarNecesidadModeracion}>
                                        <input type="hidden" name="token" value={token} />
                                        <input type="hidden" name="centroId" value={centro.id} />
                                        <input type="hidden" name="necesidadId" value={necesidad.id} />
                                        <button
                                          type="submit"
                                          className="rounded px-2 py-0.5 text-[10px] font-bold text-red-600 opacity-0 hover:bg-red-50 group-hover:opacity-100"
                                        >
                                          Quitar
                                        </button>
                                      </SnackbarForm>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-400">Sin insumos registrados.</p>
                        )}

                        {/* Add need - compact inline */}
                        <SnackbarForm
                          action={agregarNecesidadModeracion}
                          className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 p-2"
                        >
                          <input type="hidden" name="token" value={token} />
                          <input type="hidden" name="centroId" value={centro.id} />
                          <select
                            name="categoriaId"
                            className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs"
                            required
                          >
                            <option value="">+ Agregar insumo</option>
                            {categoriasInsumo.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                            ))}
                          </select>
                          <select
                            name="urgencia"
                            defaultValue="MEDIA"
                            className="rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs"
                          >
                            <option value="URGENTE">Urgente</option>
                            <option value="MEDIA">Media</option>
                            <option value="SATURADO">Saturado</option>
                          </select>
                          <input
                            name="detalle"
                            placeholder="Detalle (opcional)"
                            className="min-w-0 flex-1 rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs"
                          />
                          <button
                            type="submit"
                            className="rounded bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800"
                          >
                            Agregar
                          </button>
                        </SnackbarForm>

                        {/* Edit centro form */}
                        <details className="rounded-lg border border-zinc-200 bg-zinc-50">
                          <summary className="cursor-pointer px-3 py-2 text-xs font-bold text-zinc-500">
                            Editar datos del centro
                          </summary>
                          <SnackbarForm
                            action={actualizarDetallesCentroModeracion}
                            className="grid gap-2 border-t border-zinc-200 p-3"
                          >
                            <input type="hidden" name="token" value={token} />
                            <input type="hidden" name="centroId" value={centro.id} />
                            <div className="grid gap-2 sm:grid-cols-2">
                              <label className="text-xs font-bold text-zinc-600">
                                Nombre
                                <input name="nombre" defaultValue={centro.nombre} required className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                              </label>
                              <label className="text-xs font-bold text-zinc-600">
                                Contacto
                                <input name="contacto" defaultValue={centro.contacto ?? ""} className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                              </label>
                            </div>
                            <label className="text-xs font-bold text-zinc-600">
                              Dirección
                              <input name="direccion" defaultValue={centro.direccion} required className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                            </label>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <label className="text-xs font-bold text-zinc-600">
                                Link Maps
                                <input name="ubicacion_url" type="url" defaultValue={centro.ubicacion_url ?? ""} placeholder="https://maps.google.com/..." className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                              </label>
                              <label className="text-xs font-bold text-zinc-600">
                                Vialidad
                                <input name="vialidad" defaultValue={centro.estado_vialidad ?? ""} className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                              </label>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-3">
                              <label className="text-xs font-bold text-zinc-600">
                                Inicio recepción
                                <input name="fecha_inicio_recepcion" type="date" defaultValue={centro.fecha_inicio_recepcion ?? ""} className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                              </label>
                              <label className="text-xs font-bold text-zinc-600">
                                Fin recepción
                                <input name="fecha_fin_recepcion" type="date" defaultValue={centro.fecha_fin_recepcion ?? ""} className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                              </label>
                              <label className="text-xs font-bold text-zinc-600">
                                Horario
                                <input name="horario_recepcion" defaultValue={centro.horario_recepcion ?? ""} placeholder="Lun-Sáb 8am-5pm" className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                              </label>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <label className="text-xs font-bold text-zinc-600">
                                Responsable
                                <input name="responsable_nombre" defaultValue={centro.responsable_nombre ?? ""} className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                              </label>
                              <label className="text-xs font-bold text-zinc-600">
                                Tel. responsable
                                <input name="responsable_telefono" defaultValue={centro.responsable_telefono ?? ""} className="mt-0.5 w-full rounded border border-zinc-300 bg-white px-2 py-1.5 text-xs" />
                              </label>
                            </div>
                            <button type="submit" className="w-full rounded bg-zinc-800 px-3 py-1.5 text-xs font-bold text-white sm:w-auto">
                              Guardar cambios
                            </button>
                          </SnackbarForm>
                        </details>
                      </div>
                    </details>
                  ) : null}
                </article>
              );
            })}
            </div>
          )}
        </section>
        </SnackbarShell>
      )}
    </div>
  );
}
