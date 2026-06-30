import { notFound, redirect } from "next/navigation";
import {
  actualizarDetallesCocina,
  actualizarUrgenciaNecesidadCocina,
  agregarNecesidadCocina,
  eliminarNecesidadCocina,
} from "@/app/cocinas/[cocinaId]/actions";
import { SnackbarForm } from "@/components/SnackbarForm";
import { SnackbarShell } from "@/components/SnackbarShell";
import { FoodOwnerNav } from "@/components/navigation/FoodOwnerNav";
import { CATEGORIAS_NECESIDAD_COCINA } from "@/lib/categorias-alimentacion";
import { getCocinaForManagement } from "@/lib/data-productores";
import { URGENCIA_STYLES } from "@/lib/semaforo";
import { isSupabaseConfigured } from "@/lib/supabase";

interface GestionCocinaPageProps {
  params: Promise<{ cocinaId: string }>;
  searchParams: Promise<{ codigo?: string }>;
}

export default async function GestionCocinaPage({
  params,
  searchParams,
}: GestionCocinaPageProps) {
  const { cocinaId } = await params;
  const { codigo: codigoRaw } = await searchParams;
  const codigo = codigoRaw?.trim() ?? "";

  if (!codigo) {
    redirect("/alimentacion/gestion");
  }

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const cocina = await getCocinaForManagement(cocinaId, codigo);

  if (!cocina) {
    notFound();
  }

  const necesidades = cocina.necesidades_cocina ?? [];
  const urgentes = necesidades.filter((n) => n.urgencia === "URGENTE").length;

  return (
    <SnackbarShell>
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
        <FoodOwnerNav />

        <header className="mb-6 border-b border-zinc-200 pb-4">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-500">
            Panel del responsable
          </p>
          <h1 className="text-2xl font-bold leading-tight">{cocina.nombre}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {cocina.municipios?.nombre} · {cocina.direccion}
          </p>
          {cocina.capacidad_beneficiarios ? (
            <p className="mt-1 text-sm font-semibold text-zinc-700">
              ~{cocina.capacidad_beneficiarios.toLocaleString("es-VE")} beneficiarios/día
            </p>
          ) : null}
          {cocina.ubicacion_url ? (
            <a
              href={cocina.ubicacion_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-blue-800 hover:text-blue-900"
            >
              Abrir ubicación en Maps
            </a>
          ) : null}
          {!cocina.verificado ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-bold">Tu cocina está pendiente de verificación.</p>
              <p className="mt-1">
                Puedes agregar necesidades aquí. Aparecerás en el directorio público
                cuando un moderador te verifique.
              </p>
            </div>
          ) : (
            <p className="mt-2 rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-900">
              Verificada — visible en el directorio público
            </p>
          )}
        </header>

        {necesidades.length < 3 ? (
          <section className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
            <p className="font-bold">Completa tu perfil de necesidades</p>
            <p className="mt-1">
              Agrega al menos 3 ingredientes para que los productores sepan cómo
              ayudarte. Tienes {necesidades.length} registrado
              {necesidades.length === 1 ? "" : "s"}.
            </p>
          </section>
        ) : null}

        {urgentes > 0 ? (
          <section className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-bold">
              {urgentes} ingrediente{urgentes === 1 ? "" : "s"} con urgencia alta
            </p>
            <p className="mt-1">
              Los productores verificados podrán ver estas necesidades en el directorio.
            </p>
          </section>
        ) : null}

        {/* Detalles */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold">Detalles de la cocina</h2>
          <SnackbarForm
            action={actualizarDetallesCocina}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <input type="hidden" name="cocinaId" value={cocinaId} />
            <input type="hidden" name="codigo" value={codigo} />

            <div className="mb-4 space-y-4">
              <div>
                <label htmlFor="contacto" className="mb-1.5 block text-sm font-bold">
                  Contacto público
                </label>
                <input
                  id="contacto"
                  name="contacto"
                  defaultValue={cocina.contacto ?? ""}
                  className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
                />
              </div>

              <div>
                <label htmlFor="ubicacion_url" className="mb-1.5 block text-sm font-bold">
                  Link de ubicación en Maps
                </label>
                <input
                  id="ubicacion_url"
                  name="ubicacion_url"
                  type="url"
                  inputMode="url"
                  defaultValue={cocina.ubicacion_url ?? ""}
                  placeholder="https://maps.google.com/..."
                  className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
                />
              </div>

              <div>
                <label htmlFor="horario" className="mb-1.5 block text-sm font-bold">
                  Horario de operación
                </label>
                <input
                  id="horario"
                  name="horario"
                  defaultValue={cocina.horario ?? ""}
                  placeholder="Ej. Lunes a viernes 7:00 a.m. a 2:00 p.m."
                  className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="capacidad_beneficiarios"
                  className="mb-1.5 block text-sm font-bold"
                >
                  Beneficiarios diarios
                </label>
                <input
                  id="capacidad_beneficiarios"
                  name="capacidad_beneficiarios"
                  type="number"
                  min="1"
                  defaultValue={cocina.capacidad_beneficiarios ?? ""}
                  placeholder="Ej. 150"
                  className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
                />
              </div>

              <div className="rounded bg-zinc-50 p-3 text-sm text-zinc-600">
                <p>
                  <strong>Responsable:</strong> {cocina.responsable_nombre}
                </p>
                <p>
                  <strong>Tel. privado:</strong> {cocina.responsable_telefono}
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

        {/* Ingredientes que necesita */}
        <section>
          <h2 className="mb-4 text-lg font-bold">Ingredientes que necesitamos</h2>

          <div className="mb-6 space-y-3">
            {necesidades.length === 0 ? (
              <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                No hay ingredientes registrados aún.
              </p>
            ) : (
              necesidades.map((necesidad) => (
                <div
                  key={necesidad.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="font-bold">{necesidad.categoria}</span>
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
                      action={actualizarUrgenciaNecesidadCocina}
                      className="flex flex-1 gap-2"
                    >
                      <input type="hidden" name="cocinaId" value={cocinaId} />
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

                    <SnackbarForm action={eliminarNecesidadCocina}>
                      <input type="hidden" name="cocinaId" value={cocinaId} />
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

          {/* Agregar ingrediente */}
          <SnackbarForm
            action={agregarNecesidadCocina}
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-5"
          >
            <input type="hidden" name="cocinaId" value={cocinaId} />
            <input type="hidden" name="codigo" value={codigo} />

            <h3 className="mb-4 text-base font-bold">Agregar ingrediente que necesito</h3>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="w-full">
                <label className="mb-1 block text-xs font-bold uppercase text-zinc-600">
                  Ingrediente / categoría
                </label>
                <select
                  name="categoria"
                  defaultValue={CATEGORIAS_NECESIDAD_COCINA[0]?.label ?? "Otros"}
                  className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2 text-base"
                >
                  {CATEGORIAS_NECESIDAD_COCINA.map((cat) => (
                    <option key={cat.label} value={cat.label}>
                      {cat.label}
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
                placeholder="Ej. 10 kg por semana, cualquier cantidad..."
                className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2 text-base"
              />
            </div>
            <button
              type="submit"
              disabled={!isSupabaseConfigured()}
              className="w-full rounded-lg bg-blue-800 px-4 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-blue-900 disabled:opacity-50 sm:w-auto"
            >
              + Agregar ingrediente
            </button>
          </SnackbarForm>
        </section>
      </div>
    </SnackbarShell>
  );
}
