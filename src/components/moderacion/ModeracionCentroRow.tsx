import { SnackbarForm } from "@/components/SnackbarForm";
import { ALERTA_UI_CONFIG, calcularSemaforoDesdeAlertas } from "@/lib/alertas";
import { formatWhatsappHref } from "@/lib/contact-links";
import { SEMAFORO_DOT } from "@/lib/semaforo";
import type {
  AlertaCentro,
  CategoriaInsumo,
  CentroAcopio,
  SemafaroEstado,
} from "@/lib/types";
import {
  actualizarDetallesCentroModeracion,
  actualizarVerificacion,
  agregarNecesidadModeracion,
  crearAlertaModeracion,
  eliminarAlertaModeracion,
  eliminarNecesidadModeracion,
  mostrarCentro,
  ocultarCentro,
} from "@/app/moderacion/actions";

function getEstatusLabel(estatus?: string): string {
  if (estatus === "cerrado") return "Oculto";
  if (estatus === "sin_verificar") return "Sin verificar";
  if (estatus === "saturado") return "Saturado";
  return "Activo";
}

function getEstatusClass(estatus?: string): string {
  if (estatus === "cerrado") return "border-zinc-300 text-zinc-700";
  if (estatus === "sin_verificar") return "border-amber-300 text-amber-800";
  if (estatus === "saturado") return "border-emerald-300 text-emerald-800";
  return "border-blue-300 text-blue-800";
}

interface ModeracionCentroRowProps {
  centro: CentroAcopio;
  token: string;
  alertasCentro: AlertaCentro[];
  categoriasInsumo: CategoriaInsumo[];
}

