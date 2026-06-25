import Link from "next/link";
import { getCentrosParaModeracion, getResumenModeracion } from "@/lib/data";
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
  actualizarUrgencia,
  actualizarVerificacion,
  mostrarCentro,
  ocultarCentro,
} from "@/app/moderacion/actions";

export const revalidate = 15;

interface ModeracionPageProps {
  searchParams: Promise<{
    token?: string;
    estatus?: string;
    verificacion?: string;
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
  const params = await searchParams;
  const token = params.token?.trim() ?? "";
  const estatusFiltro = params.estatus ?? "todos";
  const verificacionFiltro = params.verificacion ?? "todos";
  const hasToken = Boolean(getModeratorAccessToken());
  const hasSupabaseService = isSupabaseServiceConfigured();
  const isAuthorized = isModeratorTokenValid(token);
  const [centros, resumen] =
    isAuthorized && hasSupabaseService
      ? await Promise.all([getCentrosParaModeracion(), getResumenModeracion()])
      : [
          [],
          {
            total: 0,
            visibles: 0,
            pendientes: 0,
            verificados: 0,
            ocultos: 0,
            urgencias: 0,
          },
        ];
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
  const centrosFiltrados = centros.filter((centro) => {
    if (estatusFiltro !== "todos" && centro.estatus !== estatusFiltro) {
      return false;
    }

    if (verificacionFiltro === "pendientes" && centro.verificado) {
      return false;
    }

    if (verificacionFiltro === "verificados" && !centro.verificado) {
      return false;
    }

    return true;
  });

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
            Ingresa la clave configurada en <code>MODERADOR_ACCESS_TOKEN</code>{" "}
            para entrar al dashboard.
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
              reportadas.
            </p>
          </div>

          <form
            method="get"
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <input type="hidden" name="token" value={token} />
            <h2 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-700">
              Filtrar centros
            </h2>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
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
            <p className="mt-3 text-sm text-zinc-600">
              Mostrando <strong>{centrosFiltrados.length}</strong> de{" "}
              <strong>{centros.length}</strong> centros.
            </p>
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
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span
                        aria-hidden
                        className={`inline-block h-3 w-3 rounded-full ${SEMAFORO_DOT[semaforo]}`}
                      />
                      {SEMAFORO_LABELS[semaforo]}
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {!estaOculto ? (
                      <>
                        <form action={actualizarVerificacion}>
                          <input type="hidden" name="token" value={token} />
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
                          <input type="hidden" name="token" value={token} />
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
                        <input type="hidden" name="token" value={token} />
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
                            <input type="hidden" name="token" value={token} />
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
