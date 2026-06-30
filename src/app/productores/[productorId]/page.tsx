import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { actualizarDetallesProductor } from "@/app/productores/[productorId]/actions";
import { SnackbarForm } from "@/components/SnackbarForm";
import { SnackbarShell } from "@/components/SnackbarShell";
import { FoodOwnerNav } from "@/components/navigation/FoodOwnerNav";
import { CATEGORIA_PRODUCTOR_LABELS } from "@/lib/categorias-alimentacion";
import { getProductorForManagement } from "@/lib/data-productores";
import { isSupabaseConfigured } from "@/lib/supabase";
import type { CategoriaProductor } from "@/lib/types";

const CATEGORIAS: CategoriaProductor[] = [
  "proteinas",
  "vegetales",
  "frutas",
  "granos",
  "lacteos",
  "no_perecederos",
  "otros",
];

interface GestionProductorPageProps {
  params: Promise<{ productorId: string }>;
  searchParams: Promise<{ codigo?: string }>;
}

export default async function GestionProductorPage({
  params,
  searchParams,
}: GestionProductorPageProps) {
  const { productorId } = await params;
  const { codigo: codigoRaw } = await searchParams;
  const codigo = codigoRaw?.trim() ?? "";

  if (!codigo) {
    redirect("/alimentacion/gestion");
  }

  if (!isSupabaseConfigured()) {
    notFound();
  }

  const productor = await getProductorForManagement(productorId, codigo);

  if (!productor) {
    notFound();
  }

  return (
    <SnackbarShell>
      <div className="mx-auto min-h-screen max-w-2xl px-4 py-6">
        <FoodOwnerNav />

        <header className="mb-6 border-b border-zinc-200 pb-4">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-500">
            Panel del responsable
          </p>
          <h1 className="text-2xl font-bold leading-tight">{productor.nombre}</h1>
          <p className="mt-1 text-sm text-zinc-600">
            {productor.municipios?.nombre}
          </p>
          {!productor.verificado ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="font-bold">Tu registro está pendiente de verificación.</p>
              <p className="mt-1">
                Puedes actualizar tu información aquí. Aparecerás en el directorio
                público cuando un moderador te verifique.
              </p>
            </div>
          ) : (
            <p className="mt-2 rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-900">
              Verificado — visible en el directorio público
            </p>
          )}
        </header>

        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold">Detalles del productor</h2>
          <SnackbarForm
            action={actualizarDetallesProductor}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <input type="hidden" name="productorId" value={productorId} />
            <input type="hidden" name="codigo" value={codigo} />

            <div className="mb-4 space-y-4">
              <div>
                <label htmlFor="descripcion" className="mb-1.5 block text-sm font-bold">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={3}
                  defaultValue={productor.descripcion ?? ""}
                  placeholder="Cuéntanos qué produces y puedes aportar..."
                  className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
                />
              </div>

              <div>
                <label htmlFor="contacto" className="mb-1.5 block text-sm font-bold">
                  Contacto público
                </label>
                <input
                  id="contacto"
                  name="contacto"
                  defaultValue={productor.contacto ?? ""}
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
                  defaultValue={productor.ubicacion_url ?? ""}
                  placeholder="https://maps.google.com/..."
                  className="w-full rounded-lg border-2 border-zinc-300 px-3 py-2.5 text-base"
                />
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-bold">¿Qué puedes aportar?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CATEGORIAS.map((cat) => (
                    <label
                      key={cat}
                      className="flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2"
                    >
                      <input
                        type="checkbox"
                        name="categorias"
                        value={cat}
                        defaultChecked={productor.categorias.includes(cat)}
                        className="h-4 w-4"
                      />
                      <span className="text-sm font-semibold">
                        {CATEGORIA_PRODUCTOR_LABELS[cat]}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="rounded bg-zinc-50 p-3 text-sm text-zinc-600">
                <p>
                  <strong>Responsable:</strong> {productor.responsable_nombre}
                </p>
                <p>
                  <strong>Tel. privado:</strong> {productor.responsable_telefono}
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

        {productor.verificado ? (
          <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-bold text-emerald-900">
              ¿Buscas cocinas que necesiten tus insumos?
            </p>
            <Link
              href="/productores#demanda"
              className="mt-2 inline-block text-sm font-semibold text-emerald-800 underline"
            >
              Ver cocinas con necesidades →
            </Link>
          </section>
        ) : null}
      </div>
    </SnackbarShell>
  );
}
