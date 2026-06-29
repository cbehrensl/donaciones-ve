import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  actualizarDetallesCentro,
  actualizarUrgenciaNecesidad,
  agregarNecesidad,
  eliminarNecesidad,
} from "@/app/gestion/[centroId]/actions";
import { SnackbarForm } from "@/components/SnackbarForm";
import { SnackbarShell } from "@/components/SnackbarShell";
import { OwnerNav } from "@/components/navigation/OwnerNav";
import { getCentroForManagement } from "@/lib/data";
import { URGENCIA_STYLES } from "@/lib/semaforo";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { CentroAcopioPrivado, TipoInsumo } from "@/lib/types";

const TIPOS_INSUMO: TipoInsumo[] = [
  "Agua potable",
  "Alimentos no perecederos",
  "Medicamentos básicos",
  "Insumos médicos",
  "Fórmulas infantiles",
  "Ropa y calzado",
  "Colchonetas y ropa de cama",
  "Herramientas de rescate",
  "Equipos de comunicación",
  "Artículos de higiene",
  "Generadores y combustible",
  "Equipos médicos",
  "Voluntarios de rescate",
  "Voluntarios médicos",
  "Voluntarios logísticos",
];

interface GestionCentroPageProps {
  params: Promise<{ centroId: string }>;
  searchParams: Promise<{ codigo?: string }>;
}

async function loadCentro(
  centroId: string,
  codigo: string,
): Promise<CentroAcopioPrivado | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return getCentroForManagement(centroId, codigo);
}

