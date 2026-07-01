import Link from "next/link";
import { SnackbarShell } from "@/components/SnackbarShell";
import { ModeracionCentroRow } from "@/components/moderacion/ModeracionCentroRow";
import { ModeracionChatbotPanel } from "@/components/moderacion/ModeracionChatbotPanel";
import { ModeracionFilterBar } from "@/components/moderacion/ModeracionFilterBar";
import { ModeracionOperativaPanel } from "@/components/moderacion/ModeracionOperativaPanel";
import { ModeracionPageHeader } from "@/components/moderacion/ModeracionPageHeader";
import {
  buildCentrosQuickFilters,
  buildRefugiosQuickFilters,
  ModeracionQuickFilters,
} from "@/components/moderacion/ModeracionQuickFilters";
import { ModeracionRefugioRow } from "@/components/moderacion/ModeracionRefugioRow";
import { ModeracionRefugiosResumenPanel } from "@/components/moderacion/ModeracionRefugiosResumenPanel";
import { ModeracionTabs } from "@/components/moderacion/ModeracionTabs";
import { StaffNav } from "@/components/navigation/StaffNav";
import {
  agruparAlertasActivasPorCentro,
  agruparAlertasPorCentro,
  splitVisibleAlertasByTipo,
} from "@/lib/alertas";
import {
  getCategoriasInsumo,
  getAlertasRecientes,
  getCentrosParaModeracion,
  getEstados,
  getRefugiosParaModeracion,
  getResumenModeracion,
  getResumenRefugiosModeracion,
} from "@/lib/data";
import {
  getModeratorAccessToken,
  isModeratorTokenValid,
} from "@/lib/moderacion-auth";
import { buildModeracionHref, parseModeracionTab } from "@/lib/moderacion-url";
import {
  isSupabaseConfigured,
  isSupabaseServiceConfigured,
} from "@/lib/supabase";
import type { ModeracionTab } from "@/lib/types";

export const revalidate = 15;

interface ModeracionPageProps {
  searchParams: Promise<{
    token?: string;
    tab?: string;
    q?: string;
    estatus?: string;
    verificacion?: string;
    actividad?: string;
    confirmacion?: string;
    saturacion?: string;
    estado?: string;
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

const ACTIVIDAD_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "activos", label: "Activos" },
  { value: "inactivos", label: "Inactivos" },
];

const CONFIRMACION_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "pendientes", label: "Pendientes" },
  { value: "confirmados", label: "Confirmados" },
];

const SATURACION_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "saturados", label: "Saturados" },
  { value: "normal", label: "Con capacidad" },
];

const EMPTY_META = {
  page: 0,
  pageSize: 20,
  hasNextPage: false,
  hasPrevPage: false,
  totalCount: null,
};

function buildFilterSummary(
  tab: ModeracionTab,
  filters: Record<string, string>,
  estados: { id: string; nombre: string }[],
): string | undefined {
  const parts: string[] = [];
  if (filters.q) parts.push(`búsqueda “${filters.q}”`);
  if (filters.estado) {
    const estado = estados.find((item) => item.id === filters.estado);
    if (estado) parts.push(estado.nombre);
  }
  if (tab === "centros") {
    if (filters.verificacion === "pendientes") parts.push("pendientes");
    if (filters.verificacion === "verificados") parts.push("verificados");
    if (filters.estatus === "cerrado") parts.push("ocultos");
    if (filters.estatus === "saturado") parts.push("saturados");
  } else {
    if (filters.confirmacion === "pendientes") parts.push("pendientes");
    if (filters.confirmacion === "confirmados") parts.push("confirmados");
    if (filters.actividad === "inactivos") parts.push("inactivos");
    if (filters.saturacion === "saturados") parts.push("saturados");
  }
  if (parts.length === 0) return undefined;
  return `Mostrando ${parts.join(" · ")}`;
}

