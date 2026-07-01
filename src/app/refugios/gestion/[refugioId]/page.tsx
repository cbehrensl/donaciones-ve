import Link from "next/link";
import { notFound } from "next/navigation";
import { getRefugioForManagement } from "@/lib/data";
import { OwnerNav } from "@/components/navigation/OwnerNav";
import { SnackbarForm } from "@/components/SnackbarForm";
import { actualizarDetallesRefugio } from "./actions";

interface RefugioGestionPageProps {
  params: Promise<{ refugioId: string }>;
  searchParams: Promise<{ codigo?: string }>;
}

export default async function RefugioGestionPage({
  params,
  searchParams,
}: RefugioGestionPageProps) {
  const { refugioId } = await params;
  const { codigo } = await searchParams;

  if (!codigo) {
    return (
      <div className="mx-auto mt-10 max-w-md p-4 text-center">
        <h1 className="text-xl font-bold text-red-600">Acceso denegado</h1>
        <p className="mt-2 text-zinc-600">Falta el código de gestión.</p>
        <Link
          href="/refugios/gestion"
          className="mt-4 inline-block rounded-lg bg-purple-700 px-4 py-2 font-bold text-white"
        >
          Volver al login
        </Link>
      </div>
    );
  }

  const refugio = await getRefugioForManagement(refugioId, codigo);

  if (!refugio) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-50 pb-12">
      <div className="mx-auto max-w-3xl px-4 pt-6">
        <OwnerNav />
        <header className="mb-8 mt-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-zinc-900 sm:text-3xl">
              {refugio.nombre}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                refugio.activo
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {refugio.activo ? "Activo" : "Inactivo"}
            </span>
          </div>
          <p className="mt-2 text-sm text-zinc-500">
            {refugio.zona || "Sin zona"} {refugio.municipio ? `· ${refugio.municipio}` : ""}
          </p>
          {!refugio.confirmado ? (
            <p className="mt-2 rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
              Pendiente de verificación por moderadores
            </p>
          ) : null}
        </header>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold">Detalles del refugio</h2>
          <SnackbarForm
            action={actualizarDetallesRefugio}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <input type="hidden" name="refugioId" value={refugioId} />
            <input type="hidden" name="codigo" value={codigo} />

            <div className="mb-4 space-y-6">
              <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
                <h3 className="text-sm font-bold text-zinc-900">Contacto y Ubicación</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contacto_nombre" className="mb-1.5 block text-sm font-bold">
                      Nombre de contacto público
                    </label>
                    <input
                      id="contacto_nombre"
                      name="contacto_nombre"
                      defaultValue={refugio.contacto_nombre ?? ""}
                      placeholder="Ej. María Pérez"
                      className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="contacto_telefono" className="mb-1.5 block text-sm font-bold">
                      WhatsApp de contacto
                    </label>
                    <input
                      id="contacto_telefono"
                      name="contacto_telefono"
                      type="tel"
                      defaultValue={refugio.contacto_telefono ?? ""}
                      placeholder="0414-1234567"
                      className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-base"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="google_maps_url"
                    className="mb-1.5 block text-sm font-bold"
                  >
                    Link de ubicación en Maps
                  </label>
                  <input
                    id="google_maps_url"
                    name="google_maps_url"
                    type="url"
                    inputMode="url"
                    defaultValue={refugio.google_maps_url ?? ""}
                    placeholder="https://maps.google.com/..."
                    className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-base"
                  />
                </div>
              </div>

              <div className="space-y-4 rounded-xl border border-zinc-100 bg-zinc-50/80 p-4">
                <h3 className="text-sm font-bold text-zinc-900">Estado actual</h3>
                <div>
                  <label htmlFor="num_personas" className="mb-1.5 block text-sm font-bold">
                    Personas alojadas actualmente
                  </label>
                  <input
                    id="num_personas"
                    name="num_personas"
                    type="number"
                    min="0"
                    defaultValue={refugio.num_personas ?? ""}
                    placeholder="Ej. 50"
                    className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-base"
                  />
                </div>
                <div>
                  <label htmlFor="necesidades" className="mb-1.5 block text-sm font-bold">
                    Necesidades (separadas por comas)
                  </label>
                  <textarea
                    id="necesidades"
                    name="necesidades"
                    rows={3}
                    defaultValue={refugio.necesidades ?? ""}
                    placeholder="Agua, colchonetas, comida no perecedera..."
                    className="w-full rounded-lg border-2 border-zinc-300 bg-white px-3 py-2.5 text-base"
                  />
                </div>
              </div>

              <div className="rounded bg-zinc-50 p-3 text-sm text-zinc-600">
                <p>
                  <strong>Responsable registrado:</strong> {refugio.responsable_nombre}
                </p>
                <p>
                  <strong>Tel. privado:</strong> {refugio.responsable_telefono}
                </p>
              </div>

              <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="activo"
                    name="activo"
                    defaultChecked={refugio.activo}
                    className="mt-1 h-5 w-5 rounded border-zinc-300 text-purple-600 focus:ring-purple-600"
                  />
                  <label htmlFor="activo" className="flex flex-col">
                    <span className="font-bold text-zinc-900">Refugio activo</span>
                    <span className="text-sm text-zinc-500">
                      Desmarca esta opción si el refugio ya no está operando.
                    </span>
                  </label>
                </div>
                <div className="flex items-start gap-3 border-t border-zinc-100 pt-3">
                  <input
                    type="checkbox"
                    id="saturado"
                    name="saturado"
                    defaultChecked={refugio.saturado}
                    className="mt-1 h-5 w-5 rounded border-zinc-300 text-red-600 focus:ring-red-600"
                  />
                  <label htmlFor="saturado" className="flex flex-col">
                    <span className="font-bold text-red-700">Marcar como saturado</span>
                    <span className="text-sm text-zinc-500">
                      Indica que el refugio alcanzó su capacidad máxima y no puede recibir más personas.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-100 pt-4">
              <Link
                href="/refugios"
                className="text-sm font-semibold text-zinc-500 hover:text-zinc-800"
              >
                Volver al directorio
              </Link>
              <button
                type="submit"
                className="rounded-lg bg-purple-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-purple-800"
              >
                Guardar cambios
              </button>
            </div>
          </SnackbarForm>
        </section>
      </div>
    </main>
  );
}