export function ModeracionCentroRow({
  centro,
  token,
  alertasCentro,
  categoriasInsumo,
}: ModeracionCentroRowProps) {
  const semaforo: SemafaroEstado = calcularSemaforoDesdeAlertas(alertasCentro, {
    hasInsumos: (centro.necesidades ?? []).length > 0,
  });
  const estaOculto = centro.estatus === "cerrado";
  const necesidades = centro.necesidades ?? [];
  const urgentCount = alertasCentro.filter(
    (alerta) => alerta.tipo === "NECESIDAD_URGENTE",
  ).length;

  return (
    <article
      id={`centro-${centro.id}`}
      className={`scroll-mt-24 ${estaOculto ? "bg-zinc-50/50" : ""}`}
    >
      <div className="px-4 pt-3">
        <div className="flex min-w-0 gap-2">
          <span
            aria-hidden
            className={`mt-1.5 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${SEMAFORO_DOT[semaforo]}`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2
                className={`text-sm font-bold ${estaOculto ? "text-zinc-400 line-through" : "text-zinc-900"}`}
              >
                {centro.nombre}
              </h2>
              {!centro.verificado ? (
                <span className="rounded-full border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  Pendiente
                </span>
              ) : null}
              {urgentCount > 0 ? (
                <span className="rounded-full border border-red-300 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  {urgentCount} urgente{urgentCount > 1 ? "s" : ""}
                </span>
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">
              {centro.municipios?.nombre ?? "Sin municipio"} · {centro.direccion}
            </p>
            <span
              className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${getEstatusClass(centro.estatus)}`}
            >
              {getEstatusLabel(centro.estatus)}
            </span>
          </div>
        </div>
      </div>

      {!estaOculto ? (
        <details className="border-b border-zinc-100">
          <summary className="cursor-pointer px-4 py-3 text-sm font-bold text-zinc-600">
            Gestionar · {necesidades.length} insumo{necesidades.length !== 1 ? "s" : ""} ·{" "}
            {alertasCentro.length} alerta{alertasCentro.length !== 1 ? "s" : ""}
          </summary>
          <div className="space-y-4 px-4 pb-4">
            {alertasCentro.length > 0 ? (
              <div className="space-y-3">
                {(["NECESIDAD_URGENTE", "INSUMO_SATURADO"] as const).map((tipo) => {
                  const alertasPorTipo = alertasCentro.filter(
                    (alerta) => alerta.tipo === tipo,
                  );
                  if (alertasPorTipo.length === 0) return null;
                  const ui = ALERTA_UI_CONFIG[tipo];
                  return (
                    <div
                      key={tipo}
                      className={`border-l-4 pl-3 ${tipo === "NECESIDAD_URGENTE" ? "border-red-400" : "border-emerald-400"}`}
                    >
                      <p className="text-xs font-bold text-zinc-800">
                        {ui.shortLabel} ({alertasPorTipo.length})
                      </p>
                      <ul className="mt-2 space-y-2">
                        {alertasPorTipo.map((alerta) => (
                          <li
                            key={alerta.id}
                            className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
                          >
                            <p className="text-sm text-zinc-700">{alerta.mensaje}</p>
                            <SnackbarForm action={eliminarAlertaModeracion}>
                              <input type="hidden" name="token" value={token} />
                              <input type="hidden" name="centroId" value={centro.id} />
                              <input type="hidden" name="alertaId" value={alerta.id} />
                              <button
                                type="submit"
                                className="min-h-11 rounded-lg border border-red-300 px-3 text-xs font-bold text-red-700"
                              >
                                Eliminar
                              </button>
                            </SnackbarForm>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No hay alertas activas.</p>
            )}

            <SnackbarForm action={crearAlertaModeracion} className="space-y-2 rounded-lg border border-dashed border-zinc-200 p-3">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="centroId" value={centro.id} />
              <div className="grid gap-2 sm:grid-cols-2">
                <select
                  name="tipo"
                  defaultValue="NECESIDAD_URGENTE"
                  className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm"
                >
                  <option value="NECESIDAD_URGENTE">Necesita ayuda ahora</option>
                  <option value="INSUMO_SATURADO">No llevar por ahora</option>
                </select>
                <select
                  name="duracion_horas"
                  defaultValue="24"
                  className="min-h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm"
                >
                  <option value="6">6 horas</option>
                  <option value="12">12 horas</option>
                  <option value="24">24 horas</option>
                  <option value="72">3 días</option>
                  <option value="indefinida">Indefinida</option>
                </select>
              </div>
              <input
                name="mensaje"
                placeholder="Ej. Solo necesitamos agua potable hoy."
                className="min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                maxLength={220}
                required
              />
              <button
                type="submit"
                className="min-h-11 w-full rounded-lg bg-red-700 px-4 text-sm font-bold text-white"
              >
                Publicar aviso
              </button>
            </SnackbarForm>

            {necesidades.length > 0 ? (
              <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                {necesidades.map((necesidad) => (
                  <li
                    key={necesidad.id}
                    className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <span className="font-semibold text-zinc-800">
                        {necesidad.tipo_insumo}
                      </span>
                      {necesidad.detalle ? (
                        <p className="text-xs text-zinc-500">{necesidad.detalle}</p>
                      ) : null}
                    </div>
                    <SnackbarForm action={eliminarNecesidadModeracion}>
                      <input type="hidden" name="token" value={token} />
                      <input type="hidden" name="centroId" value={centro.id} />
                      <input type="hidden" name="necesidadId" value={necesidad.id} />
                      <button
                        type="submit"
                        className="min-h-11 text-sm font-semibold text-red-600"
                      >
                        Quitar
                      </button>
                    </SnackbarForm>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-zinc-500">Sin insumos registrados.</p>
            )}

            <SnackbarForm
              action={agregarNecesidadModeracion}
              className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-200 p-3 sm:flex-row sm:items-end"
            >
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="centroId" value={centro.id} />
              <select
                name="categoriaId"
                className="min-h-11 flex-1 rounded-lg border border-zinc-300 bg-white px-3 text-sm"
                required
              >
                <option value="">Agregar insumo</option>
                {categoriasInsumo.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <input
                name="detalle"
                placeholder="Detalle (opcional)"
                className="min-h-11 flex-1 rounded-lg border border-zinc-300 px-3 text-sm"
              />
              <button
                type="submit"
                className="min-h-11 rounded-lg bg-blue-800 px-4 text-sm font-bold text-white"
              >
                Agregar
              </button>
            </SnackbarForm>

            <details className="rounded-lg border border-zinc-200">
              <summary className="cursor-pointer px-3 py-3 text-sm font-bold text-zinc-600">
                Editar datos del centro
              </summary>
              <SnackbarForm
                action={actualizarDetallesCentroModeracion}
                className="space-y-2 border-t border-zinc-100 p-3"
              >
                <input type="hidden" name="token" value={token} />
                <input type="hidden" name="centroId" value={centro.id} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs font-bold text-zinc-600">
                    Nombre
                    <input
                      name="nombre"
                      defaultValue={centro.nombre}
                      required
                      className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                    />
                  </label>
                  <label className="text-xs font-bold text-zinc-600">
                    Contacto
                    <input
                      name="contacto"
                      defaultValue={centro.contacto ?? ""}
                      className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                    />
                  </label>
                </div>
                <label className="text-xs font-bold text-zinc-600">
                  Dirección
                  <input
                    name="direccion"
                    defaultValue={centro.direccion}
                    required
                    className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                  />
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs font-bold text-zinc-600">
                    Link Maps
                    <input
                      name="ubicacion_url"
                      type="url"
                      defaultValue={centro.ubicacion_url ?? ""}
                      className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                    />
                  </label>
                  <label className="text-xs font-bold text-zinc-600">
                    Horario
                    <input
                      name="horario_recepcion"
                      defaultValue={centro.horario_recepcion ?? ""}
                      className="mt-1 min-h-11 w-full rounded-lg border border-zinc-300 px-3 text-sm"
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  className="min-h-11 w-full rounded-lg bg-zinc-800 px-4 text-sm font-bold text-white sm:w-auto"
                >
                  Guardar cambios
                </button>
              </SnackbarForm>
            </details>

            {centro.contacto ? (
              <a
                href={formatWhatsappHref(centro.contacto)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-lg border border-emerald-300 px-4 text-sm font-bold text-emerald-800"
              >
                Contactar por WhatsApp
              </a>
            ) : null}
          </div>
        </details>
      ) : null}

      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row">
        {!estaOculto ? (
          <>
            <SnackbarForm action={actualizarVerificacion} className="w-full sm:flex-1">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="centroId" value={centro.id} />
              <input
                type="hidden"
                name="verificado"
                value={centro.verificado ? "false" : "true"}
              />
              <button
                type="submit"
                className={`min-h-11 w-full rounded-lg px-4 text-sm font-bold ${
                  centro.verificado
                    ? "border border-zinc-300 text-zinc-700"
                    : "bg-blue-800 text-white"
                }`}
              >
                {centro.verificado ? "Quitar verificación" : "Aprobar centro"}
              </button>
            </SnackbarForm>
            <SnackbarForm action={ocultarCentro} className="w-full sm:flex-1">
              <input type="hidden" name="token" value={token} />
              <input type="hidden" name="centroId" value={centro.id} />
              <button
                type="submit"
                className="min-h-11 w-full rounded-lg border border-red-300 px-4 text-sm font-bold text-red-700"
              >
                Ocultar
              </button>
            </SnackbarForm>
          </>
        ) : (
          <SnackbarForm action={mostrarCentro} className="w-full">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="centroId" value={centro.id} />
            <button
              type="submit"
              className="min-h-11 w-full rounded-lg border border-emerald-300 px-4 text-sm font-bold text-emerald-800"
            >
              Mostrar en la plataforma
            </button>
          </SnackbarForm>
        )}
      </div>
    </article>
  );
}