export default async function GestionCentroPage({
  params,
  searchParams,
}: GestionCentroPageProps) {
  const { centroId } = await params;
  const { codigo: codigoRaw } = await searchParams;
  const codigo = codigoRaw?.trim() ?? "";

  if (!codigo) {
    redirect("/gestion");
  }

  const centro = await loadCentro(centroId, codigo);

  if (!centro) {
    notFound();
  }

  return (
    <SnackbarShell>
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
      <OwnerNav />
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <p className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-500">
          Panel del responsable
        </p>
        <h1 className="text-2xl font-bold leading-tight">{centro.nombre}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {centro.municipios?.nombre} · {centro.direccion}
        </p>
        {centro.fecha_inicio_recepcion || centro.fecha_fin_recepcion || centro.horario_recepcion ? (
          <p className="mt-2 text-sm font-semibold text-zinc-700">
            {centro.fecha_inicio_recepcion || centro.fecha_fin_recepcion
              ? `Recepción: ${centro.fecha_inicio_recepcion ?? "..." } a ${centro.fecha_fin_recepcion ?? "..."}`
              : null}
            {centro.horario_recepcion
              ? `${centro.fecha_inicio_recepcion || centro.fecha_fin_recepcion ? " · " : ""}Horario: ${centro.horario_recepcion}`
              : null}
          </p>
        ) : null}
        {centro.ubicacion_url ? (
          <a
            href={centro.ubicacion_url}
            target="_blank"
            rel="noopener noreferrer"
            className="cta-secondary mt-2 inline-block text-sm font-semibold text-blue-800"
          >
            Abrir ubicación en Maps
          </a>
        ) : null}
        {!centro.verificado ? (
          <p className="mt-2 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
            Pendiente de verificación por moderadores
          </p>
        ) : null}
      </header>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold">Detalles del centro</h2>
        <SnackbarForm
          action={actualizarDetallesCentro}
          className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <input type="hidden" name="centroId" value={centroId} />
          <input type="hidden" name="codigo" value={codigo} />

          <div className="mb-4 space-y-4">
            <div>
              <label htmlFor="contacto" className="mb-1.5 block text-sm font-bold">
                Contacto público
              </label>
              <input
                id="contacto"
                name="contacto"
                defaultValue={centro.contacto ?? ""}
                className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <label htmlFor="vialidad" className="mb-1.5 block text-sm font-bold">
                Estado de vialidad
              </label>
              <input
                id="vialidad"
                name="vialidad"
                defaultValue={centro.estado_vialidad ?? ""}
                className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              />
            </div>
            <div>
              <label
                htmlFor="ubicacion_url"
                className="mb-1.5 block text-sm font-bold"
              >
                Link de ubicación en Maps
              </label>
              <input
                id="ubicacion_url"
                name="ubicacion_url"
                type="url"
                inputMode="url"
                defaultValue={centro.ubicacion_url ?? ""}
                placeholder="https://maps.google.com/..."
                className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="fecha_inicio_recepcion"
                  className="mb-1.5 block text-sm font-bold"
                >
                  Fecha inicio de recepción
                </label>
                <input
                  id="fecha_inicio_recepcion"
                  name="fecha_inicio_recepcion"
                  type="date"
                  defaultValue={centro.fecha_inicio_recepcion ?? ""}
                  className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
                />
              </div>
              <div>
                <label
                  htmlFor="fecha_fin_recepcion"
                  className="mb-1.5 block text-sm font-bold"
                >
                  Fecha fin de recepción
                </label>
                <input
                  id="fecha_fin_recepcion"
                  name="fecha_fin_recepcion"
                  type="date"
                  defaultValue={centro.fecha_fin_recepcion ?? ""}
                  className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="horario_recepcion"
                className="mb-1.5 block text-sm font-bold"
              >
                Horario de recepción
              </label>
              <input
                id="horario_recepcion"
                name="horario_recepcion"
                defaultValue={centro.horario_recepcion ?? ""}
                placeholder="Ej. Lunes a sábado 8:00 a.m. a 5:00 p.m."
                className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
              />
            </div>
            <div className="rounded bg-zinc-50 p-3 text-sm text-zinc-600">
              <p>
                <strong>Responsable:</strong> {centro.responsable_nombre}
              </p>
              <p>
                <strong>Tel. privado:</strong> {centro.responsable_telefono}
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isSupabaseConfigured()}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50 sm:w-auto"
          >
            Guardar detalles
          </button>
        </SnackbarForm>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold">Insumos y necesidades</h2>

        <div className="mb-6 space-y-3">
          {(centro.necesidades ?? []).length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
              No hay necesidades registradas.
            </p>
          ) : (
            (centro.necesidades ?? []).map((necesidad) => (
              <div
                key={necesidad.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="font-bold">{necesidad.tipo_insumo}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${URGENCIA_STYLES[necesidad.urgencia]}`}
                  >
                    {necesidad.urgencia}
                  </span>
                </div>
                {necesidad.detalle ? (
                  <p className="mb-3 text-sm text-zinc-600">{necesidad.detalle}</p>
                ) : null}

                <div className="flex flex-col gap-2 sm:flex-row">
                  <SnackbarForm
                    action={actualizarUrgenciaNecesidad}
                    className="flex flex-1 gap-2"
                  >
                    <input type="hidden" name="centroId" value={centroId} />
                    <input type="hidden" name="codigo" value={codigo} />
                    <input type="hidden" name="necesidadId" value={necesidad.id} />
                    <select
                      name="urgencia"
                      defaultValue={necesidad.urgencia}
                      className="flex-1 rounded-lg border-2 border-zinc-300 px-2 py-2 text-sm font-semibold"
                    >
                      <option value="URGENTE">URGENTE</option>
                      <option value="MEDIA">MEDIA</option>
                      <option value="SATURADO">SATURADO</option>
                    </select>
                    <button
                      type="submit"
                      disabled={!isSupabaseConfigured()}
                      className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 disabled:opacity-50"
                    >
                      Actualizar
                    </button>
                  </SnackbarForm>

                  <SnackbarForm action={eliminarNecesidad}>
                    <input type="hidden" name="centroId" value={centroId} />
                    <input type="hidden" name="codigo" value={codigo} />
                    <input type="hidden" name="necesidadId" value={necesidad.id} />
                    <button
                      type="submit"
                      disabled={!isSupabaseConfigured()}
                      className="w-full rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50 sm:w-auto"
                    >
                      Eliminar
                    </button>
                  </SnackbarForm>
                </div>
              </div>
            ))
          )}
        </div>

        <SnackbarForm
          action={agregarNecesidad}
          className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
        >
          <input type="hidden" name="centroId" value={centroId} />
          <input type="hidden" name="codigo" value={codigo} />

          <h3 className="mb-4 text-base font-bold">Agregar insumo</h3>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="w-full">
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">
                Tipo
              </label>
              <select
                name="tipo_insumo"
                defaultValue="Agua potable"
                className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2 text-base"
              >
                {TIPOS_INSUMO.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">
                Urgencia
              </label>
              <select
                name="urgencia"
                defaultValue="MEDIA"
                className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2 text-base"
              >
                <option value="URGENTE">Urgente</option>
                <option value="MEDIA">Media</option>
                <option value="SATURADO">Saturado</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">
              Detalle (opcional)
            </label>
            <input
              name="detalle"
              placeholder="Ej. Tallas, cantidades..."
              className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={!isSupabaseConfigured()}
            className="w-full rounded-lg bg-blue-800 px-4 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-900 disabled:opacity-50 sm:w-auto"
          >
            + Agregar insumo
          </button>
        </SnackbarForm>
      </section>
    </div>
    </SnackbarShell>
  );
}