export default async function ModeracionPage({
  searchParams,
}: ModeracionPageProps) {
  const PAGE_SIZE = 20;
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const activeTab = parseModeracionTab(params.tab);
  const textoFiltro = params.q?.trim().toLowerCase() ?? "";
  const estatusFiltro = params.estatus ?? "todos";
  const verificacionFiltro = params.verificacion ?? "todos";
  const actividadFiltro = params.actividad ?? "todos";
  const confirmacionFiltro = params.confirmacion ?? "todos";
  const saturacionFiltro = params.saturacion ?? "todos";
  const estadoFiltro = params.estado ?? "";
  const page =
    Number.isFinite(Number(params.page)) && Number(params.page) > 0
      ? Math.floor(Number(params.page))
      : 1;

  const hasToken = Boolean(getModeratorAccessToken());
  const hasSupabaseService = isSupabaseServiceConfigured();
  const isAuthorized = isModeratorTokenValid(token);

  const centrosFilters = {
    q: textoFiltro,
    estatus: estatusFiltro,
    verificacion: verificacionFiltro,
    estado: estadoFiltro,
  };
  const refugiosFilters = {
    q: textoFiltro,
    actividad: actividadFiltro,
    confirmacion: confirmacionFiltro,
    saturacion: saturacionFiltro,
    estado: estadoFiltro,
  };

  const [
    centrosResponse,
    refugiosResponse,
    resumen,
    resumenRefugios,
    categoriasInsumo,
    alertasRecientes,
    estados,
  ] =
    isAuthorized && hasSupabaseService
      ? await Promise.all([
          activeTab === "centros"
            ? getCentrosParaModeracion({
                q: textoFiltro,
                estatus: estatusFiltro,
                verificacion: verificacionFiltro,
                estadoId: estadoFiltro,
                page: page - 1,
                pageSize: PAGE_SIZE,
              })
            : Promise.resolve({ centros: [], meta: EMPTY_META }),
          activeTab === "refugios"
            ? getRefugiosParaModeracion({
                q: textoFiltro,
                actividad: actividadFiltro,
                confirmacion: confirmacionFiltro,
                saturacion: saturacionFiltro,
                estadoId: estadoFiltro,
                page: page - 1,
                pageSize: PAGE_SIZE,
              })
            : Promise.resolve({ refugios: [], meta: EMPTY_META }),
          getResumenModeracion(),
          getResumenRefugiosModeracion(),
          activeTab === "centros" ? getCategoriasInsumo() : Promise.resolve([]),
          activeTab === "centros" ? getAlertasRecientes(200) : Promise.resolve([]),
          getEstados(),
        ])
      : [
          { centros: [], meta: EMPTY_META },
          { refugios: [], meta: EMPTY_META },
          {
            total: 0,
            visibles: 0,
            pendientes: 0,
            verificados: 0,
            ocultos: 0,
            urgencias: 0,
          },
          {
            total: 0,
            activos: 0,
            inactivos: 0,
            pendientes: 0,
            confirmados: 0,
            saturados: 0,
          },
          [],
          [],
          [],
        ];

  const centros = centrosResponse.centros;
  const refugios = refugiosResponse.refugios;
  const activeMeta =
    activeTab === "centros" ? centrosResponse.meta : refugiosResponse.meta;

  const alertasActivas = alertasRecientes;
  const { urgentes, saturadas } = splitVisibleAlertasByTipo(alertasActivas);
  const alertasUrgentesAgrupadas = agruparAlertasPorCentro(urgentes);
  const alertasSaturadasAgrupadas = agruparAlertasPorCentro(saturadas);
  const alertasPorCentro = agruparAlertasActivasPorCentro(alertasActivas);

  const alertasUrgentes = urgentes.length;
  const alertasSaturacion = saturadas.length;
  const tasaVerificacion =
    resumen.visibles > 0
      ? Math.round((resumen.verificados / resumen.visibles) * 100)
      : 0;

  const centrosVisibles = centros.filter((centro) => centro.estatus !== "cerrado");
  const centrosConNecesidades = centrosVisibles.filter(
    (centro) => (centro.necesidades ?? []).length > 0,
  ).length;
  const centrosSinNecesidades = centrosVisibles.filter(
    (centro) => (centro.necesidades ?? []).length === 0,
  ).length;
  const municipiosPendientes = Array.from(
    centrosVisibles
      .filter((centro) => !centro.verificado)
      .reduce((map, centro) => {
        const nombre = centro.municipios?.nombre ?? "Sin municipio";
        map.set(nombre, (map.get(nombre) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
      .entries(),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const centrosConMasAlertas = Array.from(
    alertasActivas
      .reduce((map, alerta) => {
        const nombreCentro = alerta.centros_acopio?.nombre ?? "Centro sin nombre";
        map.set(nombreCentro, (map.get(nombreCentro) ?? 0) + 1);
        return map;
      }, new Map<string, number>())
      .entries(),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const centrosTabHref = buildModeracionHref(token, "centros", {}, 1);
  const refugiosTabHref = buildModeracionHref(token, "refugios", {}, 1);
  const clearHref = buildModeracionHref(token, activeTab, {}, 1);
  const prevHref = buildModeracionHref(
    token,
    activeTab,
    activeTab === "centros" ? centrosFilters : refugiosFilters,
    Math.max(1, page - 1),
  );
  const nextHref = buildModeracionHref(
    token,
    activeTab,
    activeTab === "centros" ? centrosFilters : refugiosFilters,
    page + 1,
  );
  const nuevoRefugioHref = `/staff/refugios/nuevo?${new URLSearchParams({ token }).toString()}`;
  const pendientesCentrosHref = buildModeracionHref(
    token,
    "centros",
    { verificacion: "pendientes" },
    1,
  );

  const filterSummary = buildFilterSummary(
    activeTab,
    activeTab === "centros"
      ? {
          q: textoFiltro,
          estado: estadoFiltro,
          verificacion: verificacionFiltro,
          estatus: estatusFiltro,
        }
      : {
          q: textoFiltro,
          estado: estadoFiltro,
          confirmacion: confirmacionFiltro,
          actividad: actividadFiltro,
          saturacion: saturacionFiltro,
        },
    estados,
  );

  const quickFilters =
    activeTab === "centros"
      ? buildCentrosQuickFilters(token, {
          verificacion: verificacionFiltro,
          estatus: estatusFiltro,
        })
      : buildRefugiosQuickFilters(token, {
          confirmacion: confirmacionFiltro,
          saturacion: saturacionFiltro,
          actividad: actividadFiltro,
        });

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6">
      {isAuthorized ? <StaffNav token={token} /> : null}
      <ModeracionPageHeader token={token} isAuthorized={isAuthorized} />

      {!isSupabaseConfigured() ? (
        <section className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Configura Supabase antes de usar moderación.
        </section>
      ) : null}

      {!hasSupabaseService ? (
        <section className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Falta <code>SUPABASE_SERVICE_ROLE_KEY</code>. Es necesaria para ver y
          verificar registros pendientes.
        </section>
      ) : null}

      {!hasToken ? (
        <section className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          Define <code>MODERADOR_ACCESS_TOKEN</code> en el servidor.
        </section>
      ) : null}

      {!isAuthorized ? (
        <section className="mx-auto max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-xl font-black text-zinc-900">Acceso de moderador</h2>
          <p className="mb-5 text-sm text-zinc-600">
            Ingresa la clave para entrar al panel.
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
              className="min-h-11 w-full rounded-lg border-2 border-zinc-300 px-3 text-base"
              required
            />
            <button
              type="submit"
              className="min-h-11 w-full rounded-lg bg-blue-800 px-4 text-base font-bold text-white"
            >
              Entrar
            </button>
          </form>
        </section>
      ) : (
        <SnackbarShell>
          <section className="space-y-4">
            <ModeracionTabs
              activeTab={activeTab}
              centrosHref={centrosTabHref}
              refugiosHref={refugiosTabHref}
              pendientesCentros={resumen.pendientes}
              pendientesRefugios={resumenRefugios.pendientes}
            />

            <ModeracionQuickFilters filters={quickFilters} />

            <ModeracionChatbotPanel token={token} />

            <ModeracionFilterBar
              tab={activeTab}
              token={token}
              defaultQuery={params.q ?? ""}
              defaultEstado={estadoFiltro}
              defaultEstatus={estatusFiltro}
              defaultVerificacion={verificacionFiltro}
              defaultActividad={actividadFiltro}
              defaultConfirmacion={confirmacionFiltro}
              defaultSaturacion={saturacionFiltro}
              estados={estados}
              estatusOptions={ESTATUS_OPTIONS}
              verificacionOptions={VERIFICACION_OPTIONS}
              actividadOptions={ACTIVIDAD_OPTIONS}
              confirmacionOptions={CONFIRMACION_OPTIONS}
              saturacionOptions={SATURACION_OPTIONS}
              resultsCount={
                activeTab === "centros" ? centros.length : refugios.length
              }
              resultsLabel={activeTab === "centros" ? "centros" : "refugios"}
              page={page}
              totalCount={activeMeta.totalCount}
              hasNextPage={activeMeta.hasNextPage}
              activeFilterSummary={filterSummary}
              clearHref={clearHref}
              prevHref={prevHref}
              nextHref={nextHref}
              hasPrevPage={activeMeta.hasPrevPage}
            />

            {activeTab === "centros" ? (
              <>
                {centros.length === 0 ? (
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                    <p>No hay centros que coincidan con este filtro.</p>
                    <Link
                      href={pendientesCentrosHref}
                      className="mt-3 inline-flex min-h-11 items-center rounded-full border border-amber-300 px-4 text-xs font-bold text-amber-900"
                    >
                      Ver pendientes
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {centros.map((centro) => (
                      <div
                        key={centro.id}
                        className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
                      >
                        <ModeracionCentroRow
                          centro={centro}
                          token={token}
                          alertasCentro={alertasPorCentro.get(centro.id) ?? []}
                          categoriasInsumo={categoriasInsumo}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <ModeracionOperativaPanel
                  resumen={resumen}
                  alertasUrgentes={alertasUrgentes}
                  alertasSaturacion={alertasSaturacion}
                  tasaVerificacion={tasaVerificacion}
                  centrosConNecesidades={centrosConNecesidades}
                  centrosSinNecesidades={centrosSinNecesidades}
                  municipiosPendientes={municipiosPendientes}
                  centrosConMasAlertas={centrosConMasAlertas}
                  urgentesAgrupadas={alertasUrgentesAgrupadas}
                  saturadasAgrupadas={alertasSaturadasAgrupadas}
                  hasAlertas={alertasActivas.length > 0}
                />
              </>
            ) : (
              <>
                {refugios.length === 0 ? (
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
                    <p>No hay refugios que coincidan con este filtro.</p>
                    <Link
                      href={nuevoRefugioHref}
                      className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-purple-800 px-4 text-sm font-bold text-white"
                    >
                      + Crear refugio
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {refugios.map((refugio) => (
                      <div
                        key={refugio.id}
                        className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
                      >
                        <ModeracionRefugioRow
                          refugio={refugio}
                          token={token}
                          estadoNombre={
                            estados.find(
                              (estado) => Number(estado.id) === refugio.estado_id,
                            )?.nombre ?? null
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                <ModeracionRefugiosResumenPanel
                  resumen={resumenRefugios}
                  nuevoRefugioHref={nuevoRefugioHref}
                />
              </>
            )}

          </section>
        </SnackbarShell>
      )}
    </div>
  );
}
